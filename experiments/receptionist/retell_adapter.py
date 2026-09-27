"""Isolated, single-caller Retell boundary. No outbound/billable operations."""
from __future__ import annotations
import asyncio
import copy
import hashlib
import json
import os
import time
import uuid
from typing import Literal
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, ValidationError

MAX_BODY = 65536
MAX_CALL_DURATION_MS = 120000
FAQ_QUERIES = {"hours": "hours", "insurance": "insurance", "service_area": "service area"}

class Args(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

class FAQ(Args):
    topic: Literal["hours", "insurance", "service_area"]

class Quote(Args):
    bedrooms: int = Field(ge=1, le=20)
    service: Literal["standard", "deep"]

class Booking(Args):
    slot: str = Field(min_length=1, max_length=40)
    name: str = Field(default="Synthetic caller", max_length=100)

class Confirm(Args):
    review_id: str = Field(min_length=1, max_length=64)

class Reason(Args):
    reason: str = Field(min_length=1, max_length=500)

TOOLS = {
    "get_business_info": (FAQ, "Get verified business facts; never invent an answer."),
    "get_quote": (Quote, "Get the authoritative demo estimate; never calculate a price yourself."),
    "get_availability": (Args, "Get currently available demo slots."),
    "prepare_booking": (Booking, "Prepare a proposal only. Await local operator approval; this does not book."),
    "confirm_booking": (Confirm, "Retrieve/execute the locally approved proposal. Never claim success unless ok is true."),
    "request_sales_handoff": (Reason, "Record local sales handoff with context. Nobody is contacted."),
    "request_human_escalation": (Reason, "Record local human follow-up with context. Nobody is contacted."),
    "get_summary_outcome": (Args, "Read the authoritative AWC outcome; never create your own booking record."),
}

def configuration(base_url: str) -> dict:
    parsed = urlparse(base_url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.query or parsed.fragment:
        raise ValueError("A public HTTPS callback base URL is required")
    if parsed.hostname in {"localhost", "127.0.0.1", "::1"}:
        raise ValueError("Retell cannot call loopback URLs")
    functions = []
    for name, (model, description) in TOOLS.items():
        functions.append(dict(type="custom", name=name, description=description,
            url=base_url.rstrip("/")+"/retell/function", method="POST",
            parameters=model.model_json_schema(), args_at_root=False,
            timeout_ms=3000, max_retry=0, speak_during_execution=False,
            speak_after_execution=True))
    return {"agent_settings": {"max_call_duration_ms": MAX_CALL_DURATION_MS,
        "data_storage_setting": "basic_attributes_only", "opt_in_signed_url": True,
        "webhook_url": base_url.rstrip("/")+"/retell/webhook",
        "webhook_events": ["call_started", "call_ended", "call_analyzed"]},
        "llm_settings": {"general_prompt": "You are the fictional BrightHome demo receptionist. Use AWC tools for all business facts, estimates, availability, bookings, handoffs and outcomes. Never invent prices or commitments. Ask for clarification on uncertain recognition. A booking requires separate local operator approval; spoken yes is insufficient. Read only the tool result. On tool failure say no action is confirmed. Handoffs are local demo records and no human has been contacted. Call get_summary_outcome before ending. Never retry automatically.",
                         "general_tools": functions},
        "note": "Configuration fragments for dashboard setup, not a create-agent request. Choose model/voice and verify rate separately. No provider request performed."}

def verify_signature(raw: bytes, signature: str | None) -> bool:
    key = os.getenv("RETELL_WEBHOOK_API_KEY") or os.getenv("RETELL_API_KEY")
    if not key or not signature:
        return False
    from retell import Retell
    return bool(Retell(api_key=key).verify(raw.decode("utf-8"), api_key=key, signature=signature))

class ManagedVoiceAdapter:
    """Neutral tools over the existing AWC business module; one call per process."""
    def __init__(self, business, call_id: str, agent_id: str, clock=time.monotonic):
        if not call_id or not agent_id:
            raise ValueError("Exact call and agent IDs are required")
        self.business, self.call_id, self.agent_id = business, call_id, agent_id
        self.clock = clock
        self.pending = None
        self.cache = {}
        self.lock = asyncio.Lock()
        self.closed = False
        self.last_turn = None
        self.outcome = None
        self.committed_reviews = {}

    def _identity(self, call):
        if not isinstance(call, dict) or call.get("call_id") != self.call_id or call.get("agent_id") != self.agent_id:
            raise HTTPException(403, "Call/agent not authorized")

    def _observe(self, call):
        turns = call.get("transcript_object", [])
        if not isinstance(turns, list) or len(turns) > 200:
            raise HTTPException(422, "Invalid transcript")
        users = [x for x in turns if isinstance(x, dict) and x.get("role") == "user"]
        # Include timestamps/ordinal so a repeated phrase in a new turn is distinct.
        fingerprint = hashlib.sha256(json.dumps(users, sort_keys=True).encode()).hexdigest()
        if self.last_turn is not None and fingerprint != self.last_turn:
            self.pending = None
        self.last_turn = fingerprint
        return fingerprint, (str(users[-1].get("content", ""))[:2000] if users else "")

    async def dispatch(self, payload):
        if not isinstance(payload, dict):
            raise HTTPException(422, "Expected function envelope")
        call = payload.get("call")
        self._identity(call)
        name, args = payload.get("name"), payload.get("args")
        if not isinstance(name, str) or name not in TOOLS or not isinstance(args, dict):
            raise HTTPException(422, "Invalid function")
        try:
            validated = TOOLS[name][0].model_validate(args).model_dump()
        except ValidationError:
            raise HTTPException(422, "Invalid tool arguments") from None
        async with self.lock, self.business.LOCK:
            if self.closed:
                raise HTTPException(409, "Session ended")
            turn, text = self._observe(call)
            digest = hashlib.sha256(json.dumps([name, validated, turn], sort_keys=True).encode()).hexdigest()
            # Retell's documented envelope has no guaranteed top-level request ID.
            # Replay same tool+arguments+user-turn without repeating side effects.
            cacheable = name not in {"get_availability", "get_summary_outcome", "get_quote"}
            if cacheable and digest in self.cache:
                return copy.deepcopy(self.cache[digest])
            if name != "get_summary_outcome":
                self.business.STATE["transcript"] = [
                    {"role": x["role"], "text": str(x.get("content", ""))[:2000]}
                    for x in call.get("transcript_object", [])
                    if isinstance(x, dict) and x.get("role") in {"user", "agent"}]
            if len(self.cache) >= 200:
                raise HTTPException(429, "Bounded session tool limit")
            result = await self._execute(name, validated, turn, text)
            if cacheable and result.get("status") != "awaiting_local_operator_approval":
                self.cache[digest] = copy.deepcopy(result)
            return result

    async def _execute(self, name, args, turn, text):
        b = self.business
        if name == "get_business_info":
            return {"answer": await b.domain(FAQ_QUERIES[args["topic"]])}
        if name == "get_quote":
            result = b.quote(b.QuoteRequest(**args))
            b.STATE["quote"] = result
            b.event("quote", result=result)
            b.persist()
            return {"quote": result}
        if name == "get_availability":
            return {"slots": [s for s, status in b.SLOTS.items() if status == "available"]}
        if name == "prepare_booking":
            if not text:
                raise HTTPException(422, "User transcript required for review")
            if b.SLOTS.get(args["slot"]) != "available":
                return {"ok": False, "error": "Slot unavailable"}
            self.pending = dict(review_id=uuid.uuid4().hex, args=args, turn=turn,
                                transcript=text, expires=self.clock()+60)
            return {"ok": False, "status": "proposal_only", "review_id": self.pending["review_id"], "slot": args["slot"]}
        if name == "confirm_booking":
            if args["review_id"] in self.committed_reviews:
                return copy.deepcopy(self.committed_reviews[args["review_id"]])
            p = self.pending
            if not p or p["review_id"] != args["review_id"] or p["turn"] != turn or self.clock() >= p["expires"]:
                return {"ok": False, "error": "Missing, expired or stale review"}
            return {"ok": False, "status": "awaiting_local_operator_approval"}
        if name in {"request_sales_handoff", "request_human_escalation"}:
            # Never pass provider reason through the text command parser.
            human = name == "request_human_escalation"
            answer = await b.domain("human" if human else "sales")
            item = b.STATE["callbacks" if human else "handoffs"][-1]
            item["reason"] = args["reason"]
            b.persist()
            return {"answer": answer, "record": copy.deepcopy(item)}
        return {"summary": b.snapshot(), "outcome": copy.deepcopy(self.outcome)}

    async def approve(self, review_id: str):
        """Called ONLY by local stdin; no HTTP route exposes this capability."""
        async with self.lock, self.business.LOCK:
            p = self.pending
            if not p or p["review_id"] != review_id or self.clock() >= p["expires"] or self.closed:
                raise ValueError("Review missing/expired")
            # Approval and conflict check are atomic and local. The provider only
            # retrieves the result; no additional utterance/polling is required.
            result = self.business.book(self.business.BookingRequest(**p["args"]))
            self.business.event("booking", result=result)
            self.business.persist()
            self.committed_reviews[review_id] = copy.deepcopy(result)
            self.pending = None
            return result

    async def invalidate(self):
        async with self.lock:
            self.pending = None

    async def lifecycle(self, payload):
        if not isinstance(payload, dict):
            raise HTTPException(422, "Expected webhook envelope")
        self._identity(payload.get("call"))
        event = payload.get("event")
        if event not in {"call_started", "call_ended", "call_analyzed"}:
            raise HTTPException(422, "Unsupported event")
        async with self.lock, self.business.LOCK:
            if event in {"call_ended", "call_analyzed"}:
                self.closed, self.pending = True, None
                if self.outcome is None:
                    self.outcome = self.business.snapshot()
            return {"ok": True, "event": event, "summary": copy.deepcopy(self.outcome)}

def create_app(adapter: ManagedVoiceAdapter, verifier=verify_signature):
    app = FastAPI(title="AWC isolated Retell callbacks", docs_url=None, redoc_url=None, openapi_url=None)

    async def read(request):
        raw = bytearray()
        async for chunk in request.stream():
            raw.extend(chunk)
            if len(raw) > MAX_BODY:
                raise HTTPException(413, "Callback too large")
        try:
            valid = verifier(bytes(raw), request.headers.get("x-retell-signature"))
        except ImportError:
            raise HTTPException(503, "Official signature SDK unavailable") from None
        except Exception:
            valid = False
        if not valid:
            raise HTTPException(401, "Invalid signature")
        try:
            return json.loads(raw)
        except (ValueError, UnicodeError):
            raise HTTPException(422, "Invalid JSON") from None

    @app.post("/retell/function")
    async def function(request: Request):
        return await adapter.dispatch(await read(request))

    @app.post("/retell/webhook")
    async def webhook(request: Request):
        return await adapter.lifecycle(await read(request))
    return app
