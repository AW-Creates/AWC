"""Offline configuration/preflight; opt-in callback server creates NO calls."""
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from experiments.receptionist.retell_adapter import ManagedVoiceAdapter, configuration, create_app

PLAN = {"max_sessions": 3, "max_seconds_per_session": 120, "max_total_usd": 3,
        "max_all_in_usd_per_minute": 0.50, "max_session_minutes": 30,
        "auto_reload": False, "auto_retry": False, "auto_recharge": False,
        "live_calls_implemented": False, "enforcement": "Manual dashboard cost reconciliation and provider duration limit required"}

def preflight():
    return {"plan": PLAN, "credential_present": bool(os.getenv("RETELL_API_KEY")),
            "status": "STOP: no live calls; next milestone requires credentials and verified account balance/rate"}

async def serve(call_id):
    if not os.getenv("RETELL_API_KEY") or not os.getenv("RETELL_AGENT_ID"):
        raise ValueError("RETELL_API_KEY and RETELL_AGENT_ID required")
    import retell  # fail before serving if signature verifier absent
    import uvicorn
    from experiments.receptionist import app as business
    business.reset_state()
    adapter = ManagedVoiceAdapter(business, call_id or "UNARMED", os.environ["RETELL_AGENT_ID"])
    server = uvicorn.Server(uvicorn.Config(create_app(adapter), host="127.0.0.1", port=8766, log_level="warning"))
    task = asyncio.create_task(server.serve())
    print("Callbacks only at 127.0.0.1:8766. No call started. Commands: arm CALL_ID, pending, approve REVIEW_ID, cancel, summary, quit.")
    async def operator():
        while True:
            command = (await asyncio.to_thread(input, "> ")).strip()
            if command == "quit":
                return
            if command == "pending":
                print(json.dumps(adapter.pending, indent=2))
            elif command.startswith("arm ") and adapter.call_id == "UNARMED":
                adapter.call_id = command.split(" ", 1)[1]
                print("Exact call ID armed once. Restart process for another session.")
            elif command == "cancel":
                await adapter.invalidate()
            elif command == "summary":
                print(json.dumps(business.snapshot(), indent=2))
            elif command.startswith("approve "):
                try:
                    result = await adapter.approve(command.split(" ", 1)[1])
                    print(json.dumps(result))
                    print("Local approval processed. Provider can retrieve confirmation or summary.")
                except ValueError as exc:
                    print(str(exc))
    try:
        await asyncio.wait_for(operator(), timeout=1800)
    except (EOFError, asyncio.TimeoutError):
        pass
    finally:
        await adapter.invalidate()
        server.should_exit = True
        await task

def main():
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", action="store_true")
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--call-id")
    args = parser.parse_args()
    if args.config:
        print(json.dumps(configuration(os.getenv("RETELL_PUBLIC_BASE_URL", "")), indent=2))
    elif args.serve:
        asyncio.run(serve(args.call_id))
    else:
        print(json.dumps(preflight(), indent=2))
        return 0 if os.getenv("RETELL_API_KEY") else 2
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(2)
