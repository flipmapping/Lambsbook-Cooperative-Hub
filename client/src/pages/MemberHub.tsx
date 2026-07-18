import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  User, CreditCard, Users, BookOpen, DollarSign, 
  GraduationCap, Activity, AlertTriangle, CheckCircle,
  ArrowUpCircle, Clock, Eye, EyeOff, RefreshCw
} from "lucide-react";

type MembershipStatus = "free" | "paid";
type ActivityStatus = "active" | "inactive";
type TutorStatus = "unverified" | "verified" | "partner_educator";
type EarningStatus = "pending" | "paid" | "paused";

interface MemberProfile {
  user: { id: string; email: string };
  member: {
    id: string;
    member_type: string;
    membership_status: MembershipStatus;
    activity_status: ActivityStatus;
    subscription_price_at_signup: number | null;
    subscription_renewal_date: string | null;
    join_date: string;
    last_activity_at: string | null;
  } | null;
}

interface SubscriptionData {
  member: {
    membership_status: MembershipStatus;
    subscription_price_at_signup: number | null;
    subscription_renewal_date: string | null;
  } | null;
  subscriptions: Array<{
    id: string;
    price: number;
    renewal_date: string;
    status: string;
  }>;
  benefits: {
    free: { earning_programs: number; description: string };
    paid: { earning_programs: string; description: string };
  };
}

interface CollaborationData {
  invitor: { id: string; member_type: string } | null;
  collaboration_status: string | null;
  invitees: Array<{
    id: string;
    invitee: { id: string; member_type: string };
    status: string;
  }>;
  explanation: {
    how_it_works: string;
    earning_flow: string;
    status_meaning: { active: string; paused: string };
  };
}

interface ProgramsData {
  programs: Array<{
    id: string;
    name: string;
    sbu: string;
    revenue_base: string;
    trigger_condition: string;
    eligibility: { eligible: boolean } | null;
    can_earn: boolean;
  }>;
  membership_status: MembershipStatus;
  selected_count: number;
  max_selectable: number | string;
  can_select_more: boolean;
}

interface EarningsData {
  earnings: Array<{
    id: string;
    amount: number;
    earning_status: EarningStatus;
    period: string;
    program: { name: string; sbu: string };
  }>;
  summary: {
    pending: number;
    paid: number;
    paused: number;
    total: number;
  };
  hidden: boolean;
  message?: string;
  status_explanation: Record<string, string>;
}

interface TutorData {
  tutor: {
    id: string;
    tutor_type: string;
    tutor_status: TutorStatus;
    free_class_minutes_last_30_days: number;
  } | null;
  is_visible: boolean;
  visibility_explanation: {
    requirement: string;
    free_class: string;
    status_levels: Record<string, string>;
  };
}

interface ActivityData {
  activity_status: ActivityStatus;
  last_activity_at: string | null;
  recent_logs: Array<{
    id: string;
    activity_type: string;
    created_at: string;
  }>;
  warning: { message: string; consequence: string; action: string } | null;
  reactivation: { message: string; consequence: string; action: string } | null;
  inactivity_threshold: string;
}

