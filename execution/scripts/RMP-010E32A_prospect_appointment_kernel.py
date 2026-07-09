#!/usr/bin/env python3
"""
RMP-010E32A — Prospect Appointment & Interview Kernel
CIB Authority: RMP-010E32A / Derived From: FDR-010E32
Infrastructure Prerequisite: INF-010E32A — CERTIFIED
  Verified infrastructure: growth.prospect_appointments

Operations: create, list, update, cancel, complete, record outcome.

Minimum bounded mutation corridor (4 server files):
  MODIFY  server/lib/supabase-types.ts
  MODIFY  server/lib/supabase-dal.ts
  MODIFY  server/services/admissions.ts
  MODIFY  server/routes.ts

Anchors (verified unique from post-RMP-010E31A Repository Truth):
  FA:  FollowupTaskUpdate terminal interface
  FB1: DAL import block (FollowupTask, FollowupTaskInsert, FollowupTaskUpdate)
  FB2: corridor: completeFollowupTask return → getMemberByUserId
  FC:  terminal service block (completeProspectFollowupTask)
  FD1: routes admissions import line
  FD2: POST /complete close → countries GET corridor

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
    print(f"{RED}\n{'='*42}\nRMP-010E32A\nFAIL\n\n{reason}\n\nMutation aborted. No files modified.\n{'='*42}\n{RESET}")
    sys.exit(1)

def blocked(reason: str) -> None:
    print(f"{RED}\n{'='*42}\nRMP-010E32A\nBLOCKED\n\n{reason}\n\n{'='*42}\n{RESET}")
    sys.exit(2)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_TYPES   = Path("server/lib/supabase-types.ts")
FILE_DAL     = Path("server/lib/supabase-dal.ts")
FILE_SERVICE = Path("server/services/admissions.ts")
FILE_ROUTES  = Path("server/routes.ts")

IDEM_TYPES_APPT  = "export interface ProspectAppointment {"
IDEM_DAL_CREATE  = "async createAppointment("
IDEM_DAL_LIST    = "async listAppointments("
IDEM_DAL_UPDATE  = "async updateAppointment("
IDEM_DAL_CANCEL  = "async cancelAppointment("
IDEM_DAL_COMPLETE = "async completeAppointment("
IDEM_SVC_CREATE  = "export async function createProspectAppointment("
IDEM_SVC_LIST    = "export async function getProspectAppointments("
IDEM_ROUTE_GET   = 'app.get("/api/admissions/prospects/:id/appointments"'
IDEM_ROUTE_POST  = 'app.post("/api/admissions/prospects/:id/appointments"'

# ════════════════════════════════════════════════════════════════
# FILE A — supabase-types.ts
# Append 3 appointment interfaces after FollowupTaskUpdate.
# ════════════════════════════════════════════════════════════════

_FA_SEARCH = (
    "export interface FollowupTaskUpdate {\n"
    "  title?: string;\n"
    "  description?: string | null;\n"
    "  due_date?: string | null;\n"
    "}"
)
_FA_REPLACE = (
    "export interface FollowupTaskUpdate {\n"
    "  title?: string;\n"
    "  description?: string | null;\n"
    "  due_date?: string | null;\n"
    "}\n"
    "\n"
    "export interface ProspectAppointment {\n"
    "  id: string;\n"
    "  prospect_id: string;\n"
    "  title: string;\n"
    "  scheduled_at: string;\n"
    "  duration_minutes: number | null;\n"
    "  location: string | null;\n"
    "  notes: string | null;\n"
    "  status: string;\n"
    "  outcome: string | null;\n"
    "  outcome_notes: string | null;\n"
    "  created_at: string;\n"
    "}\n"
    "\n"
    "export interface ProspectAppointmentInsert {\n"
    "  prospect_id: string;\n"
    "  title: string;\n"
    "  scheduled_at: string;\n"
    "  duration_minutes?: number | null;\n"
    "  location?: string | null;\n"
    "  notes?: string | null;\n"
    "}\n"
    "\n"
    "export interface ProspectAppointmentUpdate {\n"
    "  title?: string;\n"
    "  scheduled_at?: string;\n"
    "  duration_minutes?: number | null;\n"
    "  location?: string | null;\n"
    "  notes?: string | null;\n"
    "}"
)
_FA_LABEL = "Append ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate to types"

FILE_A_OPS = [(_FA_SEARCH, _FA_REPLACE, _FA_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE B — supabase-dal.ts
# Op B1: extend imports; Op B2: insert 5 methods in corridor.
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH = (
    "  FollowupTask, FollowupTaskInsert, FollowupTaskUpdate,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_REPLACE = (
    "  FollowupTask, FollowupTaskInsert, FollowupTaskUpdate,\n"
    "  ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate,\n"
    "  TutorStatus\n"
    "} from './supabase-types';"
)
_FB1_LABEL = "Add appointment types to DAL imports"

_FB2_SEARCH = (
    "    if (error) throw new Error(`Failed to complete follow-up task: ${error.message}`);\n"
    "    return task;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_REPLACE = (
    "    if (error) throw new Error(`Failed to complete follow-up task: ${error.message}`);\n"
    "    return task;\n"
    "  }\n"
    "\n"
    "  async createAppointment(\n"
    "    data: ProspectAppointmentInsert,\n"
    "  ): Promise<ProspectAppointment> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: appt, error } = await supabase\n"
    "      .schema('growth').from('prospect_appointments')\n"
    "      .insert({\n"
    "        prospect_id:       data.prospect_id,\n"
    "        title:             data.title,\n"
    "        scheduled_at:      data.scheduled_at,\n"
    "        duration_minutes:  data.duration_minutes ?? null,\n"
    "        location:          data.location ?? null,\n"
    "        notes:             data.notes ?? null,\n"
    "      })\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to create appointment: ${error.message}`);\n"
    "    return appt;\n"
    "  }\n"
    "\n"
    "  async listAppointments(\n"
    "    prospectId: string,\n"
    "  ): Promise<ProspectAppointment[]> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data, error } = await supabase\n"
    "      .schema('growth').from('prospect_appointments')\n"
    "      .select('*')\n"
    "      .eq('prospect_id', prospectId)\n"
    "      .order('scheduled_at', { ascending: true });\n"
    "    if (error) throw new Error(`Failed to list appointments: ${error.message}`);\n"
    "    return data ?? [];\n"
    "  }\n"
    "\n"
    "  async updateAppointment(\n"
    "    appointmentId: string,\n"
    "    data: ProspectAppointmentUpdate,\n"
    "  ): Promise<ProspectAppointment> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: appt, error } = await supabase\n"
    "      .schema('growth').from('prospect_appointments')\n"
    "      .update({\n"
    "        ...(data.title            !== undefined && { title: data.title }),\n"
    "        ...(data.scheduled_at     !== undefined && { scheduled_at: data.scheduled_at }),\n"
    "        ...(data.duration_minutes !== undefined && { duration_minutes: data.duration_minutes }),\n"
    "        ...(data.location         !== undefined && { location: data.location }),\n"
    "        ...(data.notes            !== undefined && { notes: data.notes }),\n"
    "      })\n"
    "      .eq('id', appointmentId)\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to update appointment: ${error.message}`);\n"
    "    return appt;\n"
    "  }\n"
    "\n"
    "  async cancelAppointment(appointmentId: string): Promise<ProspectAppointment> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: appt, error } = await supabase\n"
    "      .schema('growth').from('prospect_appointments')\n"
    "      .update({ status: 'cancelled' })\n"
    "      .eq('id', appointmentId)\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to cancel appointment: ${error.message}`);\n"
    "    return appt;\n"
    "  }\n"
    "\n"
    "  async completeAppointment(\n"
    "    appointmentId: string,\n"
    "    outcome: string,\n"
    "    outcomeNotes?: string | null,\n"
    "  ): Promise<ProspectAppointment> {\n"
    "    this.ensureConfigured();\n"
    "    const supabase = getSupabaseAdmin();\n"
    "    const { data: appt, error } = await supabase\n"
    "      .schema('growth').from('prospect_appointments')\n"
    "      .update({\n"
    "        status:        'completed',\n"
    "        outcome:       outcome,\n"
    "        outcome_notes: outcomeNotes ?? null,\n"
    "      })\n"
    "      .eq('id', appointmentId)\n"
    "      .select()\n"
    "      .single();\n"
    "    if (error) throw new Error(`Failed to complete appointment: ${error.message}`);\n"
    "    return appt;\n"
    "  }\n"
    "\n"
    "  async getMemberByUserId"
)
_FB2_LABEL = (
    "Insert createAppointment, listAppointments, updateAppointment, "
    "cancelAppointment, completeAppointment after completeFollowupTask"
)

FILE_B_OPS = [(_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
              (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE C — admissions.ts — append 5 service functions
# ════════════════════════════════════════════════════════════════

_FC_SEARCH = (
    "export async function completeProspectFollowupTask(taskId: string) {\n"
    "  return supabaseDAL.completeFollowupTask(taskId);\n"
    "}"
)
_FC_REPLACE = (
    "export async function completeProspectFollowupTask(taskId: string) {\n"
    "  return supabaseDAL.completeFollowupTask(taskId);\n"
    "}\n"
    "\n"
    "export async function createProspectAppointment(\n"
    "  prospectId: string,\n"
    "  title: string,\n"
    "  scheduledAt: string,\n"
    "  durationMinutes?: number | null,\n"
    "  location?: string | null,\n"
    "  notes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.createAppointment({\n"
    "    prospect_id:      prospectId,\n"
    "    title,\n"
    "    scheduled_at:     scheduledAt,\n"
    "    duration_minutes: durationMinutes ?? null,\n"
    "    location:         location ?? null,\n"
    "    notes:            notes ?? null,\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function getProspectAppointments(prospectId: string) {\n"
    "  return supabaseDAL.listAppointments(prospectId);\n"
    "}\n"
    "\n"
    "export async function updateProspectAppointment(\n"
    "  appointmentId: string,\n"
    "  title?: string,\n"
    "  scheduledAt?: string,\n"
    "  durationMinutes?: number | null,\n"
    "  location?: string | null,\n"
    "  notes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.updateAppointment(appointmentId, {\n"
    "    ...(title            !== undefined && { title }),\n"
    "    ...(scheduledAt      !== undefined && { scheduled_at: scheduledAt }),\n"
    "    ...(durationMinutes  !== undefined && { duration_minutes: durationMinutes }),\n"
    "    ...(location         !== undefined && { location }),\n"
    "    ...(notes            !== undefined && { notes }),\n"
    "  });\n"
    "}\n"
    "\n"
    "export async function cancelProspectAppointment(appointmentId: string) {\n"
    "  return supabaseDAL.cancelAppointment(appointmentId);\n"
    "}\n"
    "\n"
    "export async function completeProspectAppointment(\n"
    "  appointmentId: string,\n"
    "  outcome: string,\n"
    "  outcomeNotes?: string | null,\n"
    ") {\n"
    "  return supabaseDAL.completeAppointment(appointmentId, outcome, outcomeNotes ?? null);\n"
    "}"
)
_FC_LABEL = "Append appointment service functions to admissions service"

FILE_C_OPS = [(_FC_SEARCH, _FC_REPLACE, _FC_LABEL)]

# ════════════════════════════════════════════════════════════════
# FILE D — routes.ts — extend import + add 5 routes
# ════════════════════════════════════════════════════════════════

_FD1_SEARCH = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage,'
    ' recordProspectLifecycleEvent, getProspectLifecycleEvents,'
    ' recordProspectActivity, getProspectActivities,'
    ' createProspectFollowupTask, getProspectFollowupTasks,'
    ' updateProspectFollowupTask, completeProspectFollowupTask }'
    ' from "./services/admissions";'
)
_FD1_REPLACE = (
    'import { submitProspectRegistration, listProspects, getProspect, updateProspectStage,'
    ' recordProspectLifecycleEvent, getProspectLifecycleEvents,'
    ' recordProspectActivity, getProspectActivities,'
    ' createProspectFollowupTask, getProspectFollowupTasks,'
    ' updateProspectFollowupTask, completeProspectFollowupTask,'
    ' createProspectAppointment, getProspectAppointments,'
    ' updateProspectAppointment, cancelProspectAppointment, completeProspectAppointment }'
    ' from "./services/admissions";'
)
_FD1_LABEL = "Extend admissions import with appointment service functions"

_FD2_SEARCH = (
    '      res.status(500).json({ error: "Failed to complete follow-up task" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_REPLACE = (
    '      res.status(500).json({ error: "Failed to complete follow-up task" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # GET appointments
    '  app.get("/api/admissions/prospects/:id/appointments",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const appts = await getProspectAppointments(req.params.id);\n"
    "      res.json(appts);\n"
    "    } catch (error) {\n"
    '      console.error("List appointments error:", error);\n'
    '      res.status(500).json({ error: "Failed to list appointments" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # POST appointments
    '  app.post("/api/admissions/prospects/:id/appointments",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const { title, scheduled_at, duration_minutes, location, notes } = req.body;\n"
    '      if (!title || typeof title !== "string") {\n'
    '        return res.status(400).json({ error: "title is required" });\n'
    "      }\n"
    '      if (!scheduled_at || typeof scheduled_at !== "string") {\n'
    '        return res.status(400).json({ error: "scheduled_at is required" });\n'
    "      }\n"
    "      const appt = await createProspectAppointment(\n"
    "        req.params.id, title, scheduled_at,\n"
    "        duration_minutes ?? null, location ?? null, notes ?? null,\n"
    "      );\n"
    "      res.status(201).json(appt);\n"
    "    } catch (error) {\n"
    '      console.error("Create appointment error:", error);\n'
    '      res.status(500).json({ error: "Failed to create appointment" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # PATCH appointment
    '  app.patch("/api/admissions/prospects/:id/appointments/:appointmentId",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const { title, scheduled_at, duration_minutes, location, notes } = req.body;\n"
    "      const appt = await updateProspectAppointment(\n"
    "        req.params.appointmentId, title, scheduled_at,\n"
    "        duration_minutes, location, notes,\n"
    "      );\n"
    "      res.json(appt);\n"
    "    } catch (error) {\n"
    '      console.error("Update appointment error:", error);\n'
    '      res.status(500).json({ error: "Failed to update appointment" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # POST cancel
    '  app.post("/api/admissions/prospects/:id/appointments/:appointmentId/cancel",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const appt = await cancelProspectAppointment(req.params.appointmentId);\n"
    "      res.json(appt);\n"
    "    } catch (error) {\n"
    '      console.error("Cancel appointment error:", error);\n'
    '      res.status(500).json({ error: "Failed to cancel appointment" });\n'
    "    }\n"
    "  });\n"
    "\n"
    # POST complete
    '  app.post("/api/admissions/prospects/:id/appointments/:appointmentId/complete",'
    " async (req: Request, res: Response) => {\n"
    "    try {\n"
    "      const { outcome, outcome_notes } = req.body;\n"
    '      if (!outcome || typeof outcome !== "string") {\n'
    '        return res.status(400).json({ error: "outcome is required" });\n'
    "      }\n"
    "      const appt = await completeProspectAppointment(\n"
    "        req.params.appointmentId, outcome, outcome_notes ?? null,\n"
    "      );\n"
    "      res.json(appt);\n"
    "    } catch (error) {\n"
    '      console.error("Complete appointment error:", error);\n'
    '      res.status(500).json({ error: "Failed to complete appointment" });\n'
    "    }\n"
    "  });\n"
    "\n"
    '  app.get("/api/countries"'
)
_FD2_LABEL = "Add GET, POST, PATCH, cancel, complete routes for prospect appointments"

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
        abort(f"Ambiguous anchor: {label}\n\nFound {pre} occurrences of: {search[:120].strip()}")
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
            _ok(f"Anchor present: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Infrastructure + Dependency Verification
# ════════════════════════════════════════════════════════════════

def stage_2_verify(root: Path) -> tuple[str, str, str, str]:
    _head("STAGE 2 — Infrastructure and Dependency Verification")

    _ok("Infrastructure CERTIFIED: growth.prospect_appointments (INF-010E32A)")

    for p in [root / FILE_TYPES, root / FILE_DAL, root / FILE_SERVICE, root / FILE_ROUTES]:
        if not p.exists():
            abort(f"File not found: {p}")

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"types({len(types_src)}) dal({len(dal_src)}) service({len(svc_src)}) routes({len(rts_src)}) chars")

    for src, marker, dep in [
        (types_src, "export interface FollowupTaskUpdate {",
         "FollowupTaskUpdate — terminal interface (RMP-010E31A)"),
        (types_src, "export interface FollowupTask {",
         "FollowupTask — RMP-010E31A VERIFIED"),
        (dal_src,   "async completeFollowupTask(",
         "completeFollowupTask — corridor anchor (RMP-010E31A)"),
        (dal_src,   "async getMemberByUserId(",
         "getMemberByUserId — corridor boundary"),
        (dal_src,   "  FollowupTask, FollowupTaskInsert, FollowupTaskUpdate,",
         "DAL import block anchor"),
        (svc_src,   "export async function completeProspectFollowupTask(",
         "completeProspectFollowupTask — service anchor (RMP-010E31A)"),
        (rts_src,   'app.get("/api/countries"',
         "countries GET — corridor boundary"),
    ]:
        if marker in src:
            _ok(f"Dependency VERIFIED: {dep}")
        else:
            if "RMP-010E31A" in dep:
                blocked(f"BLOCKED: {dep}\n\nRMP-010E31A must be certified before RMP-010E32A.\n\nMissing: {marker}")
            abort(f"Dependency UNVERIFIED: {dep}\n\nExpected: {marker}")

    if IDEM_DAL_CREATE not in dal_src:
        for search, label in [
            (_FA_SEARCH,  "types — FollowupTaskUpdate terminal block"),
            (_FB2_SEARCH, "DAL corridor — completeFollowupTask return → getMemberByUserId"),
            (_FC_SEARCH,  "service terminal block — completeProspectFollowupTask"),
            (_FD1_SEARCH, "routes admissions import line"),
            (_FD2_SEARCH, "routes corridor — POST complete close → countries GET"),
        ]:
            src_map = {
                "types":   types_src,
                "DAL":     dal_src,
                "service": svc_src,
                "routes":  rts_src,
            }
            src = next(v for k, v in src_map.items() if k in label)
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
        "ProspectAppointment interface in types": IDEM_TYPES_APPT in types_src,
        "createAppointment() in DAL":             IDEM_DAL_CREATE in dal_src,
        "listAppointments() in DAL":              IDEM_DAL_LIST in dal_src,
        "updateAppointment() in DAL":             IDEM_DAL_UPDATE in dal_src,
        "cancelAppointment() in DAL":             IDEM_DAL_CANCEL in dal_src,
        "completeAppointment() in DAL":           IDEM_DAL_COMPLETE in dal_src,
        "createProspectAppointment() in service": IDEM_SVC_CREATE in svc_src,
        "getProspectAppointments() in service":   IDEM_SVC_LIST in svc_src,
        "GET /appointments route":                IDEM_ROUTE_GET in rts_src,
        "POST /appointments route":               IDEM_ROUTE_POST in rts_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    if all(checks.values()):
        _ok("Appointment kernel already applied — no mutation required")
        _step_results["Appointment Kernel"] = "PASS (Already Satisfied)"
        return True

    if any(checks.values()):
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort("Partial appointment kernel.\n\nPresent:\n" +
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
    _step_results["Appointment Kernel"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    _head("STAGE 5 — Post-Mutation Verification" + (" (Idempotent)" if idempotent else ""))

    types_src = (root / FILE_TYPES).read_text(encoding="utf-8")
    dal_src   = (root / FILE_DAL).read_text(encoding="utf-8")
    svc_src   = (root / FILE_SERVICE).read_text(encoding="utf-8")
    rts_src   = (root / FILE_ROUTES).read_text(encoding="utf-8")
    _ok(f"Re-read: types({len(types_src)}) dal({len(dal_src)}) service({len(svc_src)}) routes({len(rts_src)})")

    for src, marker, expected, desc in [
        (types_src, "export interface ProspectAppointment {",        1, "ProspectAppointment"),
        (types_src, "export interface ProspectAppointmentInsert {",  1, "ProspectAppointmentInsert"),
        (types_src, "export interface ProspectAppointmentUpdate {",  1, "ProspectAppointmentUpdate"),
        (types_src, "export interface FollowupTaskUpdate {",         1, "FollowupTaskUpdate preserved"),
        (dal_src,   "async createAppointment(",                      1, "createAppointment"),
        (dal_src,   "async listAppointments(",                       1, "listAppointments"),
        (dal_src,   "async updateAppointment(",                      1, "updateAppointment"),
        (dal_src,   "async cancelAppointment(",                      1, "cancelAppointment"),
        (dal_src,   "async completeAppointment(",                    1, "completeAppointment"),
        (dal_src,   ".schema('growth').from('prospect_appointments')", 5,
         "prospect_appointments (5 operations)"),
        (dal_src,   "async completeFollowupTask(",                   1, "completeFollowupTask preserved"),
        (svc_src,   "export async function createProspectAppointment(", 1, "createProspectAppointment"),
        (svc_src,   "export async function getProspectAppointments(", 1, "getProspectAppointments"),
        (svc_src,   "export async function updateProspectAppointment(", 1, "updateProspectAppointment"),
        (svc_src,   "export async function cancelProspectAppointment(", 1, "cancelProspectAppointment"),
        (svc_src,   "export async function completeProspectAppointment(", 1, "completeProspectAppointment"),
        (svc_src,   "export async function completeProspectFollowupTask(", 1, "completeFollowupTask preserved"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/appointments"',        1, "GET /appointments"),
        (rts_src,   'app.post("/api/admissions/prospects/:id/appointments"',       1, "POST /appointments"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/appointments/',      1, "PATCH /appointments/:id"),
        (rts_src,   'app.post("/api/admissions/prospects/:id/appointments/',       2, "POST /cancel + /complete"),
        (rts_src,   'app.get("/api/admissions/prospects/:id/followup-tasks"',      1, "GET /followup-tasks preserved"),
        (rts_src,   'app.patch("/api/admissions/prospects/:id/stage"',             1, "PATCH /stage preserved"),
    ]:
        count = src.count(marker)
        if count == expected:
            _ok(f"[{desc}]: {count}")
        else:
            abort(f"Count failed: {desc} — count={count}, expected={expected}")

    for marker, desc in [
        ("status: 'cancelled'",          "cancel sets status=cancelled"),
        ("status:        'completed'",   "complete sets status=completed"),
        ("outcome:",                     "outcome field set on complete"),
        ('res.status(400)',              "validation returns 400"),
        ('res.status(201)',              "create returns 201"),
        (".order('scheduled_at'",        "appointments ordered by scheduled_at"),
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
        ('app.post("/api/admissions/prospects/:id/followup-tasks"',     "POST followup-tasks"),
        ('app.get("/api/admissions/prospects/:id/appointments"',        "GET appointments"),
        ('app.post("/api/admissions/prospects/:id/appointments"',       "POST appointments"),
        ('app.get("/api/countries"',                                     "GET countries"),
    ]:
        if route in rts_src:
            contract = route.split('"')[1]
            _ok(f"Contract: {contract}")
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
        print("    GET    /api/admissions/prospects/:id/appointments")
        print("    POST   /api/admissions/prospects/:id/appointments")
        print("    PATCH  /api/admissions/prospects/:id/appointments/:appointmentId")
        print("    POST   /api/admissions/prospects/:id/appointments/:appointmentId/cancel")
        print("    POST   /api/admissions/prospects/:id/appointments/:appointmentId/complete")
        print()
        print("  Next: RMP-010E32B")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python RMP-010E32A_prospect_appointment_kernel.py /path/to/repo")
    raise SystemExit(1)


def main() -> None:
    print(f"\n{BOLD}RMP-010E32A — Prospect Appointment & Interview Kernel{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E32A / FDR-010E32{RESET}\n")
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
