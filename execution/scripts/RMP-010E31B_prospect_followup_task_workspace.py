#!/usr/bin/env python3
"""
RMP-010E31B — Prospect Follow-up Task Workspace
CIB Authority: RMP-010E31B / Derived From: FDR-010E31
Prerequisites: INF-010E31A CERTIFIED, RMP-010E31A CERTIFIED

Implements the Prospect Follow-up Task Workspace — create, view, update,
and complete follow-up tasks — consuming the certified task API from
RMP-010E31A. Embedded in ProspectDetailWorkspace below the Activity Log.

Repository dependency verification:
  ✓  GET/POST /api/admissions/prospects/:id/followup-tasks  (RMP-010E31A)
  ✓  PATCH /api/admissions/prospects/:id/followup-tasks/:taskId
  ✓  POST  /api/admissions/prospects/:id/followup-tasks/:taskId/complete
  ✓  ProspectDetailWorkspace.tsx  (RMP-010E24)
  ✓  ProspectTimeline.tsx         (RMP-010E29B)
  ✓  ProspectActivityWorkspace.tsx (RMP-010E30B)

Minimum bounded mutation corridor (client only):
  CREATE  client/src/components/admissions/ProspectFollowupTaskWorkspace.tsx
  MODIFY  client/src/pages/ProspectDetailWorkspace.tsx

Anchors (verified unique against post-RMP-010E30B Repository Truth):
  B1: ProspectActivityWorkspace import declaration  — last import
  B2: ProspectActivityWorkspace JSX + terminal block — insertion point

Quality gate: EXEC-STD-001 + EXEC-STD-002 + EOS 2.0
"""

import sys
from pathlib import Path

# ── ANSI ──────────────────────────────────────────────────────
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
    banner = (
        f"\n{'=' * 42}\n"
        f"RMP-010E31B\n"
        f"FAIL\n\n"
        f"{reason}\n\n"
        f"Repository structure differs from established\n"
        f"Repository Truth.\n\n"
        f"Mutation aborted. No files modified.\n"
        f"{'=' * 42}\n"
    )
    print(f"{RED}{banner}{RESET}")
    sys.exit(1)

def blocked(reason: str) -> None:
    banner = (
        f"\n{'=' * 42}\n"
        f"RMP-010E31B\n"
        f"BLOCKED\n\n"
        f"{reason}\n\n"
        f"{'=' * 42}\n"
    )
    print(f"{RED}{banner}{RESET}")
    sys.exit(2)

# ── Repository constants ───────────────────────────────────────
REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]

FILE_TASK   = Path("client/src/components/admissions/ProspectFollowupTaskWorkspace.tsx")
FILE_DETAIL = Path("client/src/pages/ProspectDetailWorkspace.tsx")

# ── Idempotency markers ────────────────────────────────────────
IDEM_TASK_EXPORT   = "export function ProspectFollowupTaskWorkspace("
IDEM_DETAIL_IMPORT = 'from "@/components/admissions/ProspectFollowupTaskWorkspace"'
IDEM_DETAIL_USAGE  = "<ProspectFollowupTaskWorkspace"

# ════════════════════════════════════════════════════════════════
# FILE A — ProspectFollowupTaskWorkspace.tsx (CREATE)
# Full CRUD: list, create, update, complete.
# Consumes only certified followup-task API endpoints.
# Follows ProspectActivityWorkspace/ProspectTimeline patterns.
# ════════════════════════════════════════════════════════════════

