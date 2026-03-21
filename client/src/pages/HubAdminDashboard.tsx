import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Users, BookOpen, DollarSign, GraduationCap, 
  Activity, Settings, RefreshCw, Play, Pause,
  UserCheck, UserX, ArrowUpCircle, ArrowDownCircle,
  Plus, CheckCircle, XCircle, Clock
} from "lucide-react";
import { EnrollmentWorkflow } from "@/components/admin/EnrollmentWorkflow";

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

export default function HubAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [memberFilter, setMemberFilter] = useState<{ membership?: string; activity?: string }>({});
  const [tutorFilter, setTutorFilter] = useState<string>("");
  const [earningFilter, setEarningFilter] = useState<{ status?: string }>({});

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
          <Card>
            <CardHeader>
              <CardTitle>Program Management</CardTitle>
              <CardDescription>Create, activate, and deactivate programs</CardDescription>
            </CardHeader>
            <CardContent>
              {programsLoading ? (
                <div className="text-center py-4">Loading programs...</div>
              ) : (
                <div className="space-y-3">
                  {programs.map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`program-row-${program.id}`}>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SBU: {program.sbu} | Revenue: {program.revenue_base} | Trigger: {program.trigger_condition}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant={program.is_active ? "destructive" : "default"}
                          onClick={() => toggleProgramMutation.mutate({ id: program.id, activate: !program.is_active })}
                          disabled={toggleProgramMutation.isPending}
                          data-testid={`button-toggle-program-${program.id}`}
                        >
                          {program.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {programs.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">No programs found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
                  View member collaboration lineage. Each member can have only one invitor, 
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
      </Tabs>
    </div>
  );
}
