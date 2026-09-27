"""Loopback-only Retell web-call diagnostic harness.

Serves a single, already-created session from ignored cache.  It has no API
key handling and never creates, retries, or stops a provider call.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / ".cache" / "retell-acceptance"
SESSION_FILE = CACHE / "creation-attempt-1-private.json"
SETUP_FILE = CACHE / "setup.json"
SDK_ROOT = ROOT / ".cache" / "retell-browser-sdk" / "runtime" / "node_modules"
HOST = "127.0.0.1"
PORT = 8767


def load_json(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path.name} must contain an object")
    return value


class HarnessState:
    def __init__(self) -> None:
        self.session = load_json(SESSION_FILE)
        setup = load_json(SETUP_FILE)
        self.agent_id = setup.get("agent_id")
        required = ("access_token", "call_id", "expires_at", "transport")
        if not self.agent_id or any(not self.session.get(key) for key in required):
            raise ValueError("saved Retell session or agent ID is incomplete")
        if int(self.session["expires_at"]) <= int(time.time() * 1000):
            raise ValueError("saved Retell session has expired; do not create a replacement from this harness")
        self.used = False
        self.lock = threading.Lock()

    def public_session(self) -> bytes:
        # Deliberately omit all server-only data. This response is one-shot.
        payload = {key: self.session[key] for key in ("access_token", "call_id", "expires_at", "ice_servers", "transport") if key in self.session}
        return json.dumps(payload).encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    state: HarnessState

    def log_message(self, format: str, *args: object) -> None:
        # Never log request bodies, which can contain the access token response.
        print("[browser-harness] " + format % args)

    def same_origin(self) -> bool:
        host = self.headers.get("Host", "")
        origin = self.headers.get("Origin")
        valid_hosts = {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}
        if host not in valid_hosts:
            return False
        return origin in (None, f"http://{host}")

    def send_bytes(self, status: HTTPStatus, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        route = urlparse(self.path).path
        files = {
            "/": ROOT / "scripts" / "voice-demo" / "retell_browser.html",
            "/retell_browser.html": ROOT / "scripts" / "voice-demo" / "retell_browser.html",
            "/vendor/eventemitter3.umd.js": SDK_ROOT / "eventemitter3" / "dist" / "eventemitter3.umd.js",
            "/vendor/livekit-client.umd.js": SDK_ROOT / "livekit-client" / "dist" / "livekit-client.umd.js",
            "/vendor/retell-client.umd.js": SDK_ROOT / "retell-client-js-sdk" / "dist" / "index.umd.js",
        }
        if route == "/config":
            if not self.same_origin():
                self.send_bytes(HTTPStatus.FORBIDDEN, b'{"error":"same-origin required"}', "application/json")
                return
            self.send_bytes(HTTPStatus.OK, json.dumps({"agent_id": self.state.agent_id, "session_available": not self.state.used}).encode(), "application/json")
            return
        target = files.get(route)
        if not target or not target.is_file():
            self.send_bytes(HTTPStatus.NOT_FOUND, b"not found", "text/plain; charset=utf-8")
            return
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        self.send_bytes(HTTPStatus.OK, target.read_bytes(), content_type)

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/session":
            self.send_bytes(HTTPStatus.NOT_FOUND, b"not found", "text/plain; charset=utf-8")
            return
        if not self.same_origin() or self.headers.get("Content-Type", "").split(";", 1)[0] != "application/json":
            self.send_bytes(HTTPStatus.FORBIDDEN, b'{"error":"same-origin JSON POST required"}', "application/json")
            return
        length = int(self.headers.get("Content-Length", "0"))
        if length > 8192:
            self.send_bytes(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, b'{"error":"request too large"}', "application/json")
            return
        self.rfile.read(length)  # Request body is intentionally ignored; never log it.
        with self.state.lock:
            if int(self.state.session["expires_at"]) <= int(time.time() * 1000):
                self.send_bytes(HTTPStatus.GONE, b'{"error":"saved session expired; no replacement created"}', "application/json")
                return
            if self.state.used:
                self.send_bytes(HTTPStatus.CONFLICT, b'{"error":"saved session already served; no retry"}', "application/json")
                return
            self.state.used = True
            body = self.state.public_session()
        self.send_bytes(HTTPStatus.OK, body, "application/json")


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve one existing Retell session on loopback only.")
    parser.add_argument("--port", type=int, default=PORT)
    args = parser.parse_args()
    if args.port != PORT:
        raise ValueError(f"fixed port only: {PORT}")
    Handler.state = HarnessState()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Ready: http://{HOST}:{PORT}/ — one saved session, no creation API, no retry.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        return 0
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
