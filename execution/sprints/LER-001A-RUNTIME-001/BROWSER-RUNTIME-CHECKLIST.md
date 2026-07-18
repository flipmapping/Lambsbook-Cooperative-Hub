# Browser Runtime Truth Gate

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
