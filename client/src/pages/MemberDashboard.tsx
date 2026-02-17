import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, DollarSign, Users, Copy, 
  TrendingUp, Clock, CheckCircle2, LogOut, User, Settings, AlertCircle, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinancialSummary {
  net_balance: number;
  total_credits: number;
  total_debits: number;
}

interface ProfileData {
  user: {
    id: string;
    email: string;
    is_super_admin?: boolean;
  };
  member: {
    id: string;
    email: string;
    member_type: string;
    membership_status: string;
    activity_status: string;
    invitor_id: string | null;
    join_date: string;
    full_name?: string;
  } | null;
}

interface CollaborationData {
  invitor: { id: string; member_type: string } | null;
  collaboration_status: string | null;
  invitees: Array<{
    invitee: { id: string; member_type: string };
    status: string;
    created_at: string;
  }>;
}

interface EarningsData {
  earnings: Array<{
    id: string;
    amount: number;
    earning_status: string;
    created_at: string;
    program: { name: string; sbu: string } | null;
  }>;
  summary: {
    pending: number;
    paid: number;
    paused: number;
    total: number;
  };
  hidden: boolean;
  message?: string;
}

export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery<ProfileData>({
    queryKey: ['/api/member/profile'],
  });

  // Temporarily disabled — financial-summary fetch commented out
  // const { data: financialData, isLoading: financialLoading } = useQuery<{ summary: FinancialSummary | null }>({
  //   queryKey: ['/api/member/financial-summary'],
  // });
  const financialData = undefined as { summary: FinancialSummary | null } | undefined;
  const financialLoading = false;

  const { data: collaborationData } = useQuery<CollaborationData>({
    queryKey: ['/api/member/collaboration'],
  });

  const { data: earningsData } = useQuery<EarningsData>({
    queryKey: ['/api/member/earnings'],
  });

  const userEmail = profileData?.user?.email || '';
  const memberName = profileData?.member?.full_name || userEmail.split('@')[0] || '';
  const memberType = profileData?.member?.member_type || '';
  const membershipStatus = profileData?.member?.membership_status || '';

  const copyReferralLink = () => {
    if (userEmail) {
      const link = `${window.location.origin}/hub/signup?ref=${encodeURIComponent(userEmail)}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied",
        description: "Your referral link has been copied to clipboard",
      });
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("supabase.auth.token");
      await fetch("/api/hub/auth/logout", { method: "POST" });
      setLocation("/hub");
    } catch {
      localStorage.removeItem("supabase.auth.token");
      setLocation("/hub");
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (profileError || !profileData?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Please log in to access your dashboard.</p>
            <Link href="/hub/login">
              <Button data-testid="button-go-login">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invitees = collaborationData?.invitees || [];
  const invitor = collaborationData?.invitor || null;
  const earnings = earningsData?.earnings || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/hub">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">LB</span>
                </div>
                <span className="font-semibold text-lg">Lambsbook Hub</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" data-testid="text-member-name">{memberName}</p>
              <p className="text-xs text-muted-foreground" data-testid="text-member-email">{userEmail}</p>
            </div>
            {profileData?.user?.is_super_admin && (
              <Link href="/hub/admin/governance">
                <Button variant="ghost" size="icon" data-testid="button-governance">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">Welcome back, {memberName}!</h1>
          <div className="flex flex-wrap gap-2">
            {memberType && (
              <Badge variant="secondary" data-testid="badge-member-type">
                {memberType}
              </Badge>
            )}
            {membershipStatus && (
              <Badge variant="secondary" data-testid="badge-membership-status">
                {membershipStatus}
              </Badge>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {financialLoading ? (
            <>
              <Card data-testid="card-net-balance">
                <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold animate-pulse text-muted-foreground">...</div>
                </CardContent>
              </Card>
              <Card data-testid="card-total-credits">
                <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold animate-pulse text-muted-foreground">...</div>
                </CardContent>
              </Card>
              <Card data-testid="card-total-debits">
                <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold animate-pulse text-muted-foreground">...</div>
                </CardContent>
              </Card>
            </>
          ) : financialData?.summary ? (
            <>
              <Card data-testid="card-net-balance">
                <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-net-balance">
                    ${financialData.summary.net_balance.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Credits minus debits</p>
                </CardContent>
              </Card>
              <Card data-testid="card-total-credits">
                <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-credits">
                    ${financialData.summary.total_credits.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">All earnings received</p>
                </CardContent>
              </Card>
              <Card data-testid="card-total-debits">
                <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-debits">
                    ${financialData.summary.total_debits.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">All payments made</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="sm:col-span-3" data-testid="card-no-financial-data">
              <CardContent className="py-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No financial data found.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Your Collaborations Section */}
        <Card className="mb-6" data-testid="card-collaborations">
          <CardHeader>
            <CardTitle className="text-lg">Your Collaborations</CardTitle>
            <CardDescription>
              Long-term collaboration relationships within Lambsbook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitor ? (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Invitor</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invitor.id}</p>
                    <p className="text-sm text-muted-foreground">{invitor.member_type}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You have no invitor. You can still invite existing members who do not yet have an invitor to collaborate with you.
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Your Collaborators ({invitees.length})</p>
              {invitees.length > 0 ? (
                <div className="space-y-2">
                  {invitees.slice(0, 3).map((item, idx) => (
                    <div key={item.invitee?.id || idx} className="flex items-center justify-between p-2 border rounded-lg" data-testid={`invitee-${item.invitee?.id || idx}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.invitee?.id}</p>
                          <p className="text-xs text-muted-foreground">{item.invitee?.member_type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You have no collaborators yet. Collaborators are members you invite to work together inside Lambsbook.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Referral Links Section */}
        <Card className="mb-8" data-testid="card-referral-links">
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Links</CardTitle>
            <CardDescription>
              Share referral links to earn when products, programs, or services are purchased
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-muted rounded-md px-4 py-2 font-mono text-sm truncate" data-testid="text-referral-link">
                {`${window.location.origin}/hub/signup?ref=${encodeURIComponent(userEmail)}`}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyReferralLink} data-testid="button-copy-link">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> Referrals do not change collaboration relationships. 
              Earnings are triggered only when a purchase occurs through your link.
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Home className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="earnings" data-testid="tab-earnings">
              <TrendingUp className="h-4 w-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="collaborations" data-testid="tab-collaborations">
              <Users className="h-4 w-4 mr-2" />
              Collaborations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  {earnings.length > 0 ? (
                    <div className="space-y-3">
                      {earnings.slice(0, 5).map((earning) => (
                        <div key={earning.id} className="flex items-center justify-between" data-testid={`earning-${earning.id}`}>
                          <div>
                            <p className="font-medium">{earning.program?.name || 'Unknown program'}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {earning.program?.sbu || ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${Number(earning.amount).toFixed(2)}</p>
                            <Badge variant={earning.earning_status === "paid" ? "default" : "secondary"}>
                              {earning.earning_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No earnings yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Collaborators</CardTitle>
                </CardHeader>
                <CardContent>
                  {invitees.length > 0 ? (
                    <div className="space-y-3">
                      {invitees.slice(0, 5).map((item, idx) => (
                        <div key={item.invitee?.id || idx} className="flex items-center justify-between" data-testid={`collab-${item.invitee?.id || idx}`}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{item.invitee?.id}</p>
                              <p className="text-sm text-muted-foreground">{item.invitee?.member_type}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No collaborators yet. Collaborations are long-term relationships separate from referrals.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Referral Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Share referral links to earn when purchases occur. Referrals do not change collaboration relationships.
                </p>
                <Button variant="outline" size="sm" onClick={copyReferralLink} data-testid="button-copy-referral-overview">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Referral Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>All your earnings from purchases through your referral links</CardDescription>
              </CardHeader>
              <CardContent>
                {earningsData?.hidden ? (
                  <div className="text-center py-6">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">{earningsData.message || 'Earnings are hidden.'}</p>
                  </div>
                ) : earnings.length > 0 ? (
                  <div className="space-y-3">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`earning-row-${earning.id}`}>
                        <div>
                          <p className="font-medium">{earning.program?.name || 'Unknown program'}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {earning.program?.sbu || ''} {earning.created_at ? `\u2022 ${new Date(earning.created_at).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <p className="font-medium">${Number(earning.amount).toFixed(2)}</p>
                          {earning.earning_status === "paid" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No earnings yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborations">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Invitor</CardTitle>
                  <CardDescription>The member who invited you to collaborate</CardDescription>
                </CardHeader>
                <CardContent>
                  {invitor ? (
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{invitor.id}</p>
                        <p className="text-sm text-muted-foreground">{invitor.member_type}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      You have no invitor. Your collaboration relationships are independent of your referral activity.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About Collaborations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Collaboration is a long-term relationship between members within Lambsbook.</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Each member can have only one invitor</li>
                      <li>You can invite multiple members to collaborate</li>
                      <li>Collaboration creates passive earning relationships</li>
                      <li>Referrals do not change collaboration relationships</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Collaborators</CardTitle>
                <CardDescription>Members you have invited to collaborate with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitees.length > 0 ? (
                    invitees.map((item, idx) => (
                      <div key={item.invitee?.id || idx} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`collab-row-${item.invitee?.id || idx}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{item.invitee?.id}</p>
                            <p className="text-sm text-muted-foreground">{item.invitee?.member_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">{item.status}</Badge>
                          {item.created_at && (
                            <p className="text-xs text-muted-foreground">Since {new Date(item.created_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground mb-2">You have no collaborators yet.</p>
                      <p className="text-sm text-muted-foreground">
                        Invite existing members who do not yet have an invitor to collaborate with you.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
