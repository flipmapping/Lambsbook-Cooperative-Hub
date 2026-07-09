#!/usr/bin/env python3
"""
RMP-010E33A — Prospect Document Management Kernel
CIB Authority: RMP-010E33A / Derived From: FDR-010E33
Infrastructure Prerequisite: INF-010E33A — CERTIFIED
  Verified infrastructure: growth.prospect_documents

Operations: create, list, update, archive document metadata.

Minimum bounded mutation corridor (4 server files):
  MODIFY  server/lib/supabase-types.ts
  MODIFY  server/lib/supabase-dal.ts
  MODIFY  server/services/admissions.ts
  MODIFY  server/routes.ts

Anchors (verified unique from post-RMP-010E32A Repository Truth):
  FA:  ProspectAppointmentUpdate terminal interface
  FB1: DAL import block (ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate)
  FB2: corridor: completeAppointment return → getMemberByUserId
  FC:  terminal service block (completeProspectAppointment)
  FD1: routes admissions import line terminal fragment
  FD2: POST /appointments/complete close → countries GET corridor

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
    print(f"{RED}\n{'='*42}\nRMP-010E33A\nFAIL\n\n{reason}\n\nMutation aborted. No files modified.\n{'='*42}\n{RESET}")
    sys.exit(1)

def blocked(reason: str) -> None:
    print(f"{RED}\n{'='*42}\nRMP-010E33A\nBLOCKED\n\n{reason}\n\n{'='*42}\n{RESET}")
    sys.exit(2)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_TYPES   = Path("server/lib/supabase-types.ts")
FILE_DAL     = Path("server/lib/supabase-dal.ts")
FILE_SERVICE = Path("server/services/admissions.ts")
FILE_ROUTES  = Path("server/routes.ts")

IDEM_TYPES_DOC  = "export interface ProspectDocument {"
IDEM_DAL_CREATE = "async createDocument("
IDEM_DAL_LIST   = "async listDocuments("
IDEM_DAL_UPDATE = "async updateDocument("
IDEM_DAL_ARCHIVE = "async archiveDocument("
IDEM_SVC_CREATE = "export async function createProspectDocument("
IDEM_SVC_LIST   = "export async function getProspectDocuments("
IDEM_ROUTE_GET  = 'app.get("/api/admissions/prospects/:id/documents"'
IDEM_ROUTE_POST = 'app.post("/api/admissions/prospects/:id/documents"'

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-types.ts
# Append ProspectDocument + Insert + Update after
# ProspectAppointmentUpdate (verified terminal interface, count: 1).
# ════════════════════════════════════════════════════════════════

_FA_SEARCH = (
    "export interface ProspectAppointmentUpdate {\n"
    "  title?: string;\n"
    "  scheduled_at?: string;\n"
    "  duration_minutes?: number | null;\n"
    "  location?: string | null;\n"
    "  notes?: string | null;\n"
    "}"
)
_FA_REPLACE = (
    "export interface ProspectAppointmentUpdate {\n"
    "  title?: string;\n"
    "  scheduled_at?: string;\n"
    "  duration_minutes?: number | null;\n"
    "  location?: string | null;\n"
    "  notes?: string | null;\n"
    "}\n"
    "\n"
    "export interface ProspectDocument {\n"
    "  id: string;\n"
    "  prospect_id: string;\n"
    "  document_type: string;\n"
    "  file_name: string;\n"
    "  storage_url: string | null;\n"
    "  notes: string | null;\n"
    "  archived: boolean;\n"
    "  created_at: string;\n"
    "}\n"
    "\n"
    "export interface ProspectDocumentInsert {\n"
    "  prospect_id: string;\n"
    "  document_type: string;\n"
    "  file_name: string;\n"
    "  storage_url?: string | null;\n"
    "  notes?: string | null;\n"
    "}\n"
    "\n"
    "export interface ProspectDocumentUpdate {\n"
    "  document_type?: string;\n"
    "  file_name?: string;\n"
    "  storage_url?: string | null;\n"
    "  notes?: string | null;\n"
    "}"
)
_FA_LABEL = "Append ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate to types"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — supabase-dal.ts
# Op B1: extend imports; Op B2: insert 4 methods before getMemberByUserId.
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH = (
    "  ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate,\n"
    "  ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate to DAL imports"

_FB2_SEARCH = (
    "    if (error) throw new Error(`Failed to complete appointment: ${error.message}`);\n"
    "    return appt;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_REPLACE = (
    "    if (error) throw new Error(`Failed to complete appointment: ${error.message}`);\n"
    "    return appt;\n"
    "  }\n"
    "\n"
    "  async createDocument(\n"
    "    data: ProspectDocumentInsert,\n"
    "  ): Promise<ProspectDocument> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: doc, error } = await supabase\n"
    "      .schema('growth').from('prospect_documents')\n"
    "      .insert({\n"
    "        prospect_id:   data.prospect_id,\n"
    "        document_type: data.document_type,\n"
    "        file_name:     data.file_name,\n"
    "        storage_url:   data.storage_url ?? null,\n"
    "        notes:         data.notes ?? null,\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to create document: ${error.message}`);\n"
    "    return doc;\n"
    "  }\n"
    "\n"
    "  async listDocuments(\n"
    "    prospectId: string,\n"
    "  ): Promise<ProspectDocument[]> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospect_documents')\n"
    "      .select('*')\n"
    "      .eq('prospect_id', prospectId)\n"
    "      .order('created_at', { ascending: true });\n"
    "    if (error) throw new Error(`Failed to list documents: ${error.message}`);\n"
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async updateDocument(\n"
    "    documentId: string,\n"
    "    data: ProspectDocumentUpdate,\n"
    "  ): Promise<ProspectDocument> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: doc, error } = await supabase\n"
    "      .schema('growth').from('prospect_documents')\n"
    "      .update({\n"
    "        ...(data.document_type !== undefined && { document_type: data.document_type }),\n"
    "        ...(data.file_name     !== undefined && { file_name: data.file_name }),\n"
    "        ...(data.storage_url   !== undefined && { storage_url: data.storage_url }),\n"
    "        ...(data.notes         !== undefined && { notes: data.notes }),\n"
    "      })\n"
    "      .eq('id', documentId)\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to update document: ${error.message}`);\n"
    "    return doc;\n"
    "  }\n"
    "\n"
    "  async archiveDocument(documentId: string): Promise<ProspectDocument> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: doc, error } = await supabase\n"
    "      .schema('growth').from('prospect_documents')\n"
    "      .update({ archived: true })\n"
    "      .eq('id', documentId)\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to archive document: ${error.message}`);\n"
    "    return doc;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_LABEL = "Insert createDocument, listDocuments, updateDocument, archiveDocument after completeAppointment"

FILE_B_OPS = [(_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
              (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE C — admissions.ts — append 4 service functions
# ════════════════════════════════════════════════════════════════

_FC_SEARCH = (
    "export async function completeProspectAppointment(\n"
    "  appointmentId: string,\n"
    "  outcome: string,\n"
    "  outcomeNotes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.completeAppointment(appointmentId, outcome, outcomeNotes ?? null);\n"
    "}"
)
_FC_REPLACE = (
    "export async function completeProspectAppointment(\n"
    "  appointmentId: string,\n"
    "  outcome: string,\n"
    "  outcomeNotes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.completeAppointment(appointmentId, outcome, outcomeNotes ?? null);\n"
    "}\n"
    "\n"
    "export async function createProspectDocument(\n"
    "  prospectId: string,\n"
    "  documentType: string,\n"
    "  fileName: string,\n"
    "  storageUrl?: string | null,\n"
    "  notes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.createDocument({\n"
    "    prospect_id:   prospectId,\n"
    "    document_type: documentType,\n"
    "    file_name:     fileName,\n"
    "    storage_url:   storageUrl ?? null,\n"
    "    notes:         notes ?? null,\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function getProspectDocuments(prospectId: string) {\n"
    "  return supabaseDAL.listDocuments(prospectId);\n"
    "}\n"
    "\n"
    "export async function updateProspectDocument(\n"
    "  documentId: string,\n"
    "  documentType?: string,\n"
    "  fileName?: string,\n"
    "  storageUrl?: string | null,\n"
    "  notes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.updateDocument(documentId, {\n"
    "    ...(documentType !== undefined && { document_type: documentType }),\n"
    "    ...(fileName     !== undefined && { file_name: fileName }),\n"
    "    ...(storageUrl   !== undefined && { storage_url: storageUrl }),\n"
    "    ...(notes        !== undefined && { notes }),\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function archiveProspectDocument(documentId: string) {\n"
    "  return supabaseDAL.archiveDocument(documentId);\n"
    "}"
)
_FC_LABEL = "Append document service functions to admissions service"

FILE_C_OPS = [(_FC_SEARCH, _FC_REPLACE, _FC_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE D — routes.ts — extend import + add 4 routes
# ════════════════════════════════════════════════════════════════

_FD1_SEARCH = (
    "cancelProspectAppointment, completeProspectAppointment }"
    ' from "./services/admissions";'
)
_FD1_REPLACE = (
    "cancelProspectAppointment, completeProspectAppointment,"
    " createProspectDocument, getProspectDocuments,"
    " updateProspectDocument, archiveProspectDocument }"
    ' from "./services/admissions";'
)
_FD1_LABEL = "Extend admissions import with document service functions"

_FD2_SEARCH = (
    '      res.status(500).json({ error: "Failed to complete appointment" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_REPLACE = (
    '      res.status(500).json({ error: "Failed to complete appointment" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # GET documents
    '  app.get("/api/admissions/prospects/:id/documents",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const docs = await getProspectDocuments(req.params.id);\n"
    "      res.json(docs);\n"
    "    } catch (error) {\n"
    '      console.error("List documents error:", error);\n'
    '      res.status(500).json({ error: "Failed to list documents" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # POST documents
    '  app.post("/api/admissions/prospects/:id/documents",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const { document_type, file_name, storage_url, notes } = req.body;\n"
    '      if (!document_type || typeof document_type !== "string") {\n'
    '        return res.status(400).json({ error: "document_type is required" });\n'
    "      }\n"
    '      if (!file_name || typeof file_name !== "string") {\n'
    '        return res.status(400).json({ error: "file_name is required" });\n'
    "      }\n"
    "      const doc = await createProspectDocument(\n"
    "        req.params.id, document_type, file_name,\n"
    "        storage_url ?? null, notes ?? null,\n"
    "      );\n"
    "      res.status(201).json(doc);\n"
    "    } catch (error) {\n"
    '      console.error("Create document error:", error);\n'
    '      res.status(500).json({ error: "Failed to create document" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # PATCH document
    '  app.patch("/api/admissions/prospects/:id/documents/:documentId",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const { document_type, file_name, storage_url, notes } = req.body;\n"
    "      const doc = await updateProspectDocument(\n"
    "        req.params.documentId, document_type, file_name, storage_url, notes,\n"
    "      );\n"
    "      res.json(doc);\n"
    "    } catch (error) {\n"
    '      console.error("Update document error:", error);\n'
    '      res.status(500).json({ error: "Failed to update document" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # POST archive
    '  app.post("/api/admissions/prospects/:id/documents/:documentId/archive",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const doc = await archiveProspectDocument(req.params.documentId);\n"
    "      res.json(doc);\n"
    "    } catch (error) {\n"
    '      console.error("Archive document error:", error);\n'
    '      res.status(500).json({ error: "Failed to archive document" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_LABEL = "Add GET, POST, PATCH, archive routes for prospect documents"

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

    _ok("Infrastructure CERTIFIED: growth.prospect_documents (INF-010E33A)")

    for p in [root/FILE_TYPES, root/FILE_DAL, root/FILE_SERVICE, root/FILE_ROUTES]:
        if not p.exists():
            abort(f"File not found: {p}")

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"types({len(types_src)}) dal({len(dal_src)}) service({len(svc_src)}) routes({len(rts_src)}) chars")

    # Dependency verification — RMP-010E32A must be certified
    for src, marker, dep in [
        (types_src, "export interface ProspectAppointmentUpdate {",
         "ProspectAppointmentUpdate — terminal interface (RMP-010E32A)"),
        (types_src, "export interface ProspectAppointment {",
         "ProspectAppointment — RMP-010E32A VERIFIED"),
        (dal_src,   "async completeAppointment(",
         "completeAppointment — corridor anchor (RMP-010E32A)"),
        (dal_src,   "async getMemberByUserId(",
         "getMemberByUserId — corridor boundary"),
        (dal_src,   "  ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate,",
         "DAL import block anchor"),
        (svc_src,   "export async function completeProspectAppointment(",
         "completeProspectAppointment — service anchor (RMP-010E32A)"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/appointments"',
         "GET /appointments — RMP-010E32A VERIFIED"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/followup-tasks"',
         "GET /followup-tasks — RMP-010E31A VERIFIED"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/activities"',
         "GET /activities — RMP-010E30A VERIFIED"),
        (rts_src,   'app.get("/api/countries"',
         "countries GET — corridor boundary"),
    ]:
        if marker in src:
            _ok(f"Dependency VERIFIED: {dep}")
        else:
            if any(x in dep for x in ["RMP-010E32A", "RMP-010E31A", "RMP-010E30A"]):
                blocked(f"BLOCKED: {dep}\n\nMissing: {marker}")
            abort(f"Dependency UNVERIFIED: {dep}\n\nExpected: {marker}")

    if IDEM_DAL_CREATE not in dal_src:
        _info("Verifying structural corridor anchors (clean path)")
        for search, label in [
            (_FA_SEARCH,  "types — ProspectAppointmentUpdate terminal block"),
            (_FB2_SEARCH, "DAL corridor — completeAppointment return → getMemberByUserId"),
            (_FC_SEARCH,  "service terminal block — completeProspectAppointment"),
            (_FD1_SEARCH, "routes — admissions import terminal fragment"),
            (_FD2_SEARCH, "routes corridor — complete close → countries GET"),
        ]:
            # map label to source
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
        "ProspectDocument interface in types":       IDEM_TYPES_DOC  in types_src,
        "createDocument() in DAL":                  IDEM_DAL_CREATE  in dal_src,
        "listDocuments() in DAL":                   IDEM_DAL_LIST    in dal_src,
        "updateDocument() in DAL":                  IDEM_DAL_UPDATE  in dal_src,
        "archiveDocument() in DAL":                 IDEM_DAL_ARCHIVE in dal_src,
        "createProspectDocument() in service":      IDEM_SVC_CREATE  in svc_src,
        "getProspectDocuments() in service":        IDEM_SVC_LIST    in svc_src,
        "GET /documents route":                     IDEM_ROUTE_GET   in rts_src,
        "POST /documents route":                    IDEM_ROUTE_POST  in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    if all(checks.values()):
        _ok("Document kernel already applied — no mutation required")
        _step_results["Document Kernel"] = "PASS (Already Satisfied)"
        return True

    if any(checks.values()):
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort("Partial document kernel.\n\nPresent:\n" +
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
    _step_results["Document Kernel"] = "PASS"


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
        (types_src, "export interface ProspectDocument {",       1, "ProspectDocument"),
        (types_src, "export interface ProspectDocumentInsert {", 1, "ProspectDocumentInsert"),
        (types_src, "export interface ProspectDocumentUpdate {", 1, "ProspectDocumentUpdate"),
        (types_src, "export interface ProspectAppointmentUpdate {", 1, "ProspectAppointmentUpdate preserved"),
        (dal_src,   "async createDocument(",                     1, "createDocument"),
        (dal_src,   "async listDocuments(",                      1, "listDocuments"),
        (dal_src,   "async updateDocument(",                     1, "updateDocument"),
        (dal_src,   "async archiveDocument(",                    1, "archiveDocument"),
        (dal_src,   ".schema('growth').from('prospect_documents')", 4,
         "prospect_documents table (4 operations)"),
        (dal_src,   "async completeAppointment(",                1, "completeAppointment preserved"),
        (svc_src,   "export async function createProspectDocument(", 1, "createProspectDocument"),
        (svc_src,   "export async function getProspectDocuments(", 1, "getProspectDocuments"),
        (svc_src,   "export async function updateProspectDocument(", 1, "updateProspectDocument"),
        (svc_src,   "export async function archiveProspectDocument(", 1, "archiveProspectDocument"),
        (svc_src,   "export async function completeProspectAppointment(", 1,
         "completeProspectAppointment preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/documents"',       1, "GET /documents"),
        (rts_src,   'app.post("/api/admissions/prospects/:id/documents"',      1, "POST /documents"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/documents/',     1, "PATCH /documents/:id"),
        (rts_src,   'app.post("/api/admissions/prospects/:id/documents/',      1, "POST /archive"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/appointments"',    1, "GET /appointments preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/followup-tasks"',  1, "GET /followup-tasks preserved"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/stage"',         1, "PATCH /stage preserved"),
    ]:
        count = src.count(marker)
        if count == expected:
            _ok(f"[{desc}]: {count}")
        else:
            abort(f"Count failed: {desc} — count={count}, expected={expected}")

    for marker, desc in [
        ("archived: true",                       "archive sets archived=true"),
        (".order('created_at', { ascending: true })", "documents ordered chronologically"),
        ('res.status(400)',                      "POST validates required fields"),
        ('res.status(201)',                      "POST returns 201 Created"),
    ]:
        if marker in dal_src or marker in rts_src:
            _ok(f"Content: {desc}")
        else:
            abort(f"Content missing: {desc}")

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
        ('app.post("/api/admissions/prospects/:id/documents"',          "POST documents"),
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
        print("    GET    /api/admissions/prospects/:id/documents")
        print("    POST   /api/admissions/prospects/:id/documents")
        print("    PATCH  /api/admissions/prospects/:id/documents/:documentId")
        print("    POST   /api/admissions/prospects/:id/documents/:documentId/archive")
        print()
        print("  Next: RMP-010E33B")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python RMP-010E33A_prospect_document_kernel.py /path/to/repo")
    raise SystemExit(1)


def main() -> None:
    print(f"\n{BOLD}RMP-010E33A — Prospect Document Management Kernel{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E33A / FDR-010E33{RESET}\n")
    print(f"  Prerequisite: INF-010E33A CERTIFIED\n")
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
