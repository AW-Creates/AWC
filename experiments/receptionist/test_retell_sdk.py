"""Cryptographic contract for Retell's installed SDK; all inputs are synthetic."""
from __future__ import annotations

import os
import time
import unittest
from unittest.mock import patch

try:
    from retell.lib.webhook_auth import symmetric
except ImportError:  # pragma: no cover - exercised only without the optional SDK
    symmetric = None

from experiments.receptionist.retell_adapter import verify_signature


@unittest.skipIf(symmetric is None, "retell-sdk is not installed")
class RetellSdkSignatureContract(unittest.TestCase):
    key = "synthetic-retell-webhook-key"
    other_key = "synthetic-wrong-webhook-key"
    body = b'{ "event": "call_started", "synthetic": true }'

    def signed(self, body: bytes | None = None, timestamp: int | None = None) -> str:
        return symmetric["sign"]((body or self.body).decode("utf-8"), self.key, timestamp)

    def verify(self, body: bytes, signature: str, key: str | None = None) -> bool:
        with patch.dict(os.environ, {"RETELL_API_KEY": key or self.key, "RETELL_WEBHOOK_API_KEY": ""}, clear=False):
            return verify_signature(body, signature)

    def test_valid_signature(self):
        self.assertTrue(self.verify(self.body, self.signed()))

    def test_changed_body_is_rejected(self):
        self.assertFalse(self.verify(self.body.replace(b"true", b"false"), self.signed()))

    def test_wrong_key_is_rejected(self):
        self.assertFalse(self.verify(self.body, self.signed(), self.other_key))

    def test_expired_signature_is_rejected(self):
        expired = self.signed(timestamp=int(time.time() * 1000) - 300001)
        self.assertFalse(self.verify(self.body, expired))

    def test_exact_raw_body_bytes_are_required(self):
        signature = self.signed()
        same_json_different_bytes = b'{"event":"call_started","synthetic":true}'
        self.assertTrue(self.verify(self.body, signature))
        self.assertFalse(self.verify(same_json_different_bytes, signature))


if __name__ == "__main__":
    unittest.main()