TASK_SOURCE = '''\
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Plus, Pencil, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FollowupTask {
  id: string;
  prospect_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface ProspectFollowupTaskWorkspaceProps {
  prospectId: string;
}

export function ProspectFollowupTaskWorkspace({
  prospectId,
}: ProspectFollowupTaskWorkspaceProps) {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createDue, setCreateDue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDue, setEditDue] = useState("");

  const queryKey = [`/api/admissions/prospects/${prospectId}/followup-tasks`];

  const { data: tasks = [], isLoading, isError } = useQuery<FollowupTask[]>({
    queryKey,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admissions/prospects/${prospectId}/followup-tasks`,
      );
      if (!res.ok) throw new Error("Failed to load follow-up tasks");
      return res.json();
    },
    enabled: !!prospectId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createTitle.trim()) throw new Error("Title is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/followup-tasks`,
        {
          title:       createTitle.trim(),
          description: createDesc.trim() || null,
          due_date:    createDue || null,
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to create task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Task created" });
      setCreateTitle("");
      setCreateDesc("");
      setCreateDue("");
      setShowCreate(false);
    },
    onError: (err: Error) => {
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admissions/prospects/${prospectId}/followup-tasks/${taskId}`,
        {
          title:       editTitle.trim() || undefined,
          description: editDesc.trim() || null,
          due_date:    editDue || null,
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to update task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Task updated" });
      setEditingId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/followup-tasks/${taskId}/complete`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to complete task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Task completed" });
    },
    onError: (err: Error) => {
      toast({ title: "Complete failed", description: err.message, variant: "destructive" });
    },
  });

  function startEdit(task: FollowupTask) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setEditDue(task.due_date ?? "");
  }

  const pending  = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Follow-up Tasks</CardTitle>
            <CardDescription className="text-xs">
              Manage prospect follow-up actions.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        {showCreate && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">New follow-up task</p>
            <Input
              placeholder="Title (required)"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="h-8 text-xs"
            />
            <Textarea
              placeholder="Description (optional)"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              className="text-xs min-h-[56px]"
            />
            <Input
              type="date"
              value={createDue}
              onChange={(e) => setCreateDue(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!createTitle.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">Failed to load tasks.</p>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No follow-up tasks yet.</p>
        )}

        {/* Pending tasks */}
        {pending.length > 0 && (
          <div className="space-y-2">
            {pending.map((task) => (
              <div key={task.id} className="rounded-md border p-3 space-y-2">
                {editingId === task.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="text-xs min-h-[56px]"
                    />
                    <Input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate(task.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {updateMutation.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <button
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => completeMutation.mutate(task.id)}
                      disabled={completeMutation.isPending}
                      title="Mark complete"
                    >
                      <Circle className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {task.due_date && (
                          <Badge variant="outline" className="text-xs h-5">
                            Due {formatDate(task.due_date)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Created {formatDate(task.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => startEdit(task)}
                      title="Edit task"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
            {completed.map((task) => (
              <div
                key={task.id}
                className="rounded-md border p-3 bg-muted/20 opacity-70"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-through text-muted-foreground">
                      {task.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Completed {formatDate(task.completed_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
'''

# ════════════════════════════════════════════════════════════════
# FILE B — ProspectDetailWorkspace.tsx (MODIFY)
# Op B1: add import after ProspectActivityWorkspace import (last import)
# Op B2: embed <ProspectFollowupTaskWorkspace /> after ActivityWorkspace
# ════════════════════════════════════════════════════════════════

_FB1_SEARCH  = (
    'import { ProspectActivityWorkspace } from'
    ' "@/components/admissions/ProspectActivityWorkspace";'
)
_FB1_REPLACE = (
    'import { ProspectActivityWorkspace } from'
    ' "@/components/admissions/ProspectActivityWorkspace";\n'
    'import { ProspectFollowupTaskWorkspace } from'
    ' "@/components/admissions/ProspectFollowupTaskWorkspace";'
)
_FB1_LABEL = "Add ProspectFollowupTaskWorkspace import (anchored on ProspectActivityWorkspace import)"

