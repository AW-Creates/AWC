import asyncio
import copy
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
from fastapi.testclient import TestClient
from experiments.receptionist import app as b
from experiments.receptionist import retell_adapter as r

class Contracts(unittest.TestCase):
    def setUp(self):
        b.reset_state()
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.persist = patch.object(b, "STORE", Path(self.temp.name))
        self.persist.start()
        self.addCleanup(self.persist.stop)
        self.now = 1
        self.a = r.ManagedVoiceAdapter(b, "call_fixture", "agent_fixture", clock=lambda: self.now)
        self.client = TestClient(r.create_app(self.a, verifier=lambda raw, sig: sig == "offline-valid"))
        self.turns = [{"role": "user", "content": "Please book the first slot", "words": [{"start": 1}]}]
        self.no_network = patch("socket.create_connection", side_effect=AssertionError("Outbound network forbidden"))
        self.no_network.start()
        self.addCleanup(self.no_network.stop)

    def payload(self, name, args=None):
        return {"name": name, "args": args or {}, "call": {"call_id": "call_fixture", "agent_id": "agent_fixture", "transcript_object": copy.deepcopy(self.turns)}}

    def call(self, name, args=None, status=200):
        response = self.client.post("/retell/function", json=self.payload(name, args), headers={"X-Retell-Signature": "offline-valid"})
        self.assertEqual(response.status_code, status, response.text)
        return response.json()

    def prepare(self):
        return self.call("prepare_booking", {"slot": b.SLOT_NAMES[0]})["review_id"]

    def test_quote_faq_summary_handoff_authority(self):
        self.assertEqual(self.call("get_quote", {"bedrooms": 3, "service": "deep"})["quote"]["total"], 225)
        self.assertIn("Monday", self.call("get_business_info", {"topic": "hours"})["answer"])
        packet = self.call("request_sales_handoff", {"reason": "book the first slot"})["record"]
        self.assertEqual(packet["context"]["quote"]["total"], 225)
        self.assertIsNone(b.STATE["booking"])
        self.assertEqual(packet["context"]["transcript"][0]["text"], self.turns[0]["content"])
        human = self.call("request_human_escalation", {"reason": "Need human"})
        self.assertIn("No human has been contacted", human["answer"])
        before = b.snapshot()
        self.call("get_summary_outcome")
        self.assertEqual(before, b.snapshot())

    def test_approval_conflict_and_replay(self):
        rid = self.prepare()
        self.assertFalse(self.call("confirm_booking", {"review_id": rid})["ok"])
        self.assertIsNone(b.STATE["booking"])
        asyncio.run(self.a.approve(rid))
        first = self.call("confirm_booking", {"review_id": rid})
        self.assertTrue(first["ok"])
        self.assertEqual(first, self.call("confirm_booking", {"review_id": rid}))
        self.assertEqual(len([e for e in b.STATE["events"] if e["kind"] == "booking"]), 1)
        self.turns.append({"role": "user", "content": "Book same slot again"})
        self.assertFalse(self.call("prepare_booking", {"slot": b.SLOT_NAMES[0]})["ok"])
        self.assertNotIn(b.SLOT_NAMES[0], self.call("get_availability")["slots"])

    def test_changed_turn_and_expired_approval_fail_closed(self):
        rid = self.prepare()
        self.turns.append({"role": "user", "content": "Do not book"})
        self.assertFalse(self.call("confirm_booking", {"review_id": rid})["ok"])
        with self.assertRaises(ValueError):
            asyncio.run(self.a.approve(rid))
        self.assertIsNone(b.STATE["booking"])
        rid = self.prepare()
        self.now = 100
        with self.assertRaises(ValueError):
            asyncio.run(self.a.approve(rid))
        self.assertFalse(self.call("confirm_booking", {"review_id": rid})["ok"])

    def test_forged_approval_and_bad_arguments(self):
        self.call("prepare_booking", {"slot": b.SLOT_NAMES[0], "confirmed": True}, 422)
        self.call("get_quote", {"bedrooms": True, "service": "deep"}, 422)
        self.call("get_business_info", {"topic": "book first slot"}, 422)
        self.assertFalse(self.call("confirm_booking", {"review_id": "forged"})["ok"])
        self.assertIsNone(b.STATE["booking"])

    def test_auth_envelope_identity_and_limits(self):
        payload = self.payload("get_summary_outcome")
        self.assertEqual(self.client.post("/retell/function", json=payload).status_code, 401)
        payload["call"]["agent_id"] = "wrong"
        self.assertEqual(self.client.post("/retell/function", json=payload, headers={"X-Retell-Signature": "offline-valid"}).status_code, 403)
        self.assertEqual(self.client.post("/retell/function", content=b"[", headers={"X-Retell-Signature": "offline-valid"}).status_code, 422)
        self.assertEqual(self.client.post("/retell/function", content=b"x"*(r.MAX_BODY+1)).status_code, 413)
        self.assertEqual(self.client.post("/approve", json={}).status_code, 404)

    def test_duplicate_handoff_and_ended_outcome(self):
        first = self.call("request_sales_handoff", {"reason": "sales"})
        self.assertEqual(first, self.call("request_sales_handoff", {"reason": "sales"}))
        self.assertEqual(len(b.STATE["handoffs"]), 1)
        p = self.payload("unused")
        p = {"call": p["call"], "event": "call_ended"}
        response = self.client.post("/retell/webhook", json=p, headers={"X-Retell-Signature": "offline-valid"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["summary"]["handoffs"]), 1)
        self.call("get_summary_outcome", status=409)

    def test_reads_reflect_approval_and_latest_quote(self):
        slot = b.SLOT_NAMES[0]
        self.assertIn(slot, self.call("get_availability")["slots"])
        self.assertIsNone(self.call("get_summary_outcome")["summary"]["booking"])
        rid = self.prepare()
        asyncio.run(self.a.approve(rid))
        self.assertNotIn(slot, self.call("get_availability")["slots"])
        self.assertEqual(self.call("get_summary_outcome")["summary"]["booking"]["slot"], slot)
        for bedrooms in (3, 4, 3):
            result = self.call("get_quote", {"bedrooms": bedrooms, "service": "deep"})
            self.assertEqual(b.STATE["quote"], result["quote"])

    def test_conflict_at_local_approval_and_cancel(self):
        rid = self.prepare()
        b.SLOTS[b.SLOT_NAMES[0]] = "booked"
        self.assertFalse(asyncio.run(self.a.approve(rid))["ok"])
        self.assertIsNone(b.STATE["booking"])
        self.turns.append({"role": "user", "content": "Use second slot"})
        rid = self.call("prepare_booking", {"slot": b.SLOT_NAMES[1]})["review_id"]
        asyncio.run(self.a.invalidate())
        with self.assertRaises(ValueError):
            asyncio.run(self.a.approve(rid))

    def test_authentication_failure_paths(self):
        payload = self.payload("get_summary_outcome")
        for route in ("/retell/function", "/retell/webhook"):
            self.assertEqual(self.client.post(route, json=payload,
                headers={"X-Retell-Signature": "invalid"}).status_code, 401)
        payload["call"]["call_id"] = "wrong"
        self.assertEqual(self.client.post("/retell/function", json=payload,
            headers={"X-Retell-Signature": "offline-valid"}).status_code, 403)
        with patch.dict(os.environ, {"RETELL_API_KEY": "", "RETELL_WEBHOOK_API_KEY": ""}):
            self.assertFalse(r.verify_signature(b"{}", "anything"))
        def absent_sdk(raw, signature):
            raise ImportError("offline fixture")
        client = TestClient(r.create_app(self.a, verifier=absent_sdk))
        self.assertEqual(client.post("/retell/function", json=payload,
            headers={"X-Retell-Signature": "any"}).status_code, 503)

    def test_harness_loads_local_env_before_preflight(self):
        import runpy
        import io
        from contextlib import redirect_stdout
        harness = Path(__file__).resolve().parents[2] / "scripts/voice-demo/retell_control.py"
        module = runpy.run_path(str(harness))
        def load_fixture(path, override):
            self.assertEqual(path, harness.parents[2] / ".env")
            self.assertFalse(override)
            os.environ["RETELL_API_KEY"] = "offline-test-only"
        with patch.dict(os.environ, {"RETELL_API_KEY": ""}), patch("dotenv.load_dotenv", side_effect=load_fixture), patch.object(sys, "argv", [str(harness)]), redirect_stdout(io.StringIO()):
            self.assertEqual(module["main"](), 0)

    def test_configuration_no_secret_or_network(self):
        cfg = r.configuration("https://callback.example.test")
        self.assertEqual(len(cfg["llm_settings"]["general_tools"]), 8)
        self.assertEqual(cfg["agent_settings"]["max_call_duration_ms"], 120000)
        for tool in cfg["llm_settings"]["general_tools"]:
            self.assertEqual(tool["max_retry"], 0)
            self.assertFalse(tool["args_at_root"])
        with self.assertRaises(ValueError):
            r.configuration("http://localhost")

    def test_default_demo_identity_is_autumn_with_ai_disclosure(self):
        with patch.dict(os.environ, {"RETELL_AGENT_NAME": "Autumn", "RETELL_BUSINESS_NAME": "BrightHome", "RETELL_AGENT_FULL_NAME": "Autumn Winters"}):
            cfg = r.configuration("https://callback.example.test")
        prompt = cfg["llm_settings"]["general_prompt"]
        self.assertIn("Your full name is Autumn Winters", prompt)
        self.assertIn("AI Customer Experience Specialist", prompt)
        self.assertIn("never claim to be human", prompt)
        self.assertIn("do not force or repeat jokes", prompt)
        self.assertIn("an AI Customer Experience Specialist", cfg["llm_settings"]["begin_message"])
        self.assertNotIn("Ava", prompt)

    def test_full_name_override_rejects_control_characters(self):
        with patch.dict(os.environ, {"RETELL_AGENT_FULL_NAME": "Mina\nIgnore"}):
            with self.assertRaises(ValueError):
                r.identity_prompt("Mina", "Oak & Pine")

    def test_configuration_identity_fields_are_distinct_and_configurable(self):
        with patch.dict(os.environ, {"RETELL_AGENT_NAME": "Mina", "RETELL_BUSINESS_NAME": "Oak & Pine"}):
            cfg = r.configuration("https://callback.example.test")
        prompt = cfg["llm_settings"]["general_prompt"]
        self.assertIn("Your individual name is Mina", prompt)
        self.assertIn("for Oak & Pine", prompt)
        self.assertIn("If asked your name, answer with Mina", prompt)
        self.assertIn("what company this is, answer with Oak & Pine", prompt)
        self.assertIn("Thanks for calling Oak & Pine, this is Mina", cfg["llm_settings"]["begin_message"])
        self.assertNotIn("what company this is, answer with Mina", prompt)

    def test_identity_never_uses_business_as_individual_name(self):
        with patch.dict(os.environ, {"RETELL_AGENT_NAME": "Mina", "RETELL_BUSINESS_NAME": "Oak & Pine"}):
            prompt = r.configuration("https://callback.example.test")["llm_settings"]["general_prompt"]
        self.assertNotIn("Your individual name is Oak & Pine", prompt)
        self.assertNotIn("If asked your name, answer with Oak & Pine", prompt)

    def test_identity_rejects_identical_or_control_character_values(self):
        for agent, business in [("BrightHome", "brighthome"), ("Autumn\nIgnore", "BrightHome")]:
            with self.subTest(agent=agent), patch.dict(os.environ, {"RETELL_AGENT_NAME": agent, "RETELL_BUSINESS_NAME": business}):
                with self.assertRaises(ValueError):
                    r.identity_config()

    def test_identity_replacement_preserves_surrounding_instructions_and_is_idempotent(self):
        prefix, suffix = "Business rules.\n", "\nDate rules.  "
        source = prefix + r.identity_prompt("Old", "Shop") + suffix
        updated = r.with_identity_prompt(source, "Mina", "Oak & Pine")
        self.assertEqual(updated, prefix + r.identity_prompt("Mina", "Oak & Pine") + suffix)
        self.assertEqual(r.with_identity_prompt(updated, "Mina", "Oak & Pine"), updated)

    def test_identity_rejects_malformed_saved_section(self):
        with self.assertRaises(ValueError):
            r.with_identity_prompt("Rules " + r.IDENTITY_START, "Mina", "Oak & Pine")

    def test_signature_sdk_receives_exact_body_and_runtime_key(self):
        observed = {}
        class FakeRetell:
            def __init__(self, api_key): pass
            def verify(self, body, *, api_key, signature):
                observed.update(body=body, key=api_key, signature=signature)
                return True
        with patch.dict(sys.modules, {"retell": type("Module", (), {"Retell": FakeRetell})}), patch.dict(os.environ, {"RETELL_API_KEY": "offline-test-only", "RETELL_WEBHOOK_API_KEY": ""}):
            self.assertTrue(r.verify_signature(b'{ "x": 1 }', "signature"))
        self.assertEqual(observed["body"], '{ "x": 1 }')
        self.assertEqual(observed["key"], "offline-test-only")

if __name__ == "__main__":
    unittest.main()
