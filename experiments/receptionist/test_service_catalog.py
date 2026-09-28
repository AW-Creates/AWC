import json
import copy
import asyncio
from unittest.mock import patch
import tempfile
import unittest
from pathlib import Path

from . import service_catalog as catalog
from .retell_adapter import FAQ, TOOLS


class ServiceCatalogTests(unittest.TestCase):
    def test_profile_has_bounded_primary_services_and_separate_addons(self):
        self.assertEqual(catalog.PROFILE["business_name"], "BrightHome")
        self.assertEqual(catalog.PROFILE["agent_name"], "Ava")
        self.assertGreaterEqual(len(catalog.list_services()), 5)
        self.assertLessEqual(len(catalog.list_services()), 8)
        self.assertTrue(catalog.PROFILE["add_ons"])
        self.assertNotIn("oven", {item["id"] for item in catalog.list_services()})

    def test_alias_lookup_is_exact_after_normalization(self):
        self.assertEqual(catalog.lookup("DEEP-CLEAN")['id'], "deep")
        self.assertEqual(catalog.lookup("  move out  ")['id'], "move_in_out")
        self.assertIsNone(catalog.lookup("deep cleaning plus plumbing"))

    def test_explanation_includes_scope_and_addon_is_not_a_service_quote(self):
        deep = catalog.explain_service("deep")
        self.assertIn("Included:", deep)
        self.assertIn("Excluded:", deep)
        addon = catalog.explain_service("inside oven")
        self.assertIn("controlled add-on", addon)
        self.assertIn("not a standalone service", addon)

    def test_unknown_and_invalid_compare_are_conservative(self):
        unknown = catalog.answer("service", "plumbing")
        self.assertIn("verified catalog entry", unknown)
        self.assertIn("won't guess", unknown)
        self.assertIn("only compare verified primary services", catalog.compare("oven", "deep"))
        self.assertIn("only compare verified primary services", catalog.compare("deep", "plumbing"))

    def test_retell_business_info_schema_supports_catalog_topics_without_new_tool(self):
        self.assertIn("get_business_info", TOOLS)
        self.assertEqual(len(TOOLS), 8)
        parsed = FAQ.model_validate({"topic": "service", "service": "deep cleaning"})
        self.assertEqual(parsed.service, "deep cleaning")
        self.assertEqual(FAQ.model_validate({"topic": "services"}).topic, "services")

    def test_invalid_catalog_file_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.json"
            path.write_text(json.dumps({"services": [{"id": "only"}]}), encoding="utf-8")
            with self.assertRaises(ValueError):
                catalog.load_config(path)

    def test_ambiguous_addon_alias_and_quote_mismatch_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'profile.json'
            profile = copy.deepcopy(catalog.PROFILE)
            profile['add_ons'][0]['aliases'].append('deep')
            path.write_text(json.dumps(profile))
            with self.assertRaisesRegex(ValueError, 'ambiguous'): catalog.load_config(path)
            profile = copy.deepcopy(catalog.PROFILE)
            profile['quote_supported_services'].append('office')
            path.write_text(json.dumps(profile))
            with self.assertRaisesRegex(ValueError, 'quote'): catalog.load_config(path)

    def test_config_drives_addon_listing_slots_and_quote_examples(self):
        from . import app as b
        self.assertEqual(b.SLOT_NAMES, catalog.PROFILE['slots'])
        for scenario in catalog.PROFILE['quote_scenarios']:
            self.assertEqual(b.quote(b.QuoteRequest(bedrooms=scenario['bedrooms'], service=scenario['service']))['total'], scenario['expected_total'])
        changed = copy.deepcopy(catalog.CONFIG)
        changed['add_ons'][0]['name'] = 'Configured appliance option'
        with patch.object(catalog, 'CONFIG', changed):
            self.assertIn('Configured appliance option', catalog.answer('services'))
        copied = catalog.list_services()
        copied[0]['included'].append('unverified')
        self.assertNotIn('unverified', catalog.CONFIG['services'][0]['included'])

    def test_adapter_compare_unknown_and_stale_review_do_not_mutate_booking(self):
        from . import app as b
        from .retell_adapter import ManagedVoiceAdapter
        b.reset_state()
        adapter = ManagedVoiceAdapter(b, 'fixture', 'fixture')
        async def run():
            result = await adapter._execute('get_business_info', {'topic':'compare','service':'standard','compare_to':'deep'}, '', '')
            self.assertIn('baseboards', result['answer'])
            result = await adapter._execute('get_business_info', {'topic':'compare','service':'deep'}, '', '')
            self.assertIn('only compare verified', result['answer'])
            result = await adapter._execute('get_business_info', {'topic':'service','service':'pool cleaning'}, '', '')
            self.assertIn("won't guess", result['answer'])
            result = await adapter._execute('confirm_booking', {'review_id':'missing'}, '', '')
            self.assertFalse(result['ok'])
            self.assertIn('availability is unknown', result['error'])
            self.assertIn('Ask permission', result['error'])
            self.assertIsNone(b.STATE['booking'])
        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
