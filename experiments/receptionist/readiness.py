"""Fail-closed preflight for the managed Retell demo callback."""
from __future__ import annotations
from dataclasses import dataclass
from urllib.parse import urlparse
import json
import socket
import urllib.request

@dataclass(frozen=True)
class Readiness:
    ok: bool
    checks: dict
    reason: str = ""

def _expected_paths(expected_names):
    if isinstance(expected_names, dict):
        return dict(expected_names)
    return {name: "/retell/webhook" if "webhook" in name.lower() else "/retell/function"
            for name in expected_names}

def verify_callback(base_url: str, *, read_agent, expected_names, update_agent=None,
                    signed_probe=None, opener=urllib.request.urlopen,
                    resolver=socket.getaddrinfo) -> Readiness:
    parsed = urlparse(base_url)
    checks = {"url": bool(parsed.scheme == "https" and parsed.hostname), "dns": False,
              "health": False, "signed_probe": False, "agent_tools": False, "refreshed": False}
    if not checks["url"]:
        return Readiness(False, checks, "public HTTPS callback URL is required")
    if (parsed.username or parsed.password or parsed.query or parsed.fragment or
            parsed.path not in ("", "/")):
        return Readiness(False, checks, "callback URL must be a public HTTPS origin")
    if not expected_names:
        return Readiness(False, checks, "expected agent tool names are required")
    try:
        resolver(parsed.hostname, parsed.port or 443)
        checks["dns"] = True
        with opener(base_url.rstrip("/") + "/health", timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
            checks["health"] = (200 <= response.status < 300 and
                                payload.get("ok") is True and
                                payload.get("service") == "awc-retell-callback")
        if not checks["health"]:
            return Readiness(False, checks, "callback health response is not valid AWC JSON")
        if signed_probe is None:
            return Readiness(False, checks, "signed callback probe is required")
        checks["signed_probe"] = bool(signed_probe(base_url.rstrip("/") + "/retell/function"))
        if not checks["signed_probe"]:
            return Readiness(False, checks, "signed callback probe was rejected")
    except Exception as exc:
        return Readiness(False, checks, f"callback unreachable: {exc}")
    required = _expected_paths(expected_names)
    if not any("webhook" in name.lower() for name in required):
        return Readiness(False, checks, "expected webhook tool name is required")
    def matches(agent):
        return (isinstance(agent, dict) and set(agent) == set(required) and all(
                   name in agent and
                   isinstance(agent[name], str) and agent[name].strip() and
                   agent[name] == base_url.rstrip("/") + path
                   for name, path in required.items()))
    try:
        current = read_agent()
        stale = not matches(current)
        if stale and update_agent:
            update_agent(base_url)
            checks["refreshed"] = True
            current = read_agent()
            stale = not matches(current)
        checks["agent_tools"] = not stale
        if stale:
            return Readiness(False, checks, "temporary agent has stale or incomplete tool URLs")
    except Exception as exc:
        return Readiness(False, checks, f"provider readiness check failed: {exc}")
    return Readiness(True, checks)
