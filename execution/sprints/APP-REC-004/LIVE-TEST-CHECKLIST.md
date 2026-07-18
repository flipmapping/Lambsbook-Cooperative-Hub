# APP-REC-004 — Live Runtime Certification

Use TWO independent browser sessions.

## Session A (Admin)

- Final URL:
- GET /api/member/me status:
- GET /api/member/me JSON:
- First page rendered:
- Console errors:
- Failed network requests:

---

## Session B (Member)

- Final URL:
- GET /api/member/me status:
- GET /api/member/me JSON:
- First page rendered:
- Console errors:
- Failed network requests:

---

## Stop Condition

Stop at the **first observed difference** between Session A and Session B.

That first divergence is the authorized mutation target.
