#!/usr/bin/env python3

import re
import urllib.request
import urllib.error
from pathlib import Path

BASE = "http://127.0.0.1:5000"

def fetch(url):
    with urllib.request.urlopen(url, timeout=10) as response:
        return response.read().decode("utf-8", errors="ignore")

print("=" * 72)
print("LER-001A Runtime HTTP Verification")
print("=" * 72)

try:
    html = fetch(BASE + "/")
except Exception as exc:
    print()
    print("ERROR")
    print("Cannot reach:", BASE)
    print(exc)
    raise SystemExit(1)

print()
print("Homepage fetched successfully.")
print("HTML length:", len(html))

match = re.search(r'/assets/index-[^"]+\.js', html)

if not match:
    print()
    print("ERROR")
    print("No Vite bundle reference found in homepage HTML.")
    Path("execution/sprints/LER-001A-RUNTIME-002/homepage.html").write_text(html)
    print("Homepage saved for inspection.")
    raise SystemExit(1)

bundle = match.group(0)

print()
print("Bundle discovered:")
print(bundle)

try:
    js = fetch(BASE + bundle)
except Exception as exc:
    print()
    print("ERROR")
    print("Unable to fetch bundle.")
    print(exc)
    raise SystemExit(1)

checks = [
    "Scan to Connect",
    "Point your phone camera",
    "WhatsApp",
    "Zalo",
    "Whatsapp-",
    "zalo-",
]

print()
print("=" * 72)
print("Bundle Inspection")
print("=" * 72)

for item in checks:
    found = item in js
    print(f"{item:<32} {'YES' if found else 'NO'}")

snapshot = Path(
    "execution/sprints/LER-001A-RUNTIME-002/runtime_bundle_snapshot.js"
)

snapshot.write_text(js)

print()
print("Bundle snapshot saved:")
print(snapshot)

print()
print("Inspection complete.")
