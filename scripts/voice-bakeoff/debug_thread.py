"""Read-only diagnostic for FastAPI's faster-whisper thread offload.

Runs the app's exact ``transcribe`` function against a known WAV directly and
through ``asyncio.to_thread``. It writes no application state and changes no
app code. A delayed faulthandler dump makes an apparent stall inspectable.
"""
from __future__ import annotations

import asyncio
import faulthandler
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from experiments.receptionist import app as receptionist  # noqa: E402

FIXTURE = ROOT / "docs" / "voice-bakeoff" / "evidence" / "estimate.wav"


def run_direct(data: bytes) -> tuple[str, float]:
    started = time.perf_counter()
    return receptionist.transcribe(data), (time.perf_counter() - started) * 1000


async def run_threaded(data: bytes) -> tuple[str, float]:
    started = time.perf_counter()
    text = await asyncio.wait_for(asyncio.to_thread(receptionist.transcribe, data), timeout=90)
    return text, (time.perf_counter() - started) * 1000


async def run_threaded_synthesis() -> tuple[int, float]:
    """Exercise the route's actual post-STT offload without changing state."""
    started = time.perf_counter()
    encoded_wav = await asyncio.wait_for(
        asyncio.to_thread(receptionist.synthesize, "Your deep cleaning estimate is 225 dollars."),
        timeout=90,
    )
    return len(encoded_wav), (time.perf_counter() - started) * 1000


async def main() -> None:
    data = FIXTURE.read_bytes()
    # The first load can be slow.  Dump stacks after 45 s, but permit 90 s.
    faulthandler.dump_traceback_later(45, file=sys.stderr)
    try:
        direct, direct_ms = run_direct(data)
        threaded, threaded_ms = await run_threaded(data)
        synth_base64_bytes, synth_ms = await run_threaded_synthesis()
    finally:
        faulthandler.cancel_dump_traceback_later()
    print({"fixture": str(FIXTURE), "bytes": len(data), "direct": direct,
           "direct_ms": round(direct_ms, 3), "to_thread": threaded,
           "to_thread_ms": round(threaded_ms, 3), "same_text": direct == threaded,
           "threaded_kokoro_base64_bytes": synth_base64_bytes,
           "threaded_kokoro_ms": round(synth_ms, 3)})


if __name__ == "__main__":
    asyncio.run(main())
