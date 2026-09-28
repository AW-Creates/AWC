"""One-command, nonbillable operator readiness; owned processes always cleaned up."""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]

def validate_local(root=ROOT):
    if not os.environ.get('RETELL_API_KEY', '').strip():
        raise ValueError('RETELL_API_KEY missing; configure local .env without sharing it.')
    setup = json.loads((root / '.cache/retell-acceptance/setup.json').read_text())
    if not all(isinstance(setup.get(k), str) and setup[k].strip() for k in ('agent_id', 'llm_id')):
        raise ValueError('Existing temporary agent setup is incomplete.')
    for port in (8766, 8767):
        with socket.socket() as probe:
            probe.bind(('127.0.0.1', port))
    return setup

def stop_owned(process):
    if process and process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)

def tunnel_url(log, process, timeout=30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise ValueError('Tunnel exited; check cloudflared installation/connectivity.')
        content = log.read_text(errors='replace')
        match = re.search(r'https://[a-z0-9-]+\.trycloudflare\.com', content)
        if match and 'Registered tunnel connection' in content:
            try:
                socket.getaddrinfo(urlparse(match.group(0)).hostname, 443)
            except socket.gaierror:
                pass
            else:
                return match.group(0)
        time.sleep(.2)
    raise ValueError('Tunnel registration/DNS unavailable within 30 seconds.')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cloudflared', default=os.getenv('AWC_CLOUDFLARED', 'cloudflared'))
    parser.add_argument('--serve', action='store_true', help='Existing authorized one-shot voice allowance only; never resets ledger')
    args = parser.parse_args()
    from dotenv import load_dotenv
    load_dotenv(ROOT / '.env', override=False)
    sys.path.insert(0, str(ROOT))
    from experiments.receptionist.retell_adapter import identity_config
    from experiments.receptionist.service_catalog import PROFILE
    tunnel = runtime = None
    try:
        validate_local()
        identity_config()
        if args.serve and (ROOT / '.cache/retell-acceptance/demo-creation-attempt.json').exists():
            raise ValueError('Prior voice allowance consumed. Preserve ledger; request a separately scoped call authorization.')
        executable = shutil.which(args.cloudflared)
        if not executable:
            raise ValueError('cloudflared not found; pass --cloudflared with the installed executable path.')
        print('Local credentials/configuration PASS (values hidden). Starting readiness; no call created.', flush=True)
        with tempfile.TemporaryDirectory(prefix='awc-tunnel-') as directory:
            log = Path(directory) / 'tunnel.log'
            with log.open('w') as output:
                tunnel = subprocess.Popen([executable, 'tunnel', '--url', 'http://127.0.0.1:8766', '--no-autoupdate'],
                    stdout=output, stderr=output, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
                try:
                    base = tunnel_url(log, tunnel)
                    command = [sys.executable, str(ROOT/'scripts/voice-demo/retell_demo.py'), '--base', base, '--sync-profile']
                    if not args.serve:
                        command.append('--preflight-only')
                    if args.serve:
                        print('Readiness is running. The browser opens only on PASS at http://127.0.0.1:8767/; Ctrl+C stops it.', flush=True)
                    runtime = subprocess.Popen(command, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                    # Consume privately: provider exceptions must not print credentials or records.
                    try:
                        output, _ = runtime.communicate(timeout=None if args.serve else 60)
                    except subprocess.TimeoutExpired:
                        raise ValueError('Readiness exceeded 60 seconds; demo blocked.') from None
                    if runtime.returncode:
                        raise ValueError('Readiness failed; demo blocked. Check configuration, network and existing agent settings; no automatic retry.')
                    if not args.serve and 'PASS: signed readiness' not in output:
                        raise ValueError('Readiness did not produce its PASS marker.')
                    print('PASS: signed callback, tool URLs, agent identity and catalog configuration verified. No call created.' if not args.serve else 'Voice runtime ended.')
                finally:
                    stop_owned(runtime)
                    stop_owned(tunnel)
        return 0
    except KeyboardInterrupt:
        print('Stopped; owned callback and tunnel processes closed.')
        return 130
    except Exception as exc:
        # Only locally authored ValueErrors are printable; other exceptions may include credentials.
        print('STOP: ' + (str(exc) if isinstance(exc, ValueError) and not isinstance(exc, json.JSONDecodeError) else type(exc).__name__ + '; check local setup without sharing secrets.'))
        return 2
    finally:
        stop_owned(runtime)
        stop_owned(tunnel)

if __name__ == '__main__':
    sys.exit(main())
