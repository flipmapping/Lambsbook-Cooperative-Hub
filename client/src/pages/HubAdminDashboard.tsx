import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, BookOpen, DollarSign, GraduationCap, 
  Activity, Settings, RefreshCw, Play, Pause,
  UserCheck, UserX, ArrowUpCircle, ArrowDownCircle,
  Plus, CheckCircle, XCircle, Clock, Upload, FileText,
  Search, Send
} from "lucide-react";
import { EnrollmentWorkflow } from "@/components/admin/EnrollmentWorkflow";
import { ProgramsManagement } from "@/components/admin/ProgramsManagement";
import { AdmissionsWorkspace } from "@/pages/AdmissionsWorkspace";

type MembershipStatus = "free" | "paid";
type ActivityStatus = "active" | "inactive";
type TutorStatus = "unverified" | "verified" | "partner_educator";
type EarningStatus = "pending" | "paid" | "paused";
type RevenueBase = "fee" | "sales" | "gross_margin";
type TriggerCondition = "payment" | "attendance" | "completion" | "conversion";

interface Member {
  id: string;
  member_type: string;
  membership_status: MembershipStatus;
  activity_status: ActivityStatus;
  invitor_id: string | null;
  join_date: string;
  last_activity_at: string | null;
}

interface Program {
  id: string;
  name: string;
  sbu: string;
  revenue_base: RevenueBase;
  trigger_condition: TriggerCondition;
  is_active: boolean;
}

interface Earning {
  id: string;
  member_id: string;
  program_id: string;
  amount: number;
  earning_status: EarningStatus;
  period: string;
}

interface Tutor {
  id: string;
  member_id: string;
  tutor_type: string;
  tutor_status: TutorStatus;
  free_class_minutes_last_30_days: number;
}

interface Stats {
  members: { total: number; free: number; paid: number; active: number; inactive: number };
  programs: { total: number; active: number };
  earnings: { total: number; pending: number; paid: number; paused: number; totalAmount: number };
  tutors: { total: number; unverified: number; verified: number; partner_educator: number };
  collaborations: { total: number; active: number };
}

interface Prospect {
  id: string;
  full_name: string;
  phone: string | null;
  student_number: string | null;
  email: string | null;
  country: string | null;
  program_of_interest: string | null;
  external_reference: string | null;
  school: string | null;
  province: string | null;
  notes: string | null;
  campaign_source: string | null;
  import_status: string;
}

