# Runtime Environment Doctrine — Lambsbook (Replit)

## Core Rule
Code truth is meaningless without runtime alignment.

---

## 1. Port Ownership
- Port 5000 must be owned by the current backend process
- If EADDRINUSE → backend is NOT running

### Check:
ps aux | grep server/index.ts

### Fix:
kill -9 <PID>

---

## 2. Runtime Alignment Check (MANDATORY)

Before ANY API debugging:

1. Start server:
   npm run dev

2. Confirm:
   serving on port 5000

3. Probe:
   curl http://localhost:5000/api/__probe

Expected:
{ "ok": true, "source": "express" }

---

## 3. Vite Interception Rule

If response is HTML:
→ Request was handled by Vite, not Express

---

## 4. Curl Interpretation

- null → prints empty
- Always use:
  curl -i <url>

---

## 5. Failure Classes

| Symptom | Cause |
|--------|------|
| HTML response | Wrong server |
| curl (7) failed | Server not running |
| no logs | request not hitting Express |
| EADDRINUSE | port conflict |

---

## 6. Golden Sequence

kill → start → probe → test → implement

---

STATUS: LOCKED DOCTRINE