function getAuthToken(): string | null {
  try {
    const tokenData = localStorage.getItem("supabase.auth.token");
    if (!tokenData) return null;
    const parsed = JSON.parse(tokenData);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

async function fetchWithAuth(url: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

async function postWithAuth(url: string, data?: unknown) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export default function MemberHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/member/me"],
    queryFn: () => fetchWithAuth("/api/member/me"),
    enabled: isAuthenticated,
  });

  const { data: activity, isLoading: activityLoading } = useQuery<ActivityData>({
    queryKey: ["/api/member/recent-participation"],
    queryFn: () => fetchWithAuth("/api/member/recent-participation"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<any>({
    queryKey: ["/api/member/earnings"],
    queryFn: () => fetchWithAuth("/api/member/earnings"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const { data: invitationData, isLoading: invitationLoading } = useQuery<any>({
    queryKey: ["/api/member/pending-invitation"],
    queryFn: () => fetchWithAuth("/api/member/pending-invitation"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery<any>({
    queryKey: ["/api/member/trusted-relationships"],
    queryFn: () => fetchWithAuth("/api/member/trusted-relationships"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const isDashboardLoading =
    profileLoading ||
    activityLoading ||
    earningsLoading ||
    invitationLoading ||
    relationshipsLoading ||
    false;

  const selectProgramMutation = useMutation({
    mutationFn: (programId: string) => postWithAuth(`/api/member/programs/${programId}/select`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/programs"] });
      toast({ title: "Program selected" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deselectProgramMutation = useMutation({
    mutationFn: (programId: string) => postWithAuth(`/api/member/programs/${programId}/deselect`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/programs"] });
      toast({ title: "Program deselected" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const logActivityMutation = useMutation({
    mutationFn: () => postWithAuth("/api/member/activity/log", { activity_type: "manual_check_in" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/member/earnings"] });
      toast({ title: "Activity logged", description: "Your account is now active" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: () =>
      postWithAuth("/api/member/invitations", {
        invitedEmail
      }),
    onSuccess: (data:any) => {
      setInviteLink(
        data?.inviteUrl ||
        data?.invitationUrl ||
        data?.url ||
        data?.link ||
        ""
      );

      toast({
        title: "Invitation created"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: () =>
      postWithAuth("/api/member/accept-invitation", {
        invitationId: invitationData?.invitation?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/pending-invitation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/member/me"] });
      toast({ title: "Invitation accepted" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Lambsbook Hub</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access your member dashboard.</p>
            <div className="flex justify-center gap-4">
              <Link href="/hub/login">
                <Button data-testid="button-login">Sign In</Button>
              </Link>
              <Link href="/hub/signup">
                <Button variant="outline" data-testid="button-signup">Create Account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDashboardLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Preparing your operational member dashboard...
          </p>
        </div>
      </div>
    );
  }

  console.log("MEMBERHUB_READINESS", {
    profile: !!profile,
  });

  if (
    !profile ||
    false
  ) {
    return (
      <div className="container mx-auto p-6 max-w-5xl space-y-4">

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dashboard unavailable</AlertTitle>
          <AlertDescription>
            Some operational dashboard data could not be loaded.
            Please refresh and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Member Dashboard</h1>
          <p className="text-muted-foreground">
            {profile?.user?.email || "Member account"}
          </p>
        </div>
        <Badge 
          variant={profile?.member?.membership_status === "paid" ? "default" : "secondary"}
          className="text-sm"
        >
          {profile?.member?.membership_status === "paid" ? "Paid Member" : "Free Member"}
        </Badge>
      </div>

      {activity?.warning && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-inactivity-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Inactivity Warning</AlertTitle>
          <AlertDescription>
            {activity.warning.message} {activity.warning.consequence}
            <Button 
              size="sm" 
              className="ml-4" 
              onClick={() => logActivityMutation.mutate()}
              disabled={logActivityMutation.isPending}
              data-testid="button-reactivate"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${logActivityMutation.isPending ? 'animate-spin' : ''}`} />
              Stay Active
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {activity?.reactivation && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-inactive-account">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account Inactive</AlertTitle>
          <AlertDescription>
            {activity.reactivation.message} {activity.reactivation.consequence}
            <Button 
              size="sm" 
              className="ml-4" 
              onClick={() => logActivityMutation.mutate()}
              disabled={logActivityMutation.isPending}
              data-testid="button-reactivate-account"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${logActivityMutation.isPending ? 'animate-spin' : ''}`} />
              Reactivate Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full" data-testid="tabs-member">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="membership" data-testid="tab-membership">Membership</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">Invitations</TabsTrigger>
          <TabsTrigger value="relationships" data-testid="tab-relationships">Relationships</TabsTrigger>
          <TabsTrigger value="workspace" data-testid="tab-workspace">Workspace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="stat-card-membership">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Membership</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{profile?.member?.membership_status || "Free"}</div>
                <p className="text-xs text-muted-foreground">
                  {profile?.member?.membership_status === "paid" ? "Unlimited program access" : "2 programs"}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-card-activity">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Activity Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{activity?.activity_status || "Active"}</div>
                <p className="text-xs text-muted-foreground">
                  Last active: {activity?.last_activity_at ? new Date(activity.last_activity_at).toLocaleDateString() : "Recently"}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2" data-testid="card-recent-participation">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Recent Cooperative Participation</CardTitle>

                  <div className="text-[10px] px-2 py-1 rounded-full border text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? "Participation active"
                      : "Participation pending"}
                  </div>
                </div>
                <CardDescription>
                  Recent cooperative participation activity and continuity.
                </CardDescription>

                <div className="px-6 pb-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? "Cooperative participation continuity remains active."
                      : "Participation continuity will appear as cooperative activity grows."}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? "Your recent cooperative participation history continues to grow."
                      : "Cooperative participation summaries will appear as engagement develops."}
                  </div>

                  <div className="pt-2">
                    <button
                      className="text-xs border rounded-md px-3 py-1 hover:bg-muted transition-colors"
                      type="button"
                    >
                      Continue cooperative participation
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {activity?.recent_logs?.length ? (
                  <div className="space-y-4">
                    {activity.recent_logs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between border rounded-lg px-3 py-2 transition-colors hover:bg-muted/40"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {log.activity_type === "manual_check_in"
                              ? "Manual participation check-in"
                              : log.activity_type.replaceAll("_", " ")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cooperative participation activity
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {(() => {
                            const now = new Date();
                            const created = new Date(log.created_at);

                            const diffMs = now.getTime() - created.getTime();
                            const diffDays = Math.floor(
                              diffMs / (1000 * 60 * 60 * 24)
                            );

                            if (diffDays <= 0) return "Today";
                            if (diffDays === 1) return "Yesterday";
                            if (diffDays < 7) return `${diffDays} days ago`;

                            return created.toLocaleDateString();
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No recent cooperative participation recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>          </div>

          {profile?.member?.membership_status === "free" && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5" data-testid="card-upgrade-cta">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Upgrade to Paid Membership
                </CardTitle>
                <CardDescription>Unlock unlimited earning potential across all programs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Earn from all programs automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No program selection limits
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support and features
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button data-testid="button-upgrade">Upgrade Now</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membership Overview</CardTitle>
              <CardDescription>Your current membership status and benefits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Current Status</div>
                  <div className="text-sm text-muted-foreground">
                    {profile?.member?.membership_status === "paid" 
                      ? "You have full access to all programs and features"
                      : "Free tier with limited program access"}
                  </div>
                </div>
                <Badge variant={profile?.member?.membership_status === "paid" ? "default" : "secondary"} className="text-lg px-4 py-2">
                  {profile?.member?.membership_status === "paid" ? "PAID" : "FREE"}
                </Badge>
              </div>



              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className={profile?.member?.membership_status === "free" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">Free Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Access available according to your membership status.
                    </p>
                  </CardContent>
                </Card>
                <Card className={profile?.member?.membership_status === "paid" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">Paid Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Full access available for paid members.
                    </p>
                    <div className="mt-4">
                      <Badge>Unlimited programs</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings</CardTitle>
              <CardDescription>
                Cooperative earnings recorded for your member account
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!earnings?.length ? (
                <div className="text-sm text-muted-foreground">
                  No earnings recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.map((earning: any) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium">
                          $ {earning.amount}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Status: {earning.earning_status}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Period: {earning.period}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Membership invitations and invitation status
              </CardDescription>
            </CardHeader>

            <CardContent>

              <Button
                className="mb-4"
                onClick={() => setInviteModalOpen(true)}
              >
                Generate Invitation
              </Button>

              {!invitationData?.has_pending_invitation ? (
                <div className="text-sm text-muted-foreground">
                  No pending invitation.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">
                      Invitation Found
                    </div>

                    <div className="text-xs text-muted-foreground">
                      ID: {invitationData?.invitation?.id}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Status: {invitationData?.invitation?.status}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created: {invitationData?.invitation?.created_at}
                    </div>

                    <Button
                      className="mt-3"
                      onClick={() => acceptInvitationMutation.mutate()}
                      disabled={acceptInvitationMutation.isPending}
                    >
                      Accept Invitation
                    </Button>
                  </div>
                </div>
              )}

              <Dialog
                open={inviteModalOpen}
                onOpenChange={setInviteModalOpen}
              >
                <DialogContent>
                  <div className="space-y-4">

                    <Input
                      type="email"
                      value={invitedEmail}
                      onChange={(e) => setInvitedEmail(e.target.value)}
                      placeholder="Invitee email"
                    />

                    <Button
                      onClick={() => createInvitationMutation.mutate()}
                      disabled={createInvitationMutation.isPending}
                    >
                      Create Invitation
                    </Button>

                    {inviteLink && (
                      <div className="space-y-2">
                        <div className="text-xs">
                          Invite Link
                        </div>

                        <div className="text-xs break-all">
                          {inviteLink}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() =>
                            navigator.clipboard.writeText(inviteLink)
                          }
                        >
                          Copy Link
                        </Button>
                      </div>
                    )}

                  </div>
                </DialogContent>
              </Dialog>

            

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trusted Relationships</CardTitle>
              <CardDescription>
                Invitor and direct invitee relationships
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="border rounded-lg p-3">
                <div className="font-medium">
                  Invitor
                </div>

                <div className="text-sm text-muted-foreground">
                  {relationshipsData?.invitor?.id || "No invitor recorded"}
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  Direct relationship source
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <div className="font-medium">
                  Direct Invitees
                </div>

                <div className="text-xs text-muted-foreground">
                  Count: {relationshipsData?.invitees?.length || 0}
                </div>

                {!relationshipsData?.invitees?.length ? (
                  <div className="text-sm text-muted-foreground">
                    No invitees recorded.
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {relationshipsData.invitees.map((invitee:any) => (
                      <div
                        key={invitee.id}
                        className="text-sm border rounded p-2"
                      >
                        {invitee.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Cooperative participation and operational modules
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">

                <a href="/hub/dashboard#pipeline" className="block border rounded-lg p-3">
                  <div className="font-medium">Idea Pipeline</div>
                  <div className="text-xs text-muted-foreground">
                    Cooperative idea lifecycle
                  </div>
                </a>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">My Contributions</div>
                  <div className="text-xs text-muted-foreground">
                    Contribution participation
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">Programs</div>
                  <div className="text-xs text-muted-foreground">
                    Cooperative programs
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">Learning History</div>
                  <div className="text-xs text-muted-foreground">
                    Learning participation
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">IELTS</div>
                  <div className="text-xs text-muted-foreground">
                    IELTS workspace
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">Multilingual</div>
                  <div className="text-xs text-muted-foreground">
                    Language workspace
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
