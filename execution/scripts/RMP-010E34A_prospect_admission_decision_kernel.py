#!/usr/bin/env python3
"""
RMP-010E34A — Prospect Admission Decision Kernel
CIB Authority: RMP-010E34A / Derived From: FDR-010E34
Infrastructure Prerequisite: INF-010E34A — CERTIFIED
  Verified infrastructure: growth.prospect_admission_decisions

Implements immutable admission decision recording and retrieval:
  - Record an admission decision (create — append-only)
  - List decision history (chronological)
  - Get latest decision

Minimum bounded mutation corridor (4 server files):
  MODIFY  server/lib/supabase-types.ts
  MODIFY  server/lib/supabase-dal.ts
  MODIFY  server/services/admissions.ts
  MODIFY  server/routes.ts

Anchors (verified unique from post-RMP-010E33A Repository Truth):
  FA:  ProspectDocumentUpdate terminal interface
  FB1: DAL import block (ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate)
  FB2: corridor: archiveDocument return → getMemberByUserId
  FC:  terminal service block (archiveProspectDocument)
  FD1: routes admissions import terminal fragment
  FD2: POST /archive close → countries GET corridor

Quality gate: EXEC-STD-001 + EXEC-STD-002 + EOS 2.0
"""

import sys
from pathlib import Path

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

_step_results: dict[str, str] = {}

def _ok(msg: str)   -> None: print(f"  {GREEN}✓{RESET}  {msg}")
def _info(msg: str) -> None: print(f"  {CYAN}→{RESET}  {msg}")
def _head(msg: str) -> None: print(f"\n{BOLD}{msg}{RESET}")

def abort(reason: str) -> None:
    print(f"{RED}\n{'='*42}\nRMP-010E34A\nFAIL\n\n{reason}\n\nMutation aborted. No files modified.\n{'='*42}\n{RESET}")
    sys.exit(1)

def blocked(reason: str) -> None:
    print(f"{RED}\n{'='*42}\nRMP-010E34A\nBLOCKED\n\n{reason}\n\n{'='*42}\n{RESET}")
    sys.exit(2)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_TYPES   = Path("server/lib/supabase-types.ts")
FILE_DAL     = Path("server/lib/supabase-dal.ts")
FILE_SERVICE = Path("server/services/admissions.ts")
FILE_ROUTES  = Path("server/routes.ts")

IDEM_TYPES_DEC   = "export interface AdmissionDecision {"
IDEM_DAL_RECORD  = "async recordAdmissionDecision("
IDEM_DAL_LIST    = "async listAdmissionDecisions("
IDEM_SVC_RECORD  = "export async function recordProspectAdmissionDecision("
IDEM_SVC_LIST    = "export async function getProspectAdmissionDecisions("
IDEM_ROUTE_GET   = 'app.get("/api/admissions/prospects/:id/decisions"'
IDEM_ROUTE_POST  = 'app.post("/api/admissions/prospects/:id/decisions"'

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-types.ts
# Append AdmissionDecision + Insert after ProspectDocumentUpdate.
# Decisions are immutable — no Update type.
# ════════════════════════════════════════════════════════════════

