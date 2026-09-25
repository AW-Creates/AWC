#!/usr/bin/env python3
"""Reproducible local component measurements for the BrightHome voice bake-off.

This deliberately measures only offline TTS -> STT component behavior. It does
not claim microphone, network, LLM, or WebRTC transport latency.
"""
from __future__ import annotations

import json
import os
import platform
import re
import statistics
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import psutil
import soundfile as sf
from faster_whisper import WhisperModel
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[2]
MODELS = ROOT / ".cache" / "voice-models"
OUT = ROOT / "docs" / "voice-bakeoff" / "evidence"
FIXTURES = [
    ("faq", "What is included in a standard BrightHome cleaning?"),
    ("estimate", "I need a deep clean for a three bedroom home."),
    ("booking", "Can I book next Tuesday at 10 AM?"),
    ("sales", "I need recurring cleaning for my office."),
    ("human", "Please connect me with a human because I have a complaint."),
]


def norm(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def wer(reference: str, hypothesis: str) -> float:
    r, h = norm(reference), norm(hypothesis)
    row = list(range(len(h) + 1))
    for i, rw in enumerate(r, 1):
        next_row = [i]
        for j, hw in enumerate(h, 1):
            next_row.append(min(next_row[-1] + 1, row[j] + 1, row[j - 1] + (rw != hw)))
        row = next_row
    return row[-1] / max(1, len(r))


def package_versions() -> dict[str, str]:
    from importlib.metadata import version
    names = ["faster-whisper", "kokoro-onnx", "onnxruntime", "ctranslate2", "numpy", "psutil"]
    return {name: version(name) for name in names}


def machine() -> dict[str, object]:
    return {
        "platform": platform.platform(),
        "python": sys.version,
        "logical_cpu_count": psutil.cpu_count(),
        "physical_cpu_count": psutil.cpu_count(logical=False),
        "ram_gib": round(psutil.virtual_memory().total / 2**30, 2),
        "onnx_providers": __import__("onnxruntime").get_available_providers(),
    }


def sample_stats(numbers: list[float]) -> dict[str, float]:
    return {"n": len(numbers), "mean": round(statistics.mean(numbers), 3), "median": round(statistics.median(numbers), 3), "min": round(min(numbers), 3), "max": round(max(numbers), 3)}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("HF_HOME", str(MODELS / "huggingface"))
    started = datetime.now(timezone.utc).isoformat()
    proc = psutil.Process()
    kokoro = Kokoro(str(MODELS / "kokoro-v1.0.int8.onnx"), str(MODELS / "voices-v1.0.bin"))
    tts_rows = []
    audio_paths: list[tuple[str, str, Path, float]] = []
    for slug, text in FIXTURES:
        times = []
        rss_before = proc.memory_info().rss
        for run in range(5):
            begin = time.perf_counter()
            audio, sample_rate = kokoro.create(text, voice="af_heart", speed=1.0)
            elapsed_ms = (time.perf_counter() - begin) * 1000
            times.append(elapsed_ms)
            if run == 0:
                path = OUT / f"{slug}.wav"
                sf.write(path, audio, sample_rate)
                audio_paths.append((slug, text, path, len(audio) / sample_rate))
        tts_rows.append({"fixture": slug, "text": text, "audio_seconds": round(len(audio) / sample_rate, 3), "synthesis_ms": sample_stats(times), "rss_delta_mib": round((proc.memory_info().rss - rss_before) / 2**20, 2)})

    load_begin = time.perf_counter()
    model = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=str(MODELS / "huggingface"))
    model_load_ms = (time.perf_counter() - load_begin) * 1000
    stt_rows = []
    for slug, reference, path, seconds in audio_paths:
        times, outputs = [], []
        for _ in range(5):
            begin = time.perf_counter()
            segments, _info = model.transcribe(str(path), beam_size=1, vad_filter=False, condition_on_previous_text=False)
            output = " ".join(segment.text.strip() for segment in segments).strip()
            times.append((time.perf_counter() - begin) * 1000)
            outputs.append(output)
        stt_rows.append({"fixture": slug, "reference": reference, "hypothesis": outputs[-1], "audio_seconds": round(seconds, 3), "transcription_ms": sample_stats(times), "wer": round(wer(reference, outputs[-1]), 4), "real_time_factor_median": round(statistics.median(times) / 1000 / seconds, 4)})

    report = {
        "title": "BrightHome local Kokoro-to-faster-whisper synthetic component benchmark",
        "measured_at_utc": started,
        "methodology": "Five warm runs per fixture. Kokoro af_heart emits synthetic clean audio which faster-whisper base.en transcribes. WER is normalized word-level edit distance against the text used to synthesize each fixture. This is a component-loop measurement, not human microphone accuracy, subjective naturalness, WebRTC, or end-to-end agent latency.",
        "machine": machine(),
        "packages": package_versions(),
        "kokoro": {"model": "kokoro-v1.0.int8.onnx", "voice": "af_heart", "runs_per_fixture": 5, "rows": tts_rows},
        "faster_whisper": {"model": "base.en", "device": "cpu", "compute_type": "int8", "model_load_ms": round(model_load_ms, 3), "runs_per_fixture": 5, "rows": stt_rows},
        "process_rss_mib_at_end": round(proc.memory_info().rss / 2**20, 2),
    }
    (OUT / "local-component-benchmark.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
