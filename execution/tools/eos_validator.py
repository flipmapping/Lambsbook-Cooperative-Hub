#!/usr/bin/env python3

import json
import sys
from pathlib import Path
from datetime import datetime

REQUIRED = [
    "Foundation Architecture Brief",
    "Repository Truth",
    "Mutation Scope",
    "Implementation Package",
    "Founder Action Block",
]

def main():

    if len(sys.argv) != 2:
        print("Usage: eos_validator.py <markdown-file>")
        sys.exit(2)

    doc = Path(sys.argv[1])

    if not doc.exists():
        print(f"File not found: {doc}")
        sys.exit(2)

    text = doc.read_text(encoding="utf-8")

    detected = []
    missing = []

    for heading in REQUIRED:
        if heading in text:
            detected.append(heading)
        else:
            missing.append(heading)

    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "file": str(doc),
        "eos_version": "2.2",
        "passed": len(missing) == 0,
        "detected_sections": detected,
        "missing_sections": missing,
    }

    print(json.dumps(report, indent=2))

    sys.exit(0 if not missing else 1)

if __name__ == "__main__":
    main()

