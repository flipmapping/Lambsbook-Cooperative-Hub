#!/usr/bin/env python3
"""
LER-001A Runtime Truth Gate

Purpose
-------
The production bundle has already been certified to contain the
ContactSection, QR cards and QR assets.

This inspection determines whether the browser is rendering the same
bundle that was built.

Instructions
------------
1. Open the deployed homepage.
2. Press F12.
3. Open the Elements tab.
4. Use Ctrl+F for each string below.
5. Record YES or NO.
6. If the section exists, inspect the right-hand QR column.

Search Strings
--------------
Scan to Connect
Point your phone camera
WhatsApp
Zalo
"""

from pathlib import Path

report = Path("execution/sprints/LER-001A-RUNTIME-001/BROWSER-RUNTIME-CHECKLIST.md")

report.write_text(
"""# Browser Runtime Truth Gate

## DOM Search

| Search | Found (YES/NO) |
|---------|----------------|
| Scan to Connect | |
| Point your phone camera | |
| WhatsApp | |
| Zalo | |

---

## If "Scan to Connect" exists

Inspect:

- display
- visibility
- opacity
- overflow
- width
- height
- z-index

Also inspect both QR image elements.

Record any CSS rule hiding them.

---

## If "Scan to Connect" does NOT exist

The browser is not executing the certified bundle.

Possible causes:

- stale deployment
- browser cache
- service worker
- wrong deployment target

No source mutation is authorised until runtime truth is established.
"""
)

print("=" * 72)
print("LER-001A Runtime Truth Gate")
print("=" * 72)
print()
print("Checklist generated:")
print(report)
print()
print("Next:")
print("1. Open browser DevTools.")
print("2. Complete the checklist.")
print("3. Report the YES/NO results.")