export default function HubAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [memberFilter, setMemberFilter] = useState<{ membership?: string; activity?: string }>({});
  const [tutorFilter, setTutorFilter] = useState<string>("");
  const [earningFilter, setEarningFilter] = useState<{ status?: string }>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [csvSummary, setCsvSummary] = useState<{
    total: number; imported: number; skipped: number;
    errors: { rowNumber: number; email: string | null; reason: string }[];
    successes: { rowNumber: number; email: string | null; phone: string | null; prospectId: string }[];
  } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // --- Prospect Campaign section state (GE-EXEC-004A) ---
  const [prospectSearch, setProspectSearch] = useState("");
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(new Set());
  const [zaloDialogOpen, setZaloDialogOpen] = useState(false);
  const [sentProspectIds, setSentProspectIds] = useState<Set<string>>(new Set());
  const [failedProspectIds, setFailedProspectIds] = useState<Set<string>>(new Set());

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/admin/members", memberFilter],
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ["/api/admin/programs"],
  });

  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earning[]>({
    queryKey: ["/api/admin/earnings", earningFilter],
  });

  const { data: tutors = [], isLoading: tutorsLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/admin/tutors", tutorFilter],
  });

  // Assumption: mirrors the existing /api/admin/* list pattern above.
  // No GET endpoint for prospects was visible in this file — if it doesn't
  // exist yet, this query will simply 404/error and the list renders empty.
  const { data: prospects = [], isLoading: prospectsLoading } = useQuery<Prospect[]>({
    queryKey: ["/api/admin/prospects"],
  });

  const updateMembershipMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MembershipStatus }) => {
      const res = await apiRequest("PATCH", `/api/admin/members/${id}/membership`, { membership_status: status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Membership updated" });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ActivityStatus }) => {
      const res = await apiRequest("PATCH", `/api/admin/members/${id}/activity`, { activity_status: status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
      toast({ title: "Activity status updated" });
    },
  });

  const toggleProgramMutation = useMutation({
    mutationFn: async ({ id, activate }: { id: string; activate: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/programs/${id}/${activate ? "activate" : "deactivate"}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Program status updated" });
    },
  });

  const pauseEarningMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/admin/earnings/${id}/pause`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Earning paused" });
    },
  });

  const resumeEarningMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/admin/earnings/${id}/resume`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Earning resumed" });
    },
  });

  const updateTutorStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TutorStatus }) => {
      const res = await apiRequest("PATCH", `/api/admin/tutors/${id}/status`, { tutor_status: status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Tutor status updated" });
    },
  });

  const runActivityDecayMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/activity-decay/check");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ 
        title: "Activity decay check complete", 
        description: `Checked ${data.checked} members, deactivated ${data.deactivated}` 
      });
    },
  });

  const runTutorCheckMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/tutors/check-free-class-requirement");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ 
        title: "Tutor check complete", 
        description: `Checked ${data.checked} tutors, demoted ${data.demoted}` 
      });
    },
  });

  const csvImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const res = await fetch("/api/admin/prospects/csv-import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const json = await res.json();
      if (!res.ok && res.status !== 422) throw new Error(json?.error ?? "Import failed");
      return json;
    },
    onSuccess: (summary) => {
      setCsvSummary(summary);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prospects"] });
      toast({
        title: summary.imported > 0
          ? `Import complete — ${summary.imported} prospect${summary.imported !== 1 ? "s" : ""} created`
          : "Import finished — 0 prospects created",
        description: summary.skipped > 0
          ? `${summary.skipped} row${summary.skipped !== 1 ? "s" : ""} skipped`
          : undefined,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    },
  });

  // GE-EXEC-004B-REV3 — Excel (.xlsx) import, same summary UI as CSV.
  const excelImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const buffer = await file.arrayBuffer();
      const res = await fetch("/api/admin/prospects/excel-import", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buffer,
      });
      const json = await res.json();
      if (!res.ok && res.status !== 422) throw new Error(json?.error ?? "Import failed");
      return json;
    },
    onSuccess: (summary) => {
      setCsvSummary(summary);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prospects"] });
      toast({
        title: summary.imported > 0
          ? `Import complete — ${summary.imported} prospect${summary.imported !== 1 ? "s" : ""} created`
          : "Import finished — 0 prospects created",
        description: summary.skipped > 0
          ? `${summary.skipped} row${summary.skipped !== 1 ? "s" : ""} skipped`
          : undefined,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    },
  });

  // GE-EXEC-004B-REV3 — delete selected / delete all prospects.
  const deleteSelectedProspectsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("DELETE", "/api/admin/prospects", { ids });
      return res.json();
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prospects"] });
      clearProspectSelection();
      toast({ title: `${ids.length} prospect${ids.length !== 1 ? "s" : ""} deleted` });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteAllProspectsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/admin/prospects/all");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prospects"] });
      clearProspectSelection();
      toast({ title: "All prospects deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  // GE-EXEC-004B-REV3 — real Zalo ZNS broadcast (see server/services/zalo-transport.ts).
  // Reports per-recipient success/failure rather than assuming success.
  const zaloBroadcastMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("POST", "/api/admin/prospects/zalo-broadcast", { ids });
      return res.json() as Promise<{ sent: number; failed: number; results: Array<{ prospectId: string; success: boolean; reason?: string }> }>;
    },
    onSuccess: (result) => {
      const newlySent = new Set<string>();
      const newlyFailed = new Set<string>();
      result.results.forEach((r) => {
        if (r.success) newlySent.add(r.prospectId);
        else newlyFailed.add(r.prospectId);
      });
      setSentProspectIds((prev) => new Set([...prev, ...newlySent]));
      setFailedProspectIds((prev) => new Set([...prev, ...newlyFailed]));
      toast({
        title: result.sent > 0 ? `Broadcast sent to ${result.sent} recipient${result.sent !== 1 ? "s" : ""}` : "Broadcast failed for all recipients",
        description: result.failed > 0
          ? `${result.failed} failed — ${result.results.find((r) => !r.success)?.reason ?? "see server logs"}`
          : undefined,
        variant: result.sent > 0 ? undefined : "destructive",
      });
      setZaloDialogOpen(false);
      clearProspectSelection();
    },
    onError: (err: Error) => {
      toast({ title: "Broadcast failed", description: err.message, variant: "destructive" });
    },
  });

  // --- Prospect Campaign helpers (GE-EXEC-004A) ---
  const filteredProspects = prospects.filter((p) => {
    const q = prospectSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      (p.student_number ?? "").toLowerCase().includes(q)
    );
  });

  const toggleProspectSelection = (id: string) => {
    setSelectedProspectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllProspects = () => {
    setSelectedProspectIds(new Set(filteredProspects.map((p) => p.id)));
  };

  const clearProspectSelection = () => setSelectedProspectIds(new Set());

  const selectedProspects = prospects.filter((p) => selectedProspectIds.has(p.id));

  // GE-EXEC-004B-REV3 — sends via the real backend Zalo ZNS transport.
  const handleZaloBroadcast = () => {
    zaloBroadcastMutation.mutate(Array.from(selectedProspectIds));
  };

  const campaignSummary = {
    selected: selectedProspectIds.size,
    ready: prospects.length - sentProspectIds.size - failedProspectIds.size,
    sent: sentProspectIds.size,
    failed: failedProspectIds.size,
  };

  const StatCard = ({ title, value, icon: Icon, subtitle }: { title: string; value: number | string; icon: any; subtitle?: string }) => (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Hub Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage programs, members, earnings, and tutors</p>
        </div>
        <Badge variant="outline" className="text-sm">Admin Only</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap w-full max-w-3xl gap-1" data-testid="tabs-admin">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="programs" data-testid="tab-programs">Programs</TabsTrigger>
          <TabsTrigger value="members" data-testid="tab-members">Members</TabsTrigger>
          <TabsTrigger value="collaborations" data-testid="tab-collaborations">Collaborations</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          <TabsTrigger value="tutors" data-testid="tab-tutors">Tutors</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          <TabsTrigger value="enrollment" data-testid="tab-enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="admissions" data-testid="tab-admissions">Admissions</TabsTrigger>
          <TabsTrigger value="prospects" data-testid="tab-prospects">Prospects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {statsLoading ? (
            <div className="text-center py-8">Loading stats...</div>
          ) : stats ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Members" value={stats.members.total} icon={Users} subtitle={`${stats.members.active} active`} />
                <StatCard title="Active Programs" value={stats.programs.active} icon={BookOpen} subtitle={`of ${stats.programs.total} total`} />
                <StatCard title="Total Earnings" value={`$${stats.earnings.totalAmount.toFixed(2)}`} icon={DollarSign} subtitle={`${stats.earnings.pending} pending`} />
                <StatCard title="Verified Tutors" value={stats.tutors.verified + stats.tutors.partner_educator} icon={GraduationCap} subtitle={`${stats.tutors.unverified} unverified`} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Member Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Free Members</span><Badge variant="secondary">{stats.members.free}</Badge></div>
                    <div className="flex justify-between"><span>Paid Members</span><Badge variant="default">{stats.members.paid}</Badge></div>
                    <div className="flex justify-between"><span>Active</span><Badge className="bg-green-500">{stats.members.active}</Badge></div>
                    <div className="flex justify-between"><span>Inactive</span><Badge variant="destructive">{stats.members.inactive}</Badge></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Referral Earnings</CardTitle>
                    <CardDescription className="text-xs">Purchase-based earnings attribution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Pending</span><Badge variant="secondary">{stats.earnings.pending}</Badge></div>
                    <div className="flex justify-between"><span>Paid</span><Badge className="bg-green-500">{stats.earnings.paid}</Badge></div>
                    <div className="flex justify-between"><span>Paused</span><Badge variant="destructive">{stats.earnings.paused}</Badge></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Collaboration Graph</CardTitle>
                    <CardDescription className="text-xs">Invitor–Invitee relationships</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Total Collaborations</span><Badge variant="outline">{stats.collaborations.total}</Badge></div>
                    <div className="flex justify-between"><span>Active</span><Badge className="bg-green-500">{stats.collaborations.active}</Badge></div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Collaborations are independent of referral earnings
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <ProgramsManagement />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>View and manage member status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select onValueChange={(v) => setMemberFilter(prev => ({ ...prev, membership: v === "all" ? undefined : v }))}>
                  <SelectTrigger className="w-40" data-testid="select-membership-filter">
                    <SelectValue placeholder="Membership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => setMemberFilter(prev => ({ ...prev, activity: v === "all" ? undefined : v }))}>
                  <SelectTrigger className="w-40" data-testid="select-activity-filter">
                    <SelectValue placeholder="Activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {membersLoading ? (
                <div className="text-center py-4">Loading members...</div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`member-row-${member.id}`}>
                      <div>
                        <div className="font-medium">{member.member_type}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined: {new Date(member.join_date).toLocaleDateString()}
                          {member.invitor_id && ` | Invitor: ${member.invitor_id.slice(0, 8)}...`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.membership_status === "paid" ? "default" : "secondary"}>
                          {member.membership_status}
                        </Badge>
                        <Badge variant={member.activity_status === "active" ? "default" : "destructive"}>
                          {member.activity_status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMembershipMutation.mutate({ 
                            id: member.id, 
                            status: member.membership_status === "paid" ? "free" : "paid" 
                          })}
                          disabled={updateMembershipMutation.isPending}
                          data-testid={`button-toggle-membership-${member.id}`}
                        >
                          {member.membership_status === "paid" ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateActivityMutation.mutate({ 
                            id: member.id, 
                            status: member.activity_status === "active" ? "inactive" : "active" 
                          })}
                          disabled={updateActivityMutation.isPending}
                          data-testid={`button-toggle-activity-${member.id}`}
                        >
                          {member.activity_status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">No members found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Graph (Invitor–Invitee)</CardTitle>
                <CardDescription>
                  View permanent cooperative relationship lineage. Each member has one originating cooperative relationship, 
                  but can invite multiple members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.filter(m => m.invitor_id).slice(0, 10).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`collab-row-${member.id}`}>
                      <div>
                        <div className="font-medium text-sm">{member.member_type || 'Member'}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {member.id.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Invitor</div>
                        <Badge variant="outline" className="text-xs">
                          {member.invitor_id?.slice(0, 8)}...
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {members.filter(m => m.invitor_id).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No collaboration relationships found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Collaborations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Key Concepts:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Collaboration</strong> = Invitor–Invitee relationship (permanent)</li>
                    <li>Each member can have only ONE invitor</li>
                    <li>A member can invite multiple invitees</li>
                    <li>Creates long-term passive earning relationships</li>
                  </ul>
                  <p className="font-medium text-foreground mt-4">vs. Referrals:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Referral</strong> = Purchase attribution (transactional)</li>
                    <li>Any member can share referral links</li>
                    <li>Earnings triggered by purchases only</li>
                    <li>Does NOT change collaboration relationships</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Earnings & Attribution</CardTitle>
              <CardDescription>
                Earnings triggered by purchases through referral links. 
                <span className="block text-xs mt-1">Note: Referrals do not create collaboration relationships.</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select onValueChange={(v) => setEarningFilter({ status: v === "all" ? undefined : v })}>
                  <SelectTrigger className="w-40" data-testid="select-earning-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {earningsLoading ? (
                <div className="text-center py-4">Loading earnings...</div>
              ) : (
                <div className="space-y-3">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`earning-row-${earning.id}`}>
                      <div>
                        <div className="font-medium">${Number(earning.amount).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Period: {earning.period} | Member: {earning.member_id.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={earning.earning_status === "paid" ? "default" : earning.earning_status === "paused" ? "destructive" : "secondary"}
                        >
                          {earning.earning_status}
                        </Badge>
                        {earning.earning_status === "pending" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => pauseEarningMutation.mutate(earning.id)}
                            disabled={pauseEarningMutation.isPending}
                            data-testid={`button-pause-earning-${earning.id}`}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {earning.earning_status === "paused" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => resumeEarningMutation.mutate(earning.id)}
                            disabled={resumeEarningMutation.isPending}
                            data-testid={`button-resume-earning-${earning.id}`}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {earnings.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">No earnings found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Governance</CardTitle>
              <CardDescription>Manage tutor verification and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select onValueChange={(v) => setTutorFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-48" data-testid="select-tutor-status-filter">
                    <SelectValue placeholder="Tutor Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="partner_educator">Partner Educator</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => runTutorCheckMutation.mutate()}
                  disabled={runTutorCheckMutation.isPending}
                  data-testid="button-run-tutor-check"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${runTutorCheckMutation.isPending ? 'animate-spin' : ''}`} />
                  Check Free Class Requirement
                </Button>
              </div>
              {tutorsLoading ? (
                <div className="text-center py-4">Loading tutors...</div>
              ) : (
                <div className="space-y-3">
                  {tutors.map((tutor) => (
                    <div key={tutor.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`tutor-row-${tutor.id}`}>
                      <div>
                        <div className="font-medium">{tutor.tutor_type}</div>
                        <div className="text-sm text-muted-foreground">
                          Free class: {tutor.free_class_minutes_last_30_days} mins | Member: {tutor.member_id.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            tutor.tutor_status === "partner_educator" ? "default" : 
                            tutor.tutor_status === "verified" ? "secondary" : "destructive"
                          }
                        >
                          {tutor.tutor_status}
                        </Badge>
                        <Select 
                          value={tutor.tutor_status}
                          onValueChange={(v) => updateTutorStatusMutation.mutate({ id: tutor.id, status: v as TutorStatus })}
                        >
                          <SelectTrigger className="w-40" data-testid={`select-tutor-status-${tutor.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unverified">Unverified</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="partner_educator">Partner Educator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  {tutors.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">No tutors found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Decay Control</CardTitle>
              <CardDescription>Configure and run activity decay checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label>Inactivity Threshold</Label>
                  <p className="text-sm text-muted-foreground">
                    Members inactive for longer than this period will have their earnings paused.
                  </p>
                </div>
                <Badge variant="outline" className="text-lg">3 months</Badge>
              </div>
              <div className="border-t pt-4">
                <Button 
                  onClick={() => runActivityDecayMutation.mutate()}
                  disabled={runActivityDecayMutation.isPending}
                  data-testid="button-run-activity-decay"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${runActivityDecayMutation.isPending ? 'animate-spin' : ''}`} />
                  Run Activity Decay Check
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will mark inactive members and pause their pending earnings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase Backend</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Role Key</span>
                <Badge variant="outline">Configured</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Row Level Security</span>
                <Badge variant="default">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-4">
          <EnrollmentWorkflow members={members} programs={programs} />
        </TabsContent>

        <TabsContent value="admissions" className="space-y-4">
          <AdmissionsWorkspace />
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Prospect Import</CardTitle>
              <CardDescription>
                Required:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">full_name</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">phone</code>.
                Optional:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">student_number</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">external_reference</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">email</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">program_of_interest</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">school</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">province</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">notes</code>,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">campaign_source</code>.
                Missing optional fields are imported successfully and stored as empty/null.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Label htmlFor="csv-file-input">CSV File</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      id="csv-file-input"
                      ref={csvInputRef}
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      className="cursor-pointer max-w-xs"
                      data-testid="input-csv-file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setCsvFile(file);
                        setCsvSummary(null);
                      }}
                    />
                    {csvFile && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 shrink-0" />
                        {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => csvFile && csvImportMutation.mutate(csvFile)}
                  disabled={!csvFile || csvImportMutation.isPending}
                  data-testid="button-csv-upload"
                >
                  {csvImportMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              {/* GE-EXEC-004B-REV3 — Excel (.xlsx) import, same pipeline as CSV. */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Label htmlFor="excel-file-input">Excel File (.xlsx)</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      id="excel-file-input"
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="cursor-pointer max-w-xs"
                      data-testid="input-excel-file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setExcelFile(file);
                        setCsvSummary(null);
                      }}
                    />
                    {excelFile && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 shrink-0" />
                        {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Legacy .xls is not supported — save as .xlsx first.</p>
                </div>
                <Button
                  onClick={() => excelFile && excelImportMutation.mutate(excelFile)}
                  disabled={!excelFile || excelImportMutation.isPending}
                  data-testid="button-excel-upload"
                >
                  {excelImportMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              {csvSummary && (
                <div className="space-y-4 border-t pt-4" data-testid="csv-import-summary">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <div className="text-2xl font-bold">{csvSummary.total}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Total rows</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{csvSummary.imported}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Imported</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{csvSummary.skipped}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Skipped</div>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <div className="text-2xl font-bold text-destructive">{csvSummary.errors.length}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Errors</div>
                    </div>
                  </div>

                  {csvSummary.errors.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" /> Errors
                      </p>
                      <div className="max-h-48 overflow-y-auto rounded-md border divide-y text-sm" data-testid="csv-error-list">
                        {csvSummary.errors.map((err, i) => (
                          <div key={i} className="flex items-start gap-2 px-3 py-2">
                            <span className="text-muted-foreground shrink-0 tabular-nums">
                              {err.rowNumber > 0 ? `Row ${err.rowNumber}` : "—"}
                            </span>
                            {err.email && (
                              <span className="text-muted-foreground shrink-0">{err.email}</span>
                            )}
                            <span className="text-destructive">{err.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {csvSummary.successes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Imported
                      </p>
                      <div className="max-h-48 overflow-y-auto rounded-md border divide-y text-sm" data-testid="csv-success-list">
                        {csvSummary.successes.map((s) => (
                          <div key={s.prospectId} className="flex items-center gap-2 px-3 py-2">
                            <span className="text-muted-foreground shrink-0 tabular-nums">Row {s.rowNumber}</span>
                            <span className="flex-1 truncate">{s.phone ?? s.email ?? s.prospectId.slice(0, 8)}</span>
                            <span className="text-muted-foreground text-xs font-mono shrink-0">{s.prospectId.slice(0, 8)}…</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-csv-reset"
                    onClick={() => {
                      setCsvFile(null);
                      setCsvSummary(null);
                      if (csvInputRef.current) csvInputRef.current.value = "";
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Prospect Campaign section (GE-EXEC-004A) --- */}
          <Card data-testid="card-prospect-campaign">
            <CardHeader>
              <CardTitle>Prospect Campaign</CardTitle>
              <CardDescription>
                Select imported prospects and send a Zalo broadcast.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, phone, or student number"
                  className="pl-8"
                  value={prospectSearch}
                  onChange={(e) => setProspectSearch(e.target.value)}
                  data-testid="input-prospect-search"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="outline" size="sm" onClick={selectAllProspects} data-testid="button-select-all-prospects">
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearProspectSelection} data-testid="button-clear-prospect-selection">
                  Clear Selection
                </Button>
                <span className="text-sm text-muted-foreground" data-testid="text-selected-count">
                  {selectedProspectIds.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={selectedProspectIds.size === 0 || deleteSelectedProspectsMutation.isPending}
                  onClick={() => deleteSelectedProspectsMutation.mutate(Array.from(selectedProspectIds))}
                  data-testid="button-delete-selected-prospects"
                >
                  Delete Selected
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" data-testid="button-delete-all-prospects">
                      Delete All
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-delete-all-confirm">
                    <DialogHeader>
                      <DialogTitle>Delete all prospects?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      This permanently deletes every prospect in the repository ({prospects.length} total). This cannot be undone.
                    </p>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        disabled={deleteAllProspectsMutation.isPending}
                        onClick={() => deleteAllProspectsMutation.mutate()}
                        data-testid="button-confirm-delete-all"
                      >
                        Delete All
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="flex-1" />
                <Dialog open={zaloDialogOpen} onOpenChange={setZaloDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={selectedProspectIds.size === 0} data-testid="button-send-zalo">
                      <Send className="h-4 w-4 mr-2" />
                      Send via Zalo
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-zalo-preview">
                    <DialogHeader>
                      <DialogTitle>Zalo Broadcast Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipients</span>
                        <span className="font-medium" data-testid="text-recipient-count">{selectedProspectIds.size}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground">Message preview</span>
                        <div className="rounded-md border bg-muted/30 p-3">
                          Hi {"{{full_name}}"}, thanks for your interest{" "}
                          {"{{program_of_interest}}"}! We'll be in touch shortly.
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground">Template variables</span>
                        <div className="flex gap-1.5 flex-wrap">
                          <Badge variant="outline">{"{{full_name}}"}</Badge>
                          <Badge variant="outline">{"{{phone}}"}</Badge>
                          <Badge variant="outline">{"{{program_of_interest}}"}</Badge>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setZaloDialogOpen(false)} data-testid="button-zalo-cancel">
                        Cancel
                      </Button>
                      <Button onClick={handleZaloBroadcast} disabled={zaloBroadcastMutation.isPending} data-testid="button-zalo-broadcast">
                        {zaloBroadcastMutation.isPending ? "Sending…" : "Broadcast"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="w-10 p-2"></th>
                      <th className="text-left p-2 font-medium">Full Name</th>
                      <th className="text-left p-2 font-medium">Phone</th>
                      <th className="text-left p-2 font-medium">Student Number</th>
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Country</th>
                      <th className="text-left p-2 font-medium">Program</th>
                      <th className="text-left p-2 font-medium">School</th>
                      <th className="text-left p-2 font-medium">Province</th>
                      <th className="text-left p-2 font-medium">External Reference</th>
                      <th className="text-left p-2 font-medium">Notes</th>
                      <th className="text-left p-2 font-medium">Campaign Source</th>
                      <th className="text-left p-2 font-medium">Import Status</th>
                    </tr>
                  </thead>
                  <tbody data-testid="prospect-list-body">
                    {prospectsLoading ? (
                      <tr>
                        <td colSpan={13} className="p-4 text-center text-muted-foreground">Loading prospects…</td>
                      </tr>
                    ) : filteredProspects.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="p-4 text-center text-muted-foreground">No prospects found</td>
                      </tr>
                    ) : (
                      filteredProspects.map((p) => (
                        <tr key={p.id} className="border-b last:border-0" data-testid={`row-prospect-${p.id}`}>
                          <td className="p-2">
                            <Checkbox
                              checked={selectedProspectIds.has(p.id)}
                              onCheckedChange={() => toggleProspectSelection(p.id)}
                              data-testid={`checkbox-prospect-${p.id}`}
                            />
                          </td>
                          <td className="p-2">{p.full_name}</td>
                          <td className="p-2">{p.phone ?? "—"}</td>
                          <td className="p-2">{p.student_number ?? "—"}</td>
                          <td className="p-2">{p.email ?? "—"}</td>
                          <td className="p-2">{p.country ?? "—"}</td>
                          <td className="p-2">{p.program_of_interest ?? "—"}</td>
                          <td className="p-2">{p.school ?? "—"}</td>
                          <td className="p-2">{p.province ?? "—"}</td>
                          <td className="p-2">{p.external_reference ?? "—"}</td>
                          <td className="p-2">{p.notes ?? "—"}</td>
                          <td className="p-2">{p.campaign_source ?? "—"}</td>
                          <td className="p-2">
                            <Badge variant={sentProspectIds.has(p.id) ? "default" : "outline"}>
                              {sentProspectIds.has(p.id) ? "sent" : p.import_status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-campaign-summary">
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="text-2xl font-bold" data-testid="text-summary-selected">{campaignSummary.selected}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Selected</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold" data-testid="text-summary-ready">{campaignSummary.ready}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Ready</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-summary-sent">{campaignSummary.sent}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Sent</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-destructive" data-testid="text-summary-failed">{campaignSummary.failed}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
