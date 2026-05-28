# MVP SURFACE MAP V1

EXECUTIONAL_STATUS:
non-executable

CLASSIFICATION:
bounded-mvp-runtime-surface-map

STATUS:
active

---

# PURPOSE

Identify ONLY runtime surfaces relevant to MVP restoration.

Non-MVP surfaces are intentionally excluded.

---

# AUTH SURFACES

| Surface | Status | MVP Role |
|---|---|---|
| attachUserContext | canonical | required |
| attachUserContextSafe | transitional | unresolved |
| auth.users | canonical identity authority | required |
| meh.members | canonical membership authority | required |

---

# INVITATION SURFACES

| Surface | Status | MVP Role |
|---|---|---|
| /api/member/accept-invitation | canonical-aligned | required |
| /api/hub/member/accept-invitation | contained residual corridor | excluded |
| accept_member_invitation RPC | canonical | required |

---

# PARTICIPATION RUNTIME

| Surface | Status | MVP Role |
|---|---|---|
| participation state machine | canonical | required |
| isMember boolean collapse | executable drift | restoration target |
| mixed-state rendering | forbidden | must not survive MVP |

---

# CAPABILITY SURFACES

| Surface | Status | MVP Role |
|---|---|---|
| InteractionCapability | unresolved lineage | bounded blocker |
| client-only capability gating | transitional drift | restoration target |
| program access limits | unresolved ownership | bounded blocker |

---

# SURFACE SELECTION LAW

Presence in repository topology does NOT imply:
- canonical authority
- runtime legitimacy
- restoration priority
- MVP necessity

Only surfaces required for:
- participation continuity
- invitation continuity
- capability continuity
- runtime stability

qualify as MVP-relevant restoration surfaces.

---

# OUT OF MVP SCOPE

- governance taxonomy refinement
- archival topology
- registry deduplication
- reconciliation compression
- historical artifact normalization

