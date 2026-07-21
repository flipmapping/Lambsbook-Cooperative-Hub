#!/usr/bin/env python3

from pathlib import Path
import sys

STATUS_FILE = Path(__file__).parent / "MEX-PROGRAM-001-STATUS.md"

REQUIRED = [
    "Founder Inbox",
    "Architecture Status",
    "Current Program Phase",
    "Growth Engine",
    "Main Application",
    "MEX-EXEC-001",
    "Certified Handoffs",
    "Founder Decisions Pending",
    "Founder Decision History",
    "Program Risks",
]

VALID_STREAMS = {
    "Growth Engine",
    "Main Application",
    "MEX-EXEC-001",
}

VALID_STATUS = {
    "Not Started",
    "In Progress",
    "Blocked",
    "Complete",
    "Waiting for Runtime Certification",
    "Bootstrap",
}


def verify():
    text = STATUS_FILE.read_text(encoding="utf-8")

    missing = []
    duplicates = []

    for section in REQUIRED:
        count = text.count(f"## {section}")
        if count == 0:
            missing.append(section)
        elif count > 1:
            duplicates.append(section)

    if missing:
        print("Missing Sections:")
        for m in missing:
            print(" -", m)
        sys.exit(1)

    if duplicates:
        print("Duplicate Sections:")
        for d in duplicates:
            print(" -", d)
        sys.exit(1)

    print("STATUS BOARD VERIFIED")


if __name__ == "__main__":
    verify()