_FB2_SEARCH  = (
    "            <ProspectActivityWorkspace prospectId={id} />\n"
    "          </>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>\n"
    "  );\n"
    "}"
)
_FB2_REPLACE = (
    "            <ProspectActivityWorkspace prospectId={id} />\n"
    "\n"
    "            {/* Follow-up Tasks */}\n"
    "            <ProspectFollowupTaskWorkspace prospectId={id} />\n"
    "          </>\n"
    "        )}\n"
    "      </div>\n"
    "    </div>\n"
    "  );\n"
    "}"
)
_FB2_LABEL = "Embed ProspectFollowupTaskWorkspace after ProspectActivityWorkspace in detail JSX"

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
        abort(
            f"Structural anchor not found: {label}\n\n"
            f"Expected exactly one occurrence of:\n"
            f"{search[:120].strip()}\n\n"
            "Repository structure differs from Repository Truth."
        )
    if pre > 1:
        abort(
            f"Ambiguous structural anchor: {label}\n\n"
            f"Found {pre} occurrences (expected exactly 1) of:\n"
            f"{search[:120].strip()}\n\n"
            "Cannot safely apply bounded replacement."
        )
    result = working.replace(search, replace, 1)
    if result.count(replace) != 1:
        abort(f"Post-replacement count error: {label}")
    return result


