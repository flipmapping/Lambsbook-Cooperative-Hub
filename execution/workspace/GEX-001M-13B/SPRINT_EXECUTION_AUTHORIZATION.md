# GEX-001M-13B

Sprint Objective
----------------
Materialize the CSV Prospect Import persistence corridor.

Execution Order
---------------
1. Implement mapper.
2. Implement persist().
3. Reuse createProspectCore().
4. Verify end-to-end runtime.

Definition of Done
------------------
- CSV imports accepted prospects.
- Canonical prospects are created.
- Prospect journeys are created.
- Existing admissions behavior remains unchanged.
- Runtime evidence captured.

Deferred
--------
All architectural enhancements outside this corridor remain deferred.
