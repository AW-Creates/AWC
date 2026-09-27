"""Presentation-only wording for receptionist speech.

Values passed to booking and availability remain ISO strings; these helpers
only produce a natural spoken representation for prompts and transcripts.
"""
from __future__ import annotations
from datetime import datetime

_ORDINALS = {1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth",
             6: "sixth", 7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth",
             11: "eleventh", 12: "twelfth", 13: "thirteenth", 14: "fourteenth",
             15: "fifteenth", 16: "sixteenth", 17: "seventeenth", 18: "eighteenth",
             19: "nineteenth", 20: "twentieth", 21: "twenty-first", 22: "twenty-second",
             23: "twenty-third", 24: "twenty-fourth", 25: "twenty-fifth",
             26: "twenty-sixth", 27: "twenty-seventh", 28: "twenty-eighth",
             29: "twenty-ninth", 30: "thirtieth", 31: "thirty-first"}

def spoken_datetime(value: str) -> str:
    """Convert ``YYYY-MM-DD HH:MM`` to natural US English, preserving input truth."""
    dt = datetime.strptime(value, "%Y-%m-%d %H:%M")
    hour = dt.hour % 12 or 12
    minute = f"{dt.minute:02d}"
    clock = f"{hour} o'clock" if dt.minute == 0 else f"{hour}:{minute}"
    period = "AM" if dt.hour < 12 else "PM"
    return f"{dt.strftime('%B')} {_ORDINALS[dt.day]}, {dt.year} at {clock} {period}"

def spoken_slot(slot: str) -> str:
    return spoken_datetime(slot)
