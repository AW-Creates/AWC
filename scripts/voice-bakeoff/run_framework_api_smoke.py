#!/usr/bin/env python3
"""Offline API-level smoke comparison, deliberately excluding transport timing."""
from __future__ import annotations

import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from livekit.agents import Agent, ChatContext, function_tool
from pipecat.frames.frames import TextFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "voice-bakeoff" / "evidence"
FIXTURE = "I need a deep clean for a three bedroom home."
CONTEXT = {"customer_intent": "estimate", "bedrooms": 3, "service": "deep_clean"}


class ContractProcessor(FrameProcessor):
    """Minimal Pipecat processor proving the shared text/context contract fits a pipeline."""

    def __init__(self):
        super().__init__()
        self.received: list[str] = []

    async def process_frame(self, frame, direction):
        await super().process_frame(frame, direction)
        if isinstance(frame, TextFrame):
            self.received.append(frame.text)


@function_tool(description="Return the deterministic BrightHome deep-clean estimate for a bedroom count.")
async def deterministic_quote(bedrooms: int) -> str:
    # Shared POC schedule: $120 base + $25 for the third bedroom + $80 deep clean.
    return json.dumps({"service": "deep_clean", "bedrooms": bedrooms, "estimate_usd": 225, "currency": "USD"})


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    quote = await deterministic_quote(3)
    reply = "For a three bedroom deep clean, the BrightHome estimate is $225 before applicable add-ons."

    pipecat_start = time.perf_counter()
    processor = ContractProcessor()
    pipeline = Pipeline([processor])
    await processor.process_frame(TextFrame(reply), direction=FrameDirection.DOWNSTREAM)
    pipecat_ms = (time.perf_counter() - pipecat_start) * 1000

    livekit_start = time.perf_counter()
    chat = ChatContext()
    chat.add_message(role="user", content=FIXTURE)
    chat.add_message(role="assistant", content=reply)
    agent = Agent(instructions="You are the BrightHome receptionist. Use the deterministic quote tool for quotes; preserve handoff context.", chat_ctx=chat, tools=[deterministic_quote], allow_interruptions=True)
    livekit_ms = (time.perf_counter() - livekit_start) * 1000

    report = {
        "title": "LiveKit Agents vs Pipecat offline API smoke",
        "measured_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "Constructs local framework objects around the same BrightHome utterance/context/quote contract. This is an API compatibility smoke only; these timings exclude module import, STT, TTS, LLM, WebRTC, network, scheduling, and therefore are not latency benchmarks.",
        "contract": {"utterance": FIXTURE, "context": CONTEXT, "deterministic_quote_result": json.loads(quote), "reply": reply},
        "pipecat": {"version": __import__("importlib.metadata", fromlist=["version"]).version("pipecat-ai"), "pipeline_constructed": pipeline is not None, "text_frame_processed": processor.received == [reply], "object_setup_ms": round(pipecat_ms, 3)},
        "livekit_agents": {"version": __import__("importlib.metadata", fromlist=["version"]).version("livekit-agents"), "agent_constructed": agent is not None, "chat_context_messages": len(chat.items), "tool_bound": deterministic_quote in agent.tools, "allow_interruptions": True, "object_setup_ms": round(livekit_ms, 3)},
    }
    (OUT / "framework-api-smoke.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