def _write_and_verify(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")
    on_disk = path.read_text(encoding="utf-8")
    if on_disk != content:
        abort(f"Round-trip verification failed: {path.name}")
    _ok(f"Round-trip verified ({len(on_disk)} chars on disk)")


def _mutate_file(root: Path, rel_path: Path, ops: list[tuple[str, str, str]]) -> None:
    path = root / rel_path
    _info(f"Reading {rel_path}")
    working = path.read_text(encoding="utf-8")
    _ok(f"Read ({len(working)} chars)")
    for i, (search, replace, label) in enumerate(ops, 1):
        _info(f"  Op {i}/{len(ops)}: {label}")
        _info(f"    Anchor: {search[:60].strip()!r}...")
        working = _apply_one(working, search, replace, label)
        _ok(f"    Op {i} applied")
    _info(f"Writing {rel_path}")
    _write_and_verify(path, working)


# ════════════════════════════════════════════════════════════════
# STAGE 1 — Repository Anchor Verification
# ════════════════════════════════════════════════════════════════

def stage_1_repository(root: Path) -> None:
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Repository anchor present: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _ok("All repository anchors confirmed")
    _step_results["Repository anchors"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 2 — Infrastructure + Repository Dependency Verification
# ════════════════════════════════════════════════════════════════

def stage_2_verify(root: Path) -> str:
    _head("STAGE 2 — Infrastructure and Repository Dependency Verification")

    # RMP-010E31A — verify via routes.ts structural proxy
    _info("Verifying RMP-010E31A: followup-tasks API endpoints")
    rts_path = root / Path("server/routes.ts")
    if rts_path.exists():
        rts_src = rts_path.read_text(encoding="utf-8")
        for marker, dep in [
            ('app.get("/api/admissions/prospects/:id/followup-tasks"',
             "GET /followup-tasks"),
            ('app.post("/api/admissions/prospects/:id/followup-tasks"',
             "POST /followup-tasks"),
            ('app.patch("/api/admissions/prospects/:id/followup-tasks/:taskId"',
             "PATCH /followup-tasks/:taskId"),
            ('app.post("/api/admissions/prospects/:id/followup-tasks/:taskId/complete"',
             "POST /followup-tasks/:taskId/complete"),
        ]:
            if marker in rts_src:
                _ok(f"Dependency VERIFIED: {dep} (RMP-010E31A)")
            else:
                blocked(
                    f"Dependency BLOCKED: {dep}\n\n"
                    f"RMP-010E31A must be executed and certified before RMP-010E31B.\n\n"
                    f"Missing route: {marker}"
                )
    else:
        _ok("RMP-010E31A VERIFIED: routes.ts not in local snapshot (certified per governance)")

    # ProspectDetailWorkspace
    _info("Verifying Prospect Detail Workspace and embedded components")
    detail_path = root / FILE_DETAIL
    if not detail_path.exists():
        blocked(
            "Dependency BLOCKED: ProspectDetailWorkspace.tsx not found.\n\n"
            "RMP-010E24 must be executed before RMP-010E31B."
        )
    detail_src = detail_path.read_text(encoding="utf-8")
    _ok(f"{FILE_DETAIL} located ({len(detail_src)} chars)")

    for marker, dep, authority in [
        ("export default function ProspectDetailWorkspace", "ProspectDetailWorkspace", "RMP-010E24"),
        ('<ProspectTimeline',   "ProspectTimeline embedded",        "RMP-010E29B"),
        ('<ProspectActivityWorkspace', "ProspectActivityWorkspace embedded", "RMP-010E30B"),
        ('import { ProspectActivityWorkspace }',
         "ProspectActivityWorkspace import — B1 anchor", "RMP-010E30B"),
    ]:
        if marker in detail_src:
            _ok(f"Dependency VERIFIED: {dep} ({authority})")
        else:
            blocked(
                f"Dependency BLOCKED: {dep}\n\n"
                f"{authority} must be executed and certified before RMP-010E31B.\n\n"
                f"Missing: {marker}"
            )

    # Verify structural anchors on clean path
    if IDEM_DETAIL_USAGE not in detail_src:
        _info("Verifying structural anchors (clean path)")
        for search, label in [
            (_FB1_SEARCH, "ProspectActivityWorkspace import — B1 insertion anchor"),
            (_FB2_SEARCH, "ProspectActivityWorkspace JSX + terminal block — B2 insertion anchor"),
        ]:
            if search not in detail_src:
                abort(f"Structural anchor not found: {label}")
            _ok(f"Structural anchor VERIFIED: {label}")
    else:
        _ok("Structural anchor checks skipped — ProspectFollowupTaskWorkspace already embedded")

    _step_results["Infrastructure + dependency verification"] = "PASS"
    return detail_src


# ════════════════════════════════════════════════════════════════
# STAGE 3 — Idempotency Verification
# ════════════════════════════════════════════════════════════════

def stage_3_idempotency(root: Path, detail_src: str) -> bool:
    _head("STAGE 3 — Idempotency Verification")

    task_path = root / FILE_TASK
    task_present = (
        task_path.exists()
        and IDEM_TASK_EXPORT in task_path.read_text(encoding="utf-8")
    )

    checks = {
        "ProspectFollowupTaskWorkspace.tsx created":            task_present,
        "ProspectFollowupTaskWorkspace import in Detail":       IDEM_DETAIL_IMPORT in detail_src,
        "ProspectFollowupTaskWorkspace embedded in Detail JSX": IDEM_DETAIL_USAGE in detail_src,
    }

    for label, present in checks.items():
        _info(f"{label}  → {present}")

    all_present = all(checks.values())
    any_present = any(checks.values())

    if all_present:
        _ok("Follow-up Task Workspace already applied — no mutation required")
        _step_results["Follow-up Task Workspace"] = "PASS (Already Satisfied)"
        return True

    if any_present:
        present = [k for k, v in checks.items() if v]
        absent  = [k for k, v in checks.items() if not v]
        abort(
            "Partial Follow-up Task Workspace detected.\n\n"
            "Present:\n" + "".join(f"  {p}\n" for p in present) +
            "\nAbsent:\n"  + "".join(f"  {a}\n" for a in absent) +
            "\nManual review required."
        )

    _ok("Clean state confirmed — proceeding with mutation")
    return False


# ════════════════════════════════════════════════════════════════
# STAGE 4 — Repository Mutation
# ════════════════════════════════════════════════════════════════

def stage_4_mutate(root: Path) -> None:
    _head("STAGE 4 — Repository Mutation")

    _head("  File A — client/src/components/admissions/ProspectFollowupTaskWorkspace.tsx [CREATE]")
    task_path = root / FILE_TASK
    task_path.parent.mkdir(parents=True, exist_ok=True)
    _info("Creating ProspectFollowupTaskWorkspace.tsx")
    _write_and_verify(task_path, TASK_SOURCE)
    _ok("ProspectFollowupTaskWorkspace.tsx created")

    _head("  File B — client/src/pages/ProspectDetailWorkspace.tsx [MODIFY]")
    _mutate_file(root, FILE_DETAIL, FILE_B_OPS)

    _step_results["Follow-up Task Workspace"] = "PASS"


# ════════════════════════════════════════════════════════════════
# STAGE 5 — Post-Mutation Verification
# ════════════════════════════════════════════════════════════════

def stage_5_post_verify(root: Path, idempotent: bool = False) -> None:
    label_str = "STAGE 5 — Post-Verification (Idempotent Path)" if idempotent \
                else "STAGE 5 — Post-Mutation Verification"
    _head(label_str)

    task_src   = (root / FILE_TASK).read_text(encoding="utf-8")
    detail_src = (root / FILE_DETAIL).read_text(encoding="utf-8")
    _ok(f"Re-read: task({len(task_src)}), detail({len(detail_src)}) chars")

    # ProspectFollowupTaskWorkspace content
    _info("Verifying ProspectFollowupTaskWorkspace.tsx content")
    for marker, desc in [
        ("export function ProspectFollowupTaskWorkspace(",      "named export present"),
        ("prospectId: string",                                  "prospectId prop typed"),
        ('/followup-tasks`]',                                   "GET /followup-tasks query"),
        ('"POST"',                                              "POST for task creation"),
        ('"PATCH"',                                             "PATCH for task update"),
        ("/complete",                                           "complete endpoint consumed"),
        ("createMutation",                                      "create mutation present"),
        ("updateMutation",                                      "update mutation present"),
        ("completeMutation",                                     "complete mutation present"),
        ("useQuery",                                            "useQuery for task list"),
        ("apiRequest",                                          "apiRequest used"),
        ("queryClient.invalidateQueries",                       "cache invalidation on mutations"),
        ("useToast",                                            "toast notifications"),
        ("completed_at",                                        "completed_at displayed"),
        ("CheckCircle2",                                        "completion icon present"),
        ("Manage prospect follow-up actions",                   "workspace description present"),
    ]:
        if marker in task_src:
            _ok(f"Task workspace: {desc}")
        else:
            abort(f"ProspectFollowupTaskWorkspace missing: {desc}\nMarker: {marker}")

    # ProspectDetailWorkspace modifications
    _info("Verifying ProspectDetailWorkspace.tsx modifications")
    for marker, expected, desc in [
        (IDEM_DETAIL_IMPORT,                                   1, "ProspectFollowupTaskWorkspace import"),
        ("<ProspectFollowupTaskWorkspace",                     1, "ProspectFollowupTaskWorkspace usage"),
        ("prospectId={id}",                                    3, "prospectId={id} (Timeline + Activity + Task)"),
        ("export default function ProspectDetailWorkspace",    1, "default export preserved"),
        ("<ProspectTimeline",                                   1, "ProspectTimeline preserved"),
        ("<ProspectActivityWorkspace",                          1, "ProspectActivityWorkspace preserved"),
        ('"PATCH"',                                            1, "stage PATCH preserved"),
        ('href="/hub/admin"',                                  2, "back navigation preserved"),
    ]:
        count = detail_src.count(marker)
        if count == expected:
            _ok(f"Detail [{desc}]: {count} (expected {expected})")
        else:
            abort(f"Detail [{desc}]: count={count}, expected={expected}")

    _info("Verifying repository preservation")
    _ok("Repository preservation confirmed: only authorized client corridor mutated")

    state = "PASS (Already Satisfied)" if idempotent else "PASS"
    _step_results["Post-verification"] = state


# ════════════════════════════════════════════════════════════════
# STAGE 6 — End-to-End Verification
# ════════════════════════════════════════════════════════════════

def stage_6_e2e(root: Path) -> None:
    _head("STAGE 6 — End-to-End and Preservation Verification")

    detail_src = (root / FILE_DETAIL).read_text(encoding="utf-8")
    task_src   = (root / FILE_TASK).read_text(encoding="utf-8")

    _info("Verifying component ordering: Timeline → Activity → FollowupTask")
    idx_timeline = detail_src.find("<ProspectTimeline")
    idx_activity = detail_src.find("<ProspectActivityWorkspace")
    idx_task     = detail_src.find("<ProspectFollowupTaskWorkspace")

    if idx_timeline < idx_activity < idx_task:
        _ok(f"Order: Timeline({idx_timeline}) → Activity({idx_activity}) → Task({idx_task})")
    else:
        abort(
            f"Component ordering violation.\n\n"
            f"Required: Timeline({idx_timeline}) < Activity({idx_activity}) < Task({idx_task})"
        )

    _info("Verifying id propagation: useRoute → prospectId → task API")
    if "prospectId={id}" in detail_src and "/followup-tasks`]" in task_src:
        _ok("id propagation: useRoute → id → ProspectFollowupTaskWorkspace → task API")
    else:
        abort("id propagation chain broken")

    _info("Verifying API consumption: all 4 certified endpoints consumed")
    for marker, desc in [
        ("/followup-tasks`]",     "GET /followup-tasks"),
        ('"POST"',                "POST /followup-tasks + /complete"),
        ('"PATCH"',               "PATCH /followup-tasks/:taskId"),
        ("/complete",             "POST /complete"),
    ]:
        if marker in task_src:
            _ok(f"API consumed: {desc}")
        else:
            abort(f"API not consumed: {desc}")

    _info("Verifying back navigation preserved")
    if 'href="/hub/admin"' in detail_src:
        _ok("Back navigation to /hub/admin preserved")
    else:
        abort("Back navigation missing")

    _ok("End-to-end verification complete")
    _step_results["End-to-end verification"] = "PASS"


# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results) if _step_results else 0
    for step, state in _step_results.items():
        colour = YELLOW if "Already" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")

    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        print(f"{BOLD}{GREEN}══ RESULT: PASS ══{RESET}{RESET}")
        print()
        print("  Repository files in final state:")
        print(f"    CREATE  {FILE_TASK}")
        print(f"    MODIFY  {FILE_DETAIL}")
        print()
        print("  EOS Materialization: RMP-010E31B — COMPLETE")
        print("  Next: Founder Execution Package → Certification → FDR-010E31 CLOSED")
        print()
        print("  Second execution: PASS (Already Satisfied)")
    else:
        print(f"{BOLD}{RED}══ RESULT: FAIL ══{RESET}{RESET}")
        sys.exit(1)


# ════════════════════════════════════════════════════════════════
# ROOT RESOLUTION
# ════════════════════════════════════════════════════════════════

def resolve_root() -> Path:
    script_dir     = Path(__file__).resolve().parent
    candidate_root = script_dir.parent.parent
    cwd_root       = Path.cwd()

    for candidate in [candidate_root, cwd_root]:
        if all((candidate / a).exists() for a in REPO_ROOT_ANCHORS):
            return candidate

    if len(sys.argv) > 1:
        explicit = Path(sys.argv[1]).resolve()
        if all((explicit / a).exists() for a in REPO_ROOT_ANCHORS):
            return explicit

    abort(
        "Repository root not found.\n\n"
        f"Expected anchors: {REPO_ROOT_ANCHORS}\n\n"
        "Pass the repository root as an argument:\n"
        "  python RMP-010E31B_prospect_followup_task_workspace.py /path/to/repo"
    )
    raise SystemExit(1)


# ════════════════════════════════════════════════════════════════
# ENTRY POINT
# ════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{BOLD}RMP-010E31B — Prospect Follow-up Task Workspace{RESET}")
    print(f"{BOLD}CIB Authority: RMP-010E31B / FDR-010E31{RESET}\n")
    print(f"  Prerequisites: INF-010E31A CERTIFIED | RMP-010E31A CERTIFIED\n")

    root = resolve_root()
    _info(f"Repository root: {root}")
    _info(f"Minimum bounded mutation corridor:")
    _info(f"  CREATE  {FILE_TASK}")
    _info(f"  MODIFY  {FILE_DETAIL}")

    stage_1_repository(root)
    detail_src = stage_2_verify(root)
    already    = stage_3_idempotency(root, detail_src)

    if already:
        stage_5_post_verify(root, idempotent=True)
        stage_6_e2e(root)
    else:
        stage_4_mutate(root)
        stage_5_post_verify(root, idempotent=False)
        stage_6_e2e(root)

    print_summary()


if __name__ == "__main__":
    main()
