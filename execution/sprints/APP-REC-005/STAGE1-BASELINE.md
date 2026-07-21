# APP-REC-005 Stage-1 Certified Baseline

Timestamp
---------
2026-07-19T15:11:22.559216+00:00

Target
------
client/src/pages/MemberHub.tsx

SHA256
------
50692ed1583deaa9a821a5cd8d76f2fb06a89da6971d60e74004a214d60f7d4c

Certified State
---------------
Profile query:
    enabled: isAuthenticated

Stage-2 queries:
    enabled: isAuthenticated && !profileLoading && !!profile

Verification
------------
verify_stage1_gate.py
Status: PASS

Purpose
-------
This document records the certified Stage-1 runtime state that
apply_stage1_gate.py shall preserve or produce.
