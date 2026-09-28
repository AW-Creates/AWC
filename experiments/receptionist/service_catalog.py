"""Config-driven, conservative BrightHome service knowledge."""
from __future__ import annotations
import json
import copy
from datetime import datetime
from pathlib import Path
from typing import Any

CONFIG_PATH = Path(__file__).with_name("demo_business.json")

def load_config(path: Path = CONFIG_PATH) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not data.get("services") or not 5 <= len(data["services"]) <= 8:
        raise ValueError("demo catalog must contain 5-8 primary services")
    for field in ('agent_name', 'business_name', 'hours', 'service_area', 'insurance', 'policies', 'handoff_rules'):
        if not isinstance(data.get(field), str) or not data[field].strip():
            raise ValueError('missing profile field: ' + field)
    slots = data.get('slots')
    if not isinstance(slots, list) or len(slots) != 2 or len(set(slots)) != len(slots):
        raise ValueError('two distinct mock slots required by this demo')
    for slot in slots:
        datetime.strptime(slot, '%Y-%m-%d %H:%M')
    required = {'id', 'name', 'aliases', 'description', 'included', 'excluded'}
    ids, aliases = set(), {}
    for item in data['services'] + data.get('add_ons', []):
        if not required <= item.keys() or item['id'] in ids:
            raise ValueError('invalid service entry')
        for field in ('id', 'name', 'description'):
            if not isinstance(item[field], str) or not item[field].strip():
                raise ValueError('invalid service text')
        for field in ('aliases', 'included', 'excluded'):
            if not isinstance(item[field], list) or not all(isinstance(v, str) and v.strip() for v in item[field]):
                raise ValueError('invalid service scope')
        ids.add(item['id'])
        for value in [item['id'], item['name'], *item['aliases']]:
            key = ' '.join(value.casefold().replace('-', ' ').split())
            if key in aliases and aliases[key] != item['id']:
                raise ValueError('ambiguous service alias')
            aliases[key] = item['id']
    primary_ids = {item['id'] for item in data['services']}
    if set(data.get('quote_supported_services', [])) != {'standard', 'deep'} or not {'standard', 'deep'} <= primary_ids:
        raise ValueError('quote services must match authoritative standard/deep tools')
    return data

CONFIG = load_config()
PROFILE = CONFIG

def _norm(value: str) -> str:
    return " ".join(value.casefold().replace("-", " ").split())

def _find(value: str):
    key = _norm(value)
    for item in CONFIG["services"] + CONFIG.get("add_ons", []):
        if key == _norm(item["id"]) or key == _norm(item["name"]) or any(key == _norm(a) for a in item.get("aliases", [])):
            return item
    return None

def lookup(service: str) -> dict[str, Any] | None:
    item = _find(service)
    return copy.deepcopy(item) if item else None

def answer(topic: str, service: str | None = None) -> str:
    topic = _norm(topic)
    if topic in {"hours", "open hours", "business hours"}: return f"We are open {CONFIG['hours']}."
    if topic in {"service area", "area", "where"}: return f"We serve {CONFIG['service_area']}."
    if topic == "insurance": return CONFIG["insurance"]
    if topic in {"policies", "policy", "booking policy"}: return CONFIG["policies"]
    if topic in {"services", "offerings", "what services", "list services"}:
        return "We offer " + ", ".join(x["name"] for x in CONFIG["services"]) + ". Controlled add-ons: " + ", ".join(x["name"] for x in CONFIG.get("add_ons", [])) + "."
    item = _find(service or topic)
    if not item: return "I don't have a verified catalog entry for that service, so I won't guess about availability or price. Would you like a local human follow-up request?"
    details = item["description"]
    if topic in {"compare", "difference", "differences"}: return details
    if item in CONFIG.get("add_ons", []): return f"{item['name']} is a controlled add-on. {details} Included: {', '.join(item['included'])}. Excluded: {', '.join(item['excluded'])}. It is not a standalone service or price quote. {item['pricing']}"
    return f"{item['name']}: {details} Included: {', '.join(item['included'])}. Excluded: {', '.join(item['excluded'])}."

def compare(first: str, second: str) -> str:
    a, b = lookup(first), lookup(second)
    if not a or not b or a.get("id") not in {x["id"] for x in CONFIG["services"]} or b.get("id") not in {x["id"] for x in CONFIG["services"]}:
        return "I can only compare verified primary services in the configured catalog."
    return f"{a['name']}: included {', '.join(a['included'])}; excluded {', '.join(a['excluded'])}. {b['name']}: included {', '.join(b['included'])}; excluded {', '.join(b['excluded'])}."

def list_services() -> list[dict[str, Any]]:
    """Return primary offerings only; add-ons stay explicitly separate."""
    return copy.deepcopy(CONFIG["services"])

def explain_service(service: str) -> str:
    return answer("service", service)
