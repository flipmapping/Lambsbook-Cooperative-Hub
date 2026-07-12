import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Plus, Pencil, X, Check, Ban, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProspectAppointment {
  id: string;
  prospect_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  description: string | null;
  status: string;
  outcome: string | null;
  outcome_notes: string | null;
  created_at: string;
}

const OUTCOMES = ["passed", "failed", "deferred", "no_show", "withdrawn"] as const;

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":  return "default";
    case "cancelled":  return "destructive";
    case "scheduled":  return "secondary";
    default:           return "outline";
  }
}

interface ProspectAppointmentWorkspaceProps {
  prospectId: string;
}

export function ProspectAppointmentWorkspace({
  prospectId,
}: ProspectAppointmentWorkspaceProps) {
  const { toast } = useToast();
  const queryKey = [`/api/admissions/prospects/${prospectId}/appointments`];

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [cTitle, setCTitle]    = useState("");
  const [cDate, setCDate]      = useState("");
  const [cTime, setCTime]      = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cLocation, setCLocation] = useState("");
  const [cNotes, setCNotes]    = useState("");

  const [eTitle, setETitle]    = useState("");
  const [eDate, setEDate]      = useState("");
  const [eTime, setETime]      = useState("");
  const [eDuration, setEDuration] = useState("");
  const [eLocation, setELocation] = useState("");
  const [eNotes, setENotes]    = useState("");

  const [outcome, setOutcome]          = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  const { data: appointments = [], isLoading, isError } =
    useQuery<ProspectAppointment[]>({
      queryKey,
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${prospectId}/appointments`,
        );
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      },
      enabled: !!prospectId,
    });

  function toIso(date: string, time: string): string {
    return time ? `${date}T${time}:00Z` : `${date}T00:00:00Z`;
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!cTitle.trim()) throw new Error("Title is required");
      if (!cDate)         throw new Error("Date is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/appointments`,
        {
          title:            cTitle.trim(),
          scheduled_at:     toIso(cDate, cTime),
          duration_minutes: cDuration ? parseInt(cDuration, 10) : null,
          location:         cLocation.trim() || null,
          description:            cNotes.trim() || null,
        },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Appointment scheduled" });
      setCTitle(""); setCDate(""); setCTime(""); setCDuration(""); setCLocation(""); setCNotes("");
      setShowCreate(false);
    },
    onError: (e: Error) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admissions/prospects/${prospectId}/appointments/${appointmentId}`,
        {
          ...(eTitle.trim()  && { title: eTitle.trim() }),
          ...(eDate          && { scheduled_at: toIso(eDate, eTime) }),
          ...(eDuration      && { duration_minutes: parseInt(eDuration, 10) }),
          ...(eLocation !== undefined && { location: eLocation.trim() || null }),
          ...(eNotes !== undefined    && { description: eNotes.trim() || null }),
        },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Appointment updated" });
      setEditingId(null);
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/appointments/${appointmentId}/cancel`,
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Cancel failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Appointment cancelled" });
    },
    onError: (e: Error) => toast({ title: "Cancel failed", description: e.message, variant: "destructive" }),
  });

  const completeMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!outcome) throw new Error("Outcome is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/appointments/${appointmentId}/complete`,
        { outcome, outcome_notes: outcomeNotes.trim() || null },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Complete failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Appointment completed" });
      setCompletingId(null); setOutcome(""); setOutcomeNotes("");
    },
    onError: (e: Error) => toast({ title: "Complete failed", description: e.message, variant: "destructive" }),
  });

  function startEdit(a: ProspectAppointment) {
    setEditingId(a.id);
    setETitle(a.title);
    const dt = a.scheduled_at ? new Date(a.scheduled_at) : null;
    setEDate(dt ? dt.toISOString().slice(0, 10) : "");
    setETime(dt ? dt.toISOString().slice(11, 16) : "");
    setEDuration(a.duration_minutes != null ? String(a.duration_minutes) : "");
    setELocation(a.location ?? "");
    setENotes(a.description ?? "");
  }

  const active    = appointments.filter((a) => a.status === "scheduled");
  const concluded = appointments.filter((a) => a.status !== "scheduled");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Appointments & Interviews
            </CardTitle>
            <CardDescription className="text-xs">
              Schedule and record prospect interviews and appointments.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            Schedule
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create form */}
        {showCreate && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">New appointment</p>
            <Input
              placeholder="Title (required)"
              value={cTitle}
              onChange={(e) => setCTitle(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={cDate}
                onChange={(e) => setCDate(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Input
                type="time"
                value={cTime}
                onChange={(e) => setCTime(e.target.value)}
                className="h-8 text-xs w-28"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Duration (min)"
                value={cDuration}
                onChange={(e) => setCDuration(e.target.value)}
                className="h-8 text-xs flex-1"
                min={1}
              />
              <Input
                placeholder="Location / link"
                value={cLocation}
                onChange={(e) => setCLocation(e.target.value)}
                className="h-8 text-xs flex-1"
              />
            </div>
            <Textarea
              placeholder="Notes (optional)"
              value={cNotes}
              onChange={(e) => setCNotes(e.target.value)}
              className="text-xs min-h-[48px]"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs"
                onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!cTitle.trim() || !cDate || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Scheduling…" : "Schedule"}
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading appointments…</p>}
        {isError   && <p className="text-sm text-destructive">Failed to load appointments.</p>}

        {!isLoading && !isError && appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">No appointments scheduled yet.</p>
        )}

        {/* Active appointments */}
        {active.map((appt) => (
          <div key={appt.id} className="rounded-md border p-3 space-y-2">
            {editingId === appt.id ? (
              <div className="space-y-2">
                <Input value={eTitle} onChange={(e) => setETitle(e.target.value)}
                  placeholder="Title" className="h-8 text-xs" />
                <div className="flex gap-2">
                  <Input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)}
                    className="h-8 text-xs flex-1" />
                  <Input type="time" value={eTime} onChange={(e) => setETime(e.target.value)}
                    className="h-8 text-xs w-28" />
                </div>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Duration (min)" value={eDuration}
                    onChange={(e) => setEDuration(e.target.value)}
                    className="h-8 text-xs flex-1" min={1} />
                  <Input placeholder="Location" value={eLocation}
                    onChange={(e) => setELocation(e.target.value)}
                    className="h-8 text-xs flex-1" />
                </div>
                <Textarea value={eNotes} onChange={(e) => setENotes(e.target.value)}
                  className="text-xs min-h-[48px]" placeholder="Notes" />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="h-7 text-xs"
                    onClick={() => setEditingId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 text-xs"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate(appt.id)}>
                    <Check className="h-3 w-3 mr-1" />
                    {updateMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            ) : completingId === appt.id ? (
              <div className="space-y-2">
                <p className="text-xs font-medium">Record outcome for: {appt.title}</p>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select outcome…" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOMES.map((o) => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Outcome description (optional)"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="text-xs min-h-[48px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="h-7 text-xs"
                    onClick={() => { setCompletingId(null); setOutcome(""); setOutcomeNotes(""); }}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 text-xs"
                    disabled={!outcome || completeMutation.isPending}
                    onClick={() => completeMutation.mutate(appt.id)}>
                    {completeMutation.isPending ? "Recording…" : "Record Outcome"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{appt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(appt.scheduled_at)}
                      {appt.duration_minutes && ` · ${appt.duration_minutes}min`}
                      {appt.location && ` · ${appt.location}`}
                    </p>
                    {appt.description && (
                      <p className="text-xs text-muted-foreground mt-1">{appt.description}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant(appt.status)} className="text-xs shrink-0">
                    {appt.status}
                  </Badge>
                </div>
                <div className="flex gap-1.5 mt-2 justify-end">
                  <Button size="sm" variant="ghost"
                    className="h-6 text-xs px-2 gap-1 text-muted-foreground"
                    onClick={() => startEdit(appt)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost"
                    className="h-6 text-xs px-2 gap-1 text-muted-foreground"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(appt.id)}>
                    <Ban className="h-3 w-3" /> Cancel
                  </Button>
                  <Button size="sm" variant="outline"
                    className="h-6 text-xs px-2 gap-1"
                    onClick={() => setCompletingId(appt.id)}>
                    <CheckCircle2 className="h-3 w-3" /> Complete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Concluded appointments */}
        {concluded.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">History</p>
            {concluded.map((appt) => (
              <div key={appt.id}
                className="rounded-md border p-3 bg-muted/20 opacity-75">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground leading-tight">
                      {appt.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(appt.scheduled_at)}
                    </p>
                    {appt.outcome && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">Outcome:</span>{" "}
                        {appt.outcome.replace(/_/g, " ")}
                        {appt.outcome_notes && ` — ${appt.outcome_notes}`}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusVariant(appt.status)} className="text-xs shrink-0">
                    {appt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
