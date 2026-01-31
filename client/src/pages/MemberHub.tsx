import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
  return localStorage.getItem('hub_access_token') || localStorage.getItem('supabase_access_token');
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

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery<MemberProfile>({
    queryKey: ["/api/member/profile"],
    queryFn: () => fetchWithAuth("/api/member/profile"),
    enabled: isAuthenticated,
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/member/subscription"],
    queryFn: () => fetchWithAuth("/api/member/subscription"),
    enabled: isAuthenticated,
  });

  const { data: collaboration, isLoading: collaborationLoading } = useQuery<CollaborationData>({
    queryKey: ["/api/member/collaboration"],
    queryFn: () => fetchWithAuth("/api/member/collaboration"),
    enabled: isAuthenticated,
  });

  const { data: programs, isLoading: programsLoading } = useQuery<ProgramsData>({
    queryKey: ["/api/member/programs"],
    queryFn: () => fetchWithAuth("/api/member/programs"),
    enabled: isAuthenticated,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<EarningsData>({
    queryKey: ["/api/member/earnings"],
    queryFn: () => fetchWithAuth("/api/member/earnings"),
    enabled: isAuthenticated,
  });

  const { data: tutorProfile, isLoading: tutorLoading } = useQuery<TutorData>({
    queryKey: ["/api/member/tutor-profile"],
    queryFn: () => fetchWithAuth("/api/member/tutor-profile"),
    enabled: isAuthenticated,
  });

  const { data: activity, isLoading: activityLoading } = useQuery<ActivityData>({
    queryKey: ["/api/member/activity"],
    queryFn: () => fetchWithAuth("/api/member/activity"),
    enabled: isAuthenticated,
  });

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
  });

  const logActivityMutation = useMutation({
    mutationFn: () => postWithAuth("/api/member/activity/log", { activity_type: "manual_check_in" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/member/earnings"] });
      toast({ title: "Activity logged", description: "Your account is now active" });
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

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Member Dashboard</h1>
          <p className="text-muted-foreground">
            {profile?.user?.email || "Loading..."}
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
          <TabsTrigger value="collaboration" data-testid="tab-collaboration">Network</TabsTrigger>
          <TabsTrigger value="programs" data-testid="tab-programs">Programs</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          <TabsTrigger value="tutor" data-testid="tab-tutor">Tutor</TabsTrigger>
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

            <Card data-testid="stat-card-network">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collaboration?.invitees?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Direct invitees</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-card-earnings">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {earnings?.hidden ? "—" : `$${earnings?.summary?.total?.toFixed(2) || "0.00"}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {earnings?.hidden ? "Hidden (inactive)" : `$${earnings?.summary?.pending?.toFixed(2) || "0"} pending`}
                </p>
              </CardContent>
            </Card>
          </div>

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

              {subscription?.member?.subscription_price_at_signup && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Subscription Price</div>
                    <div className="text-xl font-bold">${subscription.member.subscription_price_at_signup}/month</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Renewal Date</div>
                    <div className="text-xl font-bold">
                      {subscription.member.subscription_renewal_date 
                        ? new Date(subscription.member.subscription_renewal_date).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className={profile?.member?.membership_status === "free" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">Free Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{subscription?.benefits?.free?.description}</p>
                    <div className="mt-4">
                      <Badge variant="secondary">Up to {subscription?.benefits?.free?.earning_programs} programs</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className={profile?.member?.membership_status === "paid" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">Paid Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{subscription?.benefits?.paid?.description}</p>
                    <div className="mt-4">
                      <Badge>Unlimited programs</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Network</CardTitle>
              <CardDescription>{collaboration?.explanation?.how_it_works}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">How Earnings Flow</div>
                <p className="text-sm text-muted-foreground">{collaboration?.explanation?.earning_flow}</p>
              </div>

              {collaboration?.invitor && (
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Your Invitor</div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{collaboration.invitor.member_type}</div>
                    <Badge variant={collaboration.collaboration_status === "active" ? "default" : "secondary"}>
                      {collaboration.collaboration_status}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-3">Your Direct Invitees ({collaboration?.invitees?.length || 0})</div>
                {collaboration?.invitees?.length ? (
                  <div className="space-y-2">
                    {collaboration.invitees.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`invitee-row-${inv.id}`}>
                        <div className="font-medium">{inv.invitee?.member_type || "Member"}</div>
                        <Badge variant={inv.status === "active" ? "default" : "secondary"}>{inv.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No invitees yet. Share your referral link to grow your network.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Engagement</CardTitle>
              <CardDescription>
                {programs?.membership_status === "paid" 
                  ? "As a paid member, you automatically earn from all programs."
                  : `Select up to ${programs?.max_selectable} programs to earn from. (${programs?.selected_count || 0}/${programs?.max_selectable} selected)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {programs?.membership_status === "free" && (
                <Progress 
                  value={((programs?.selected_count || 0) / 2) * 100} 
                  className="mb-6" 
                />
              )}
              
              {programsLoading ? (
                <div className="text-center py-4">Loading programs...</div>
              ) : (
                <div className="space-y-3">
                  {programs?.programs?.map((program) => (
                    <div 
                      key={program.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`program-row-${program.id}`}
                    >
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SBU: {program.sbu} | Revenue: {program.revenue_base} | Trigger: {program.trigger_condition}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {program.can_earn ? (
                          <Badge className="bg-green-500">Earning</Badge>
                        ) : (
                          <Badge variant="secondary">Not Selected</Badge>
                        )}
                        {programs?.membership_status === "free" && (
                          program.can_earn ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deselectProgramMutation.mutate(program.id)}
                              disabled={deselectProgramMutation.isPending}
                              data-testid={`button-deselect-${program.id}`}
                            >
                              Deselect
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => selectProgramMutation.mutate(program.id)}
                              disabled={!programs.can_select_more || selectProgramMutation.isPending}
                              data-testid={`button-select-${program.id}`}
                            >
                              Select
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                  {!programs?.programs?.length && (
                    <div className="text-center py-4 text-muted-foreground">No programs available</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Earnings Dashboard
                {earnings?.hidden && <EyeOff className="h-5 w-5 text-muted-foreground" />}
              </CardTitle>
              <CardDescription>
                {earnings?.hidden 
                  ? earnings.message 
                  : "Track your earnings by program and period"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnings?.hidden ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Earnings Hidden</AlertTitle>
                  <AlertDescription>
                    {earnings.message}
                    <Button 
                      size="sm" 
                      className="ml-4" 
                      onClick={() => logActivityMutation.mutate()}
                      disabled={logActivityMutation.isPending}
                    >
                      Reactivate Account
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold">${earnings?.summary?.total?.toFixed(2) || "0.00"}</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Pending</div>
                      <div className="text-2xl font-bold text-yellow-600">${earnings?.summary?.pending?.toFixed(2) || "0.00"}</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Paid</div>
                      <div className="text-2xl font-bold text-green-600">${earnings?.summary?.paid?.toFixed(2) || "0.00"}</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Paused</div>
                      <div className="text-2xl font-bold text-red-600">${earnings?.summary?.paused?.toFixed(2) || "0.00"}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {earnings?.earnings?.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`earning-row-${earning.id}`}>
                        <div>
                          <div className="font-medium">${Number(earning.amount).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {earning.program?.name || "Unknown Program"} | Period: {earning.period}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            earning.earning_status === "paid" ? "default" : 
                            earning.earning_status === "paused" ? "destructive" : "secondary"
                          }
                        >
                          {earning.earning_status}
                        </Badge>
                      </div>
                    ))}
                    {!earnings?.earnings?.length && (
                      <div className="text-center py-8 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No earnings yet. Engage with programs and grow your network to start earning.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                    <div className="text-sm font-medium mb-2">Status Meanings</div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div><Badge variant="secondary">pending</Badge> - {earnings?.status_explanation?.pending}</div>
                      <div><Badge>paid</Badge> - {earnings?.status_explanation?.paid}</div>
                      <div><Badge variant="destructive">paused</Badge> - {earnings?.status_explanation?.paused}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Tutor Profile
                {tutorProfile?.is_visible ? <Eye className="h-5 w-5 text-green-500" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
              </CardTitle>
              <CardDescription>
                {tutorProfile?.visibility_explanation?.requirement}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tutorProfile?.tutor ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Tutor Type</div>
                      <div className="text-xl font-bold capitalize">{tutorProfile.tutor.tutor_type}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="text-xl font-bold capitalize">{tutorProfile.tutor.tutor_status.replace('_', ' ')}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Free Class Minutes (30 days)</div>
                      <div className="text-xl font-bold">{tutorProfile.tutor.free_class_minutes_last_30_days}</div>
                    </div>
                  </div>

                  <Alert variant={tutorProfile.is_visible ? "default" : "destructive"}>
                    {tutorProfile.is_visible ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <AlertTitle>Visible in Search</AlertTitle>
                        <AlertDescription>
                          Your profile is visible to students searching for tutors.
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <AlertTitle>Not Visible in Search</AlertTitle>
                        <AlertDescription>
                          Complete verification to become visible. Current status: {tutorProfile.tutor.tutor_status}
                        </AlertDescription>
                      </>
                    )}
                  </Alert>

                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="text-sm font-medium mb-2">Free Class Requirement</div>
                    <p className="text-sm text-muted-foreground">{tutorProfile.visibility_explanation.free_class}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Status Levels</div>
                    {Object.entries(tutorProfile.visibility_explanation.status_levels).map(([status, desc]) => (
                      <div key={status} className="flex items-start gap-2 p-2 border rounded">
                        <Badge 
                          variant={status === tutorProfile.tutor?.tutor_status ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">You don't have a tutor profile yet.</p>
                  <Button variant="outline" data-testid="button-become-tutor">Become a Tutor</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