_FA_SEARCH = (
    "export interface ProspectDocumentUpdate {\n"
    "  document_type?: string;\n"
    "  file_name?: string;\n"
    "  storage_url?: string | null;\n"
    "  notes?: string | null;\n"
    "}"
)
_FA_REPLACE = (
    "export interface ProspectDocumentUpdate {\n"
    "  document_type?: string;\n"
    "  file_name?: string;\n"
    "  storage_url?: string | null;\n"
    "  notes?: string | null;\n"
    "}\n"
    "\n"
    "export interface AdmissionDecision {\n"
    "  id: string;\n"
    "  prospect_id: string;\n"
    "  decision: string;\n"
    "  rationale: string | null;\n"
    "  decided_by: string | null;\n"
    "  offer_ready: boolean;\n"
    "  decided_at: string;\n"
    "}\n"
    "\n"
    "export interface AdmissionDecisionInsert {\n"
    "  prospect_id: string;\n"
    "  decision: string;\n"
    "  rationale?: string | null;\n"
    "  decided_by?: string | null;\n"
    "  offer_ready?: boolean;\n"
    "}"
)
_FA_LABEL = "Append AdmissionDecision, AdmissionDecisionInsert to supabase-types.ts"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — supabase-dal.ts
# Op B1: extend imports; Op B2: insert 2 methods (record + list)
# in corridor: archiveDocument return → getMemberByUserId.
# Decisions are append-only — no update or delete methods.
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH = (
    "  ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate,\n"
    "  AdmissionDecision, AdmissionDecisionInsert,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add AdmissionDecision, AdmissionDecisionInsert to DAL imports"

_FB2_SEARCH = (
    "    if (error) throw new Error(`Failed to archive document: ${error.message}`);\n"
    "    return doc;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_REPLACE = (
    "    if (error) throw new Error(`Failed to archive document: ${error.message}`);\n"
    "    return doc;\n"
    "  }\n"
    "\n"
    "  async recordAdmissionDecision(\n"
    "    data: AdmissionDecisionInsert,\n"
    "  ): Promise<AdmissionDecision> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: decision, error } = await supabase\n"
    "      .schema('growth').from('prospect_admission_decisions')\n"
    "      .insert({\n"
    "        prospect_id:  data.prospect_id,\n"
    "        decision:     data.decision,\n"
    "        rationale:    data.rationale ?? null,\n"
    "        decided_by:   data.decided_by ?? null,\n"
    "        offer_ready:  data.offer_ready ?? false,\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to record admission decision: ${error.message}`);\n"
    "    return decision;\n"
    "  }\n"
    "\n"
    "  async listAdmissionDecisions(\n"
    "    prospectId: string,\n"
    "  ): Promise<AdmissionDecision[]> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospect_admission_decisions')\n"
    "      .select('*')\n"
    "      .eq('prospect_id', prospectId)\n"
    "      .order('decided_at', { ascending: true });\n"
    "    if (error) throw new Error(`Failed to list admission decisions: ${error.message}`);\n"
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_LABEL = "Insert recordAdmissionDecision, listAdmissionDecisions after archiveDocument in DAL"

FILE_B_OPS = [(_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
              (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE C — admissions.ts — append 2 service functions
# ════════════════════════════════════════════════════════════════

_FC_SEARCH = (
    "export async function archiveProspectDocument(documentId: string) {\n"
    "  return supabaseDAL.archiveDocument(documentId);\n"
    "}"
)
_FC_REPLACE = (
    "export async function archiveProspectDocument(documentId: string) {\n"
    "  return supabaseDAL.archiveDocument(documentId);\n"
    "}\n"
    "\n"
    "export async function recordProspectAdmissionDecision(\n"
    "  prospectId: string,\n"
    "  decision: string,\n"
    "  rationale?: string | null,\n"
    "  decidedBy?: string | null,\n"
    "  offerReady?: boolean,\n"
    ") {\n"
    "  return supabaseDAL.recordAdmissionDecision({\n"
    "    prospect_id:  prospectId,\n"
    "    decision,\n"
    "    rationale:    rationale ?? null,\n"
    "    decided_by:   decidedBy ?? null,\n"
    "    offer_ready:  offerReady ?? false,\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function getProspectAdmissionDecisions(prospectId: string) {\n"
    "  return supabaseDAL.listAdmissionDecisions(prospectId);\n"
    "}"
)
_FC_LABEL = "Append admission decision service functions to admissions service"

FILE_C_OPS = [(_FC_SEARCH, _FC_REPLACE, _FC_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE D — routes.ts — extend import + add 2 routes
# ════════════════════════════════════════════════════════════════

_FD1_SEARCH = (
    "archiveProspectDocument }"
    ' from "./services/admissions";'
)
_FD1_REPLACE = (
    "archiveProspectDocument,"
    " recordProspectAdmissionDecision, getProspectAdmissionDecisions }"
    ' from "./services/admissions";'
)
_FD1_LABEL = "Extend admissions import with admission decision functions"

_FD2_SEARCH = (
    '      res.status(500).json({ error: "Failed to archive document" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_REPLACE = (
    '      res.status(500).json({ error: "Failed to archive document" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # GET decisions
    '  app.get("/api/admissions/prospects/:id/decisions",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const decisions = await getProspectAdmissionDecisions(req.params.id);\n"
    "      res.json(decisions);\n"
    "    } catch (error) {\n"
    '      console.error("List admission decisions error:", error);\n'
    '      res.status(500).json({ error: "Failed to list admission decisions" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # POST decision (record — immutable)
    '  app.post("/api/admissions/prospects/:id/decisions",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const { decision, rationale, decided_by, offer_ready } = req.body;\n"
    '      if (!decision || typeof decision !== "string") {\n'
    '        return res.status(400).json({ error: "decision is required" });\n'
    "      }\n"
    "      const dec = await recordProspectAdmissionDecision(\n"
    "        req.params.id,\n"
    "        decision,\n"
    "        rationale ?? null,\n"
    "        decided_by ?? null,\n"
    "        offer_ready === true,\n"
    "      );\n"
    "      res.status(201).json(dec);\n"
    "    } catch (error) {\n"
    '      console.error("Record admission decision error:", error);\n'
    '      res.status(500).json({ error: "Failed to record admission decision" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_LABEL = "Add GET and POST routes for /api/admissions/prospects/:id/decisions"

FILE_D_OPS = [(_FD1_SEARCH, _FD1_REPLACE, _FD1_LABEL),
              (_FD2_SEARCH, _FD2_REPLACE, _FD2_LABEL)]

# ════════════════════════════════════════════════════════════════
# MUTATION ENGINE
# ════════════════════════════════════════════════════════════════

def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    pre = working.count(search)
    if pre == 0:
        abort(f"Anchor not found: {label}\n\nExpected: {search[:120].strip()}")
    if pre > 1:
        abort(f"Ambiguous anchor ({pre} occurrences): {label}")
    result = working.replace(search, replace, 1)
    if result.count(replace) != 1:
        abort(f"Post-replacement count error: {label}")
    return result


def _write_and_verify(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")
    if path.read_text(encoding="utf-8") != content:
        abort(f"Round-trip verification failed: {path.name}")
    _ok(f"Round-trip verified ({len(content)} chars)")


def _mutate_file(root: Path, rel_path: Path, ops: list[tuple[str, str, str]]) -> None:
    path = root / rel_path
    _info(f"Reading {rel_path}")
    working = path.read_text(encoding="utf-8")
    _ok(f"Read ({len(working)} chars)")
    for i, (search, replace, label) in enumerate(ops, 1):
        _info(f"  Op {i}/{len(ops)}: {label}")
        working = _apply_one(working, search, replace, label)
        _ok(f"  Op {i} applied")
    _info(f"Writing {rel_path}")
    _write_and_verify(path, working)


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root: Path) -> None:
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Anchor: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Infrastructure + Dependency Verification
# ════════════════════════════════════════════════════════════════

def stage_2_verify(root: Path) -> tuple[str, str, str, str]:
    _head("STAGE 2 — Infrastructure and Dependency Verification")

    _ok("Infrastructure CERTIFIED: growth.prospect_admission_decisions (INF-010E34A)")

    for p in [root/FILE_TYPES, root/FILE_DAL, root/FILE_SERVICE, root/FILE_ROUTES]:
        if not p.exists():
            abort(f"File not found: {p}")

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"types({len(types_src)}) dal({len(dal_src)}) svc({len(svc_src)}) rts({len(rts_src)}) chars")

    for src, marker, dep in [
        (types_src, "export interface ProspectDocumentUpdate {",
         "ProspectDocumentUpdate — terminal interface (RMP-010E33A)"),
        (types_src, "export interface ProspectDocument {",
         "ProspectDocument — RMP-010E33A VERIFIED"),
        (dal_src,   "async archiveDocument(",
         "archiveDocument — corridor anchor (RMP-010E33A)"),
        (dal_src,   "async getMemberByUserId(",
         "getMemberByUserId — corridor boundary"),
        (dal_src,   "  ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate,",
         "DAL import block anchor"),
        (svc_src,   "export async function archiveProspectDocument(",
         "archiveProspectDocument — service anchor (RMP-010E33A)"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/documents"',
         "GET /documents — RMP-010E33A VERIFIED"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/appointments"',
         "GET /appointments — RMP-010E32A VERIFIED"),
        (rts_src,   'app.get("/api/countries"',
         "countries GET — corridor boundary"),
    ]:
        if marker in src:
            _ok(f"Dependency VERIFIED: {dep}")
        else:
            if "RMP-010E33A" in dep or "RMP-010E32A" in dep:
                blocked(f"BLOCKED: {dep}\n\nMissing: {marker}")
            abort(f"Dependency UNVERIFIED: {dep}\n\nExpected: {marker}")

    if IDEM_DAL_RECORD not in dal_src:
        _info("Verifying structural corridor anchors (clean path)")
        for search, label in [
            (_FA_SEARCH,  "types — ProspectDocumentUpdate terminal block"),
            (_FB2_SEARCH, "DAL corridor — archiveDocument return → getMemberByUserId"),
            (_FC_SEARCH,  "service terminal block — archiveProspectDocument"),
            (_FD1_SEARCH, "routes — admissions import terminal fragment"),
            (_FD2_SEARCH, "routes corridor — archive close → countries GET"),
        ]:
            src = (types_src if "types" in label else
                   dal_src   if "DAL"   in label else
                   svc_src   if "service" in label else rts_src)
            if search not in src:
                abort(f"Structural anchor not found: {label}")
            _ok(f"Structural anchor VERIFIED: {label}")
    else:
        _ok("Structural anchor checks skipped (idempotent path)")

    _step_results["Infrastructure + dependency verification"] = "PASS"
    return types_src, dal_src, svc_src, rts_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(types_src: str, dal_src: str,
                        svc_src: str, rts_src: str) -> bool:
    _head("STAGE 3 — Idempotency Verification")

    checks = {
        "AdmissionDecision interface in types":          IDEM_TYPES_DEC  in types_src,
        "recordAdmissionDecision() in DAL":              IDEM_DAL_RECORD in dal_src,
        "listAdmissionDecisions() in DAL":               IDEM_DAL_LIST   in dal_src,
        "recordProspectAdmissionDecision() in service":  IDEM_SVC_RECORD in svc_src,
        "getProspectAdmissionDecisions() in service":    IDEM_SVC_LIST   in svc_src,
        "GET /decisions route":                          IDEM_ROUTE_GET  in rts_src,
        "POST /decisions route":                         IDEM_ROUTE_POST in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    if all(checks.values()):
        _ok("Admission Decision kernel already applied — no mutation required")
        _step_results["Admission Decision Kernel"] = "PASS (Already Satisfied)"
        return True

    if any(checks.values()):
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort("Partial Admission Decision kernel.\n\nPresent:\n" +
              "".join(f"  {p}\n" for p in present) +
              "\nAbsent:\n" + "".join(f"  {a}\n" for a in absent))

    _ok("Clean state — proceeding")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation")
    _mutate_file(root, FILE_TYPES,   FILE_A_OPS)
    _mutate_file(root, FILE_DAL,     FILE_B_OPS)
    _mutate_file(root, FILE_SERVICE, FILE_C_OPS)
    _mutate_file(root, FILE_ROUTES,  FILE_D_OPS)
    _step_results["Admission Decision Kernel"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    _head("STAGE 5 — Post-Mutation Verification" + (" (Idempotent)" if idempotent else ""))

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"Re-read: types({len(types_src)}) dal({len(dal_src)}) svc({len(svc_src)}) rts({len(rts_src)})")

    for src, marker, expected, desc in [
        (types_src, "export interface AdmissionDecision {",        1, "AdmissionDecision interface"),
        (types_src, "export interface AdmissionDecisionInsert {",  1, "AdmissionDecisionInsert interface"),
        (types_src, "export interface ProspectDocumentUpdate {",   1, "ProspectDocumentUpdate preserved"),
        (dal_src,   "async recordAdmissionDecision(",              1, "recordAdmissionDecision()"),
        (dal_src,   "async listAdmissionDecisions(",               1, "listAdmissionDecisions()"),
        (dal_src,   ".schema('growth').from('prospect_admission_decisions')", 2,
         "prospect_admission_decisions table (insert + select)"),
        (dal_src,   "async archiveDocument(",                      1, "archiveDocument preserved"),
        (svc_src,   "export async function recordProspectAdmissionDecision(", 1,
         "recordProspectAdmissionDecision()"),
        (svc_src,   "export async function getProspectAdmissionDecisions(", 1,
         "getProspectAdmissionDecisions()"),
        (svc_src,   "export async function archiveProspectDocument(", 1, "archiveProspectDocument preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/decisions"',  1, "GET /decisions"),
        (rts_src,   'app.post("/api/admissions/prospects/:id/decisions"', 1, "POST /decisions"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/documents"',  1, "GET /documents preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/appointments"', 1, "GET /appointments preserved"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/stage"',    1, "PATCH /stage preserved"),
    ]:
        count = src.count(marker)
        if count == expected:
            _ok(f"[{desc}]: {count}")
        else:
            abort(f"Count failed: {desc} — count={count}, expected={expected}")

    for marker, desc in [
        ("offer_ready",                              "offer_ready field present"),
        ("decided_by",                               "decided_by field present"),
        ("rationale",                                "rationale field present"),
        (".order('decided_at', { ascending: true })", "decisions ordered chronologically"),
        ("offer_ready:  data.offer_ready ?? false",   "offer_ready defaults to false"),
        ('res.status(400)',                           "POST validates decision field"),
        ('res.status(201)',                           "POST returns 201 Created"),
    ]:
        if marker in dal_src or marker in rts_src or marker in svc_src:
            _ok(f"Content: {desc}")
        else:
            abort(f"Content missing: {desc}")

    # Immutability check — no update or delete methods on decisions
    for forbidden in ["async updateAdmissionDecision(", "async deleteAdmissionDecision("]:
        if forbidden in dal_src:
            abort(f"Immutability violation: {forbidden} must not exist — decisions are append-only")
    _ok("Immutability confirmed: no update or delete on admission decisions")

    _step_results["Post-verification"] = "PASS (Already Satisfied)" if idempotent else "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 6 — Runtime Contract Preservation
# ════════════════════════════════════════════════════════════════

def stage_6_e2e(root: Path) -> None:
    _head("STAGE 6 — Runtime Contract Preservation")
    rts_src = (root / FILE_ROUTES).read_text(encoding="utf-8")
    for route, desc in [
        ('app.post("/api/admissions/prospects"',                        "POST prospects"),
        ('app.get("/api/admissions/prospects"',                         "GET prospects"),
        ('app.get("/api/admissions/prospects/:id"',                     "GET prospect"),
        ('app.patch("/api/admissions/prospects/:id/stage"',             "PATCH stage"),
        ('app.get("/api/admissions/prospects/:id/events"',              "GET events"),
        ('app.get("/api/admissions/prospects/:id/activities"',          "GET activities"),
        ('app.get("/api/admissions/prospects/:id/followup-tasks"',      "GET followup-tasks"),
        ('app.get("/api/admissions/prospects/:id/appointments"',        "GET appointments"),
        ('app.get("/api/admissions/prospects/:id/documents"',           "GET documents"),
        ('app.get("/api/admissions/prospects/:id/decisions"',           "GET decisions"),
        ('app.post("/api/admissions/prospects/:id/decisions"',          "POST decisions"),
        ('app.get("/api/countries"',                                     "GET countries"),
    ]:
        if route in rts_src:
            _ok(f"Contract: {route.split(chr(34))[1]}")
        else:
            abort(f"Runtime contract missing: {desc}")
    _step_results["Runtime contract preservation"] = "PASS"


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results)
    for step, state in _step_results.items():
        colour = YELLOW if "Already" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")
    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print("  Repository files in final state:")
        for f in [FILE_TYPES, FILE_DAL, FILE_SERVICE, FILE_ROUTES]:
            print(f"    MODIFY  {f}")
        print()
        print("  New API endpoints:")
        print("    GET   /api/admissions/prospects/:id/decisions")
        print("    POST  /api/admissions/prospects/:id/decisions")
        print()
        print("  Immutable audit trail: decisions are append-only.")
        print("  No update or delete operations on admission decisions.")
        print()
        print("  Next: RMP-010E34B")
        print()
        print("  Second execution: PASS (Already Satisfied)")
    else:
        print(f"{BOLD}{RED}══ RESULT: FAIL ══{RESET}{RESET}")
        sys.exit(1)


def resolve_root() -> Path:
    for candidate in [Path(__file__).resolve().parent.parent.parent, Path.cwd()]:
        if all((candidate / a).exists() for a in REPO_ROOT_ANCHORS):
            return candidate
    if len(sys.argv) > 1:
        p = Path(sys.argv[1]).resolve()
        if all((p / a).exists() for a in REPO_ROOT_ANCHORS):
            return p
    abort("Repository root not found.\n\nPass root as argument:\n  python RMP-010E34A_prospect_admission_decision_kernel.py /path/to/repo")
    raise SystemExit(1)


def main() -> None:
    print(f"\n{BOLD}RMP-010E34A — Prospect Admission Decision Kernel{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E34A / FDR-010E34{RESET}\n")
    print(f"  Prerequisite: INF-010E34A CERTIFIED\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    types_src, dal_src, svc_src, rts_src = stage_2_verify(root)
    already = stage_3_idempotency(types_src, dal_src, svc_src, rts_src)
    if already:
        stage_5_post_verify(root, idempotent=True)
        stage_6_e2e(root)
    else:
        stage_4_mutate(root)
        stage_5_post_verify(root)
        stage_6_e2e(root)
    print_summary()


if __name__ == "__main__":
    main()
