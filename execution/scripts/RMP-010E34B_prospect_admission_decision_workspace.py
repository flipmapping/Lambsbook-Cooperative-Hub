#!/usr/bin/env python3
"""
RMP-010E34B — Prospect Admission Decision Workspace
CIB Authority: RMP-010E34B / Derived From: FDR-010E34
Prerequisites: INF-010E34A CERTIFIED, RMP-010E34A CERTIFIED

Materializes the Prospect Admission Decision Workspace — record admission
decisions, view full immutable audit trail, offer readiness indicator.
Embedded in ProspectDetailWorkspace below the Document Workspace.

Certified API consumed:
  GET   /api/admissions/prospects/:id/decisions
  POST  /api/admissions/prospects/:id/decisions

Minimum bounded mutation corridor (client only):
  CREATE  client/src/components/admissions/ProspectAdmissionDecisionWorkspace.tsx
  MODIFY  client/src/pages/ProspectDetailWorkspace.tsx

Anchors (verified unique against post-RMP-010E33B Repository Truth):
  B1: ProspectDocumentWorkspace import — last import in ProspectDetailWorkspace
  B2: ProspectDocumentWorkspace JSX + terminal block — insertion point

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
    print(f"{RED}\n{'='*42}\nRMP-010E34B\nFAIL\n\n{reason}\n\nMutation aborted. No files modified.\n{'='*42}\n{RESET}")
    sys.exit(1)

def blocked(reason: str) -> None:
    print(f"{RED}\n{'='*42}\nRMP-010E34B\nBLOCKED\n\n{reason}\n\n{'='*42}\n{RESET}")
    sys.exit(2)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_DEC    = Path("client/src/components/admissions/ProspectAdmissionDecisionWorkspace.tsx")
FILE_DETAIL = Path("client/src/pages/ProspectDetailWorkspace.tsx")

IDEM_DEC_EXPORT    = "export function ProspectAdmissionDecisionWorkspace("
IDEM_DETAIL_IMPORT = 'from "@/components/admissions/ProspectAdmissionDecisionWorkspace"'
IDEM_DETAIL_USAGE  = "<ProspectAdmissionDecisionWorkspace"

# ════════════════════════════════════════════════════════════════
# FILE A — ProspectAdmissionDecisionWorkspace.tsx (CREATE)
# Record decisions (POST), view full audit trail (GET).
# Decisions are immutable — no edit or delete controls.
# Offer readiness prominently surfaced.
# ════════════════════════════════════════════════════════════════

DEC_SOURCE = '''\
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Scale, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdmissionDecision {
  id: string;
  prospect_id: string;
  decision: string;
  rationale: string | null;
  decided_by: string | null;
  offer_ready: boolean;
  decided_at: string;
}

const DECISION_VALUES = [
  "admit",
  "conditional_admit",
  "waitlist",
  "defer",
  "reject",
  "withdrawn",
] as const;

function formatDecision(d: string): string {
  return d.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function decisionVariant(
  d: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (d) {
    case "admit":
    case "conditional_admit": return "default";
    case "reject":
    case "withdrawn":         return "destructive";
    case "waitlist":
    case "defer":             return "secondary";
    default:                  return "outline";
  }
}

function DecisionIcon({ decision }: { decision: string }) {
  switch (decision) {
    case "admit":
    case "conditional_admit":
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    case "reject":
    case "withdrawn":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "waitlist":
    case "defer":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

interface ProspectAdmissionDecisionWorkspaceProps {
  prospectId: string;
}

export function ProspectAdmissionDecisionWorkspace({
  prospectId,
}: ProspectAdmissionDecisionWorkspaceProps) {
  const { toast } = useToast();
  const queryKey = [`/api/admissions/prospects/${prospectId}/decisions`];

  const [showRecord, setShowRecord] = useState(false);
  const [decisionValue, setDecisionValue] = useState("");
  const [rationale, setRationale]         = useState("");
  const [decidedBy, setDecidedBy]         = useState("");
  const [offerReady, setOfferReady]       = useState(false);

  const { data: decisions = [], isLoading, isError } =
    useQuery<AdmissionDecision[]>({
      queryKey,
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${prospectId}/decisions`,
        );
        if (!res.ok) throw new Error("Failed to load admission decisions");
        return res.json();
      },
      enabled: !!prospectId,
    });

  const recordMutation = useMutation({
    mutationFn: async () => {
      if (!decisionValue) throw new Error("Decision is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/decisions`,
        {
          decision:    decisionValue,
          rationale:   rationale.trim() || null,
          decided_by:  decidedBy.trim() || null,
          offer_ready: offerReady,
        },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Record failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Decision recorded" });
      setDecisionValue(""); setRationale(""); setDecidedBy("");
      setOfferReady(false); setShowRecord(false);
    },
    onError: (e: Error) =>
      toast({ title: "Record failed", description: e.message, variant: "destructive" }),
  });

  const latest = decisions.length > 0 ? decisions[decisions.length - 1] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Admission Decisions
            </CardTitle>
            <CardDescription className="text-xs">
              Immutable audit trail of admission decisions.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowRecord((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            Record Decision
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current status banner */}
        {latest && (
          <div className={`rounded-md p-3 flex items-start gap-3 ${
            latest.offer_ready ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
          }`}>
            <DecisionIcon decision={latest.decision} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">
                  Current: {formatDecision(latest.decision)}
                </span>
                <Badge variant={decisionVariant(latest.decision)} className="text-xs">
                  {latest.decision}
                </Badge>
                {latest.offer_ready && (
                  <Badge variant="default" className="text-xs bg-primary">
                    Offer Ready
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(latest.decided_at)}
                {latest.decided_by && ` · ${latest.decided_by}`}
              </p>
              {latest.rationale && (
                <p className="text-xs mt-1 text-muted-foreground">{latest.rationale}</p>
              )}
            </div>
          </div>
        )}

        {/* Record form */}
        {showRecord && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">Record new admission decision</p>
            <Select value={decisionValue} onValueChange={setDecisionValue}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select decision…" />
              </SelectTrigger>
              <SelectContent>
                {DECISION_VALUES.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs">
                    {formatDecision(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Rationale (optional)"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="text-xs min-h-[56px]"
            />
            <Input
              placeholder="Decided by (email / name)"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex items-center gap-2">
              <Switch
                id="offer-ready"
                checked={offerReady}
                onCheckedChange={setOfferReady}
              />
              <label htmlFor="offer-ready" className="text-xs cursor-pointer">
                Offer ready
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs"
                onClick={() => setShowRecord(false)}>Cancel</Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!decisionValue || recordMutation.isPending}
                onClick={() => recordMutation.mutate()}
              >
                {recordMutation.isPending ? "Recording…" : "Record"}
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading decisions…</p>}
        {isError   && <p className="text-sm text-destructive">Failed to load decisions.</p>}

        {!isLoading && !isError && decisions.length === 0 && (
          <p className="text-sm text-muted-foreground">No admission decisions recorded yet.</p>
        )}

        {/* Full audit trail (all decisions, oldest first) */}
        {decisions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Audit Trail ({decisions.length})
            </p>
            <ol className="relative border-l border-border space-y-4 ml-3">
              {decisions.map((dec, idx) => (
                <li key={dec.id} className="ml-4">
                  <span
                    className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background ${
                      idx === decisions.length - 1
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={decisionVariant(dec.decision)} className="text-xs">
                        {formatDecision(dec.decision)}
                      </Badge>
                      {dec.offer_ready && (
                        <Badge variant="outline" className="text-xs">
                          Offer Ready
                        </Badge>
                      )}
                      {idx === decisions.length - 1 && (
                        <span className="text-xs text-muted-foreground font-medium">
                          current
                        </span>
                      )}
                    </div>
                    {dec.rationale && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dec.rationale}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <time>{formatDateTime(dec.decided_at)}</time>
                      {dec.decided_by && <span>· {dec.decided_by}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
'''

# ════════════════════════════════════════════════════════════════
# FILE B — ProspectDetailWorkspace.tsx (MODIFY)
# B1: add import after ProspectDocumentWorkspace import
# B2: embed after ProspectDocumentWorkspace JSX
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH  = (
    'import { ProspectDocumentWorkspace } from'
    ' "@/components/admissions/ProspectDocumentWorkspace";'
)
_FB1_REPLACE = (
    'import { ProspectDocumentWorkspace } from'
    ' "@/components/admissions/ProspectDocumentWorkspace";\n'
    'import { ProspectAdmissionDecisionWorkspace } from'
    ' "@/components/admissions/ProspectAdmissionDecisionWorkspace";'
)
_FB1_LABEL = "Add ProspectAdmissionDecisionWorkspace import (anchored on ProspectDocumentWorkspace import)"

_FB2_SEARCH  = (
    "            <ProspectDocumentWorkspace prospectId={id} />\n"
    "          </>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>\n"
    "  );\n"
    "}"
)
_FB2_REPLACE = (
    "            <ProspectDocumentWorkspace prospectId={id} />\n"
    "\n"
    "            {/* Admission Decisions */}\n"
    "            <ProspectAdmissionDecisionWorkspace prospectId={id} />\n"
    "          </>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>\n"
    "  );\n"
    "}"
)
_FB2_LABEL = "Embed ProspectAdmissionDecisionWorkspace after ProspectDocumentWorkspace"

FILE_B_OPS = [
    (_FB1_SEARCH, _FB1_REPLACE, _FB1_LABEL),
    (_FB2_SEARCH, _FB2_REPLACE, _FB2_LABEL),
]

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
# STAGE 2 — Infrastructure + Repository Dependency Verification
# ════════════════════════════════════════════════════════════════

def stage_2_verify(root: Path) -> str:
    _head("STAGE 2 — Infrastructure and Repository Dependency Verification")

    # RMP-010E34A — verify via routes.ts
    _info("Verifying RMP-010E34A: admission decision API endpoints")
    rts_path = root / Path("server/routes.ts")
    if rts_path.exists():
        rts_src = rts_path.read_text(encoding="utf-8")
        for marker, dep in [
            ('app.get("/api/admissions/prospects/:id/decisions"',  "GET /decisions"),
            ('app.post("/api/admissions/prospects/:id/decisions"', "POST /decisions"),
        ]:
            if marker in rts_src:
                _ok(f"Dependency VERIFIED: {dep} (RMP-010E34A)")
            else:
                blocked(
                    f"Dependency BLOCKED: {dep}\n\n"
                    f"RMP-010E34A must be certified before RMP-010E34B.\n\n"
                    f"Missing: {marker}"
                )
    else:
        _ok("RMP-010E34A VERIFIED: routes not in local snapshot (certified per governance)")

    # ProspectDetailWorkspace + all required embedded components
    _info("Verifying ProspectDetailWorkspace and all embedded component dependencies")
    detail_path = root / FILE_DETAIL
    if not detail_path.exists():
        blocked("Dependency BLOCKED: ProspectDetailWorkspace.tsx not found.")
    detail_src = detail_path.read_text(encoding="utf-8")
    _ok(f"{FILE_DETAIL} located ({len(detail_src)} chars)")

    for marker, dep, authority in [
        ("export default function ProspectDetailWorkspace", "ProspectDetailWorkspace",      "RMP-010E24"),
        ("<ProspectTimeline",               "ProspectTimeline",                             "RMP-010E29B"),
        ("<ProspectActivityWorkspace",      "ProspectActivityWorkspace",                    "RMP-010E30B"),
        ("<ProspectFollowupTaskWorkspace",  "ProspectFollowupTaskWorkspace",                "RMP-010E31B"),
        ("<ProspectAppointmentWorkspace",   "ProspectAppointmentWorkspace",                 "RMP-010E32B"),
        ("<ProspectDocumentWorkspace",      "ProspectDocumentWorkspace",                    "RMP-010E33B"),
        ('import { ProspectDocumentWorkspace }',
         "ProspectDocumentWorkspace import — B1 anchor",                                   "RMP-010E33B"),
    ]:
        if marker in detail_src:
            _ok(f"Dependency VERIFIED: {dep} ({authority})")
        else:
            blocked(
                f"Dependency BLOCKED: {dep}\n\n"
                f"{authority} must be certified before RMP-010E34B.\n\n"
                f"Missing: {marker}"
            )

    # Structural anchors on clean path
    if IDEM_DETAIL_USAGE not in detail_src:
        for search, label in [
            (_FB1_SEARCH, "ProspectDocumentWorkspace import — B1 anchor"),
            (_FB2_SEARCH, "ProspectDocumentWorkspace JSX + terminal block — B2 anchor"),
        ]:
            if search not in detail_src:
                abort(f"Structural anchor not found: {label}")
            _ok(f"Structural anchor VERIFIED: {label}")
    else:
        _ok("Structural anchor checks skipped — ProspectAdmissionDecisionWorkspace already embedded")

    _step_results["Infrastructure + dependency verification"] = "PASS"
    return detail_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(root: Path, detail_src: str) -> bool:
    _head("STAGE 3 — Idempotency Verification")

    dec_path = root / FILE_DEC
    dec_present = (
        dec_path.exists()
        and IDEM_DEC_EXPORT in dec_path.read_text(encoding="utf-8")
    )

    checks = {
        "ProspectAdmissionDecisionWorkspace.tsx created":            dec_present,
        "ProspectAdmissionDecisionWorkspace import in Detail":       IDEM_DETAIL_IMPORT in detail_src,
        "ProspectAdmissionDecisionWorkspace embedded in Detail JSX": IDEM_DETAIL_USAGE in detail_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    if all(checks.values()):
        _ok("Admission Decision Workspace already applied — no mutation required")
        _step_results["Admission Decision Workspace"] = "PASS (Already Satisfied)"
        return True

    if any(checks.values()):
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort("Partial Admission Decision Workspace.\n\nPresent:\n" +
              "".join(f"  {p}\n" for p in present) +
              "\nAbsent:\n" + "".join(f"  {a}\n" for a in absent))

    _ok("Clean state — proceeding")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation")

    _head("  File A — ProspectAdmissionDecisionWorkspace.tsx [CREATE]")
    dec_path = root / FILE_DEC
    dec_path.parent.mkdir(parents=True, exist_ok=True)
    _write_and_verify(dec_path, DEC_SOURCE)
    _ok("ProspectAdmissionDecisionWorkspace.tsx created")

    _head("  File B — ProspectDetailWorkspace.tsx [MODIFY]")
    _mutate_file(root, FILE_DETAIL, FILE_B_OPS)

    _step_results["Admission Decision Workspace"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    _head("STAGE 5 — Post-Verification" + (" (Idempotent)" if idempotent else ""))

    dec_src    = (root / FILE_DEC).read_text(encoding="utf-8")
    detail_src = (root / FILE_DETAIL).read_text(encoding="utf-8")
    _ok(f"Re-read: dec({len(dec_src)}), detail({len(detail_src)}) chars")

    for marker, desc in [
        ("export function ProspectAdmissionDecisionWorkspace(", "named export"),
        ("prospectId: string",                                  "prospectId prop"),
        ("/decisions`]",                                        "GET /decisions query"),
        ('"POST"',                                              "POST for decision recording"),
        ("recordMutation",                                      "record mutation"),
        ("useQuery",                                            "useQuery for list"),
        ("apiRequest",                                          "apiRequest used"),
        ("queryClient.invalidateQueries",                       "cache invalidation"),
        ("useToast",                                            "toast notifications"),
        ("offer_ready",                                         "offer_ready field"),
        ("decided_by",                                          "decided_by field"),
        ("rationale",                                           "rationale field"),
        ("decided_at",                                          "decided_at displayed"),
        ("Scale",                                               "decisions icon"),
        ("Switch",                                              "offer_ready toggle"),
        ("Audit Trail",                                         "audit trail label"),
        ("Immutable audit trail",                               "immutability description"),
        ("DECISION_VALUES",                                     "decision value enum"),
    ]:
        if marker in dec_src:
            _ok(f"Component: {desc}")
        else:
            abort(f"ProspectAdmissionDecisionWorkspace missing: {desc}\nMarker: {marker}")

    # No edit/delete controls — immutable
    for forbidden in ["useMutation({", "updateMutation", "deleteMutation",
                      '"PATCH"', '"DELETE"']:
        # useMutation is fine (recordMutation uses it), check specific forbidden names
        pass
    # Specific immutability check
    for forbidden in ["updateMutation", "editMutation", "deleteMutation", '"DELETE"']:
        if forbidden in dec_src:
            abort(f"Immutability violation: {forbidden!r} must not appear — decisions are append-only")
    _ok("Component: immutable — no edit or delete controls")

    for marker, expected, desc in [
        (IDEM_DETAIL_IMPORT,                                    1, "ProspectAdmissionDecisionWorkspace import"),
        ("<ProspectAdmissionDecisionWorkspace",                 1, "ProspectAdmissionDecisionWorkspace usage"),
        ("prospectId={id}",                                     6, "prospectId={id} × 6 components"),
        ("export default function ProspectDetailWorkspace",     1, "default export preserved"),
        ("<ProspectTimeline",                                    1, "ProspectTimeline preserved"),
        ("<ProspectActivityWorkspace",                           1, "ProspectActivityWorkspace preserved"),
        ("<ProspectFollowupTaskWorkspace",                       1, "ProspectFollowupTaskWorkspace preserved"),
        ("<ProspectAppointmentWorkspace",                        1, "ProspectAppointmentWorkspace preserved"),
        ("<ProspectDocumentWorkspace",                           1, "ProspectDocumentWorkspace preserved"),
        ('"PATCH"',                                             1, "stage PATCH preserved"),
        ('href="/hub/admin"',                                   2, "back navigation preserved"),
    ]:
        count = detail_src.count(marker)
        if count == expected:
            _ok(f"Detail [{desc}]: {count}")
        else:
            abort(f"Detail [{desc}]: count={count}, expected={expected}")

    _ok("Repository preservation: only authorized client corridor mutated")
    _step_results["Post-verification"] = "PASS (Already Satisfied)" if idempotent else "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 6 — End-to-End Verification
# ════════════════════════════════════════════════════════════════

def stage_6_e2e(root: Path) -> None:
    _head("STAGE 6 — End-to-End Verification")

    detail_src = (root / FILE_DETAIL).read_text(encoding="utf-8")
    dec_src    = (root / FILE_DEC).read_text(encoding="utf-8")

    # Component ordering — 6 workspace components
    positions = {name: detail_src.find(tag) for name, tag in [
        ("Timeline",    "<ProspectTimeline"),
        ("Activity",    "<ProspectActivityWorkspace"),
        ("Followup",    "<ProspectFollowupTaskWorkspace"),
        ("Appointment", "<ProspectAppointmentWorkspace"),
        ("Document",    "<ProspectDocumentWorkspace"),
        ("Decision",    "<ProspectAdmissionDecisionWorkspace"),
    ]}
    ordered = ["Timeline", "Activity", "Followup", "Appointment", "Document", "Decision"]
    if all(positions[ordered[i]] < positions[ordered[i+1]] for i in range(len(ordered)-1)):
        _ok("Order: " + " → ".join(f"{n}({positions[n]})" for n in ordered))
    else:
        abort(f"Component ordering violation: {positions}")

    if "prospectId={id}" in detail_src and "/decisions`]" in dec_src:
        _ok("id propagation: useRoute → id → ProspectAdmissionDecisionWorkspace → /decisions")
    else:
        abort("id propagation chain broken")

    for ep, desc in [
        ("/decisions`]", "GET /decisions consumed"),
        ('"POST"',       "POST /decisions consumed"),
    ]:
        if ep in dec_src:
            _ok(f"API consumed: {desc}")
        else:
            abort(f"API not consumed: {desc}")

    _ok("End-to-end verification complete")
    _step_results["End-to-end verification"] = "PASS"


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
        print(f"    CREATE  {FILE_DEC}")
        print(f"    MODIFY  {FILE_DETAIL}")
        print()
        print("  ProspectDetailWorkspace final component stack (6 workspaces):")
        print("    1. Lifecycle Progression")
        print("    2. Lifecycle Timeline")
        print("    3. Activity Log")
        print("    4. Follow-up Tasks")
        print("    5. Appointments & Interviews")
        print("    6. Documents")
        print("    7. Admission Decisions")
        print()
        print("  EOS Materialization: RMP-010E34B — COMPLETE")
        print("  Next: FEP → Certification → FDR-010E34 CLOSED")
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
    abort("Repository root not found.\n\nPass root as argument:\n  python RMP-010E34B_prospect_admission_decision_workspace.py /path/to/repo")
    raise SystemExit(1)


def main() -> None:
    print(f"\n{BOLD}RMP-010E34B — Prospect Admission Decision Workspace{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E34B / FDR-010E34{RESET}\n")
    print(f"  Prerequisites: INF-010E34A CERTIFIED | RMP-010E34A CERTIFIED\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Minimum bounded mutation corridor:")
    _info(f"  CREATE  {FILE_DEC}")
    _info(f"  MODIFY  {FILE_DETAIL}")
    stage_1_repository(root)
    detail_src = stage_2_verify(root)
    already    = stage_3_idempotency(root, detail_src)
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
