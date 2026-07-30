#!/usr/bin/env python3

import subprocess
import time
import urllib.request
import signal

PORT = 5000

print("=" * 72)
print("MAIN APPLICATION RUNTIME SURFACE VERIFICATION")
print("=" * 72)

server = subprocess.Popen(
    ["npm", "run", "dev"],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)

try:
    print("Starting runtime...")
    time.sleep(12)

    endpoints = [
        "/",
        "/api/health",
        "/api/member/me",
        "/api/hub/sbus",
    ]

    print()

    for ep in endpoints:
        url = f"http://127.0.0.1:{PORT}{ep}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as r:
                print(f"[OK ] {ep:<24} {r.status}")
        except Exception as ex:
            print(f"[FAIL] {ep:<24} {ex}")

finally:
    print()
    print("Stopping runtime...")

    server.send_signal(signal.SIGINT)

    try:
        server.wait(timeout=10)
    except Exception:
        server.kill()

print("=" * 72)
print("RUNTIME SURFACE VERIFICATION COMPLETE")
print("=" * 72)
