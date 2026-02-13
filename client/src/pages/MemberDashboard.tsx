import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, DollarSign, Users, Gift, Copy, ExternalLink, 
  TrendingUp, Clock, CheckCircle2, LogOut, User, Settings, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinancialSummary {
  net_balance: number;
  total_credits: number;
  total_debits: number;
}

interface MemberData {
  id: string;
  email: string;
  full_name: string;
  referral_code: string;
  roles: string[];
  total_earnings: number;
  pending_earnings: number;
  referral_count: number;
  programs_enrolled: number;
}

interface Earning {
  id: string;
  amount: number;
  currency: string;
  program_name: string;
  type: string;
  status: string;
  created_at: string;
}

interface Invitee {
  id: string;
  name: string;
  email: string;
  status: string;
  joined_at: string;
}

interface Invitor {
  id: string;
  name: string;
  email: string;
}


export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: financialData, isLoading: financialLoading, error: financialError } = useQuery<{ summary: FinancialSummary | null }>({
    queryKey: ['/api/member/financial-summary'],
  });

  const { data: member, isLoading: memberLoading } = useQuery<MemberData>({
    queryKey: ["/api/hub/member/me"],
  });

  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earning[]>({
    queryKey: ["/api/hub/member/earnings"],
  });

  const { data: invitees = [], isLoading: inviteesLoading } = useQuery<Invitee[]>({
    queryKey: ["/api/hub/member/invitees"],
  });

  const { data: invitor } = useQuery<Invitor | null>({
    queryKey: ["/api/hub/member/invitor"],
  });

  const copyReferralLink = () => {
    if (mockMember?.email) {
      const link = `${window.location.origin}/hub/signup?ref=${encodeURIComponent(mockMember.email)}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied",
        description: "Your referral link has been copied to clipboard",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/hub/auth/logout", { method: "POST" });
      setLocation("/hub");
    } catch {
      setLocation("/hub");
    }
  };

  // Mock data for demonstration when API isn't connected
  const mockMember: MemberData = member || {
    id: "demo",
    email: "demo@example.com",
    full_name: "Demo User",
    referral_code: "DEMO123",
    roles: ["user", "collaborator"],
    total_earnings: 1250.00,
    pending_earnings: 350.00,
    referral_count: 8,
    programs_enrolled: 3,
  };

  const mockEarnings: Earning[] = earnings.length ? earnings : [
    { id: "1", amount: 150, currency: "USD", program_name: "Tropicana English", type: "tier1_referral", status: "paid", created_at: "2025-12-15" },
    { id: "2", amount: 75, currency: "USD", program_name: "CTBC Course", type: "tier2_referral", status: "paid", created_at: "2025-12-10" },
    { id: "3", amount: 200, currency: "USD", program_name: "EB-3 Visa Service", type: "tier1_referral", status: "pending", created_at: "2025-12-18" },
  ];

  const mockInvitees: Invitee[] = invitees.length ? invitees : [
    { id: "1", name: "John Smith", email: "j***@example.com", status: "active", joined_at: "2025-11-20" },
    { id: "2", name: "Maria Garcia", email: "m***@example.com", status: "active", joined_at: "2025-11-25" },
  ];

  const mockInvitor: Invitor | null = invitor || null;

  if (memberLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <p className="text-sm font-medium">{mockMember.full_name}</p>
              <p className="text-xs text-muted-foreground">{mockMember.email}</p>
            </div>
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
        {/* Welcome & Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {mockMember.full_name.split(" ")[0]}!</h1>
          <div className="flex flex-wrap gap-2">
            {mockMember.roles.map((role) => (
              <Badge key={role} variant="secondary" data-testid={`badge-role-${role}`}>
                {role}
              </Badge>
            ))}
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
          ) : financialError || (financialData && !financialData.summary) ? (
            <Card className="sm:col-span-3" data-testid="card-no-financial-data">
              <CardContent className="py-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No financial data found.</p>
              </CardContent>
            </Card>
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
          ) : null}
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
            {/* Invitor Info */}
            {mockInvitor ? (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Invitor</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{mockInvitor.name}</p>
                    <p className="text-sm text-muted-foreground">{mockInvitor.email}</p>
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

            {/* Invitees List */}
            <div>
              <p className="text-sm font-medium mb-2">Your Collaborators ({mockInvitees.length})</p>
              {mockInvitees.length > 0 ? (
                <div className="space-y-2">
                  {mockInvitees.slice(0, 3).map((invitee) => (
                    <div key={invitee.id} className="flex items-center justify-between p-2 border rounded-lg" data-testid={`invitee-${invitee.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{invitee.name}</p>
                          <p className="text-xs text-muted-foreground">{invitee.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{invitee.status}</Badge>
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
              <div className="flex-1 bg-muted rounded-md px-4 py-2 font-mono text-sm truncate">
                {`${window.location.origin}/hub/signup?ref=${encodeURIComponent(mockMember.email)}`}
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
              {/* Recent Earnings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockEarnings.slice(0, 5).map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between" data-testid={`earning-${earning.id}`}>
                        <div>
                          <p className="font-medium">{earning.program_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {earning.type.replace("_", " ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${earning.amount.toFixed(2)}</p>
                          <Badge variant={earning.status === "paid" ? "default" : "secondary"}>
                            {earning.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Collaborators */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Collaborators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockInvitees.length > 0 ? (
                      mockInvitees.slice(0, 5).map((invitee) => (
                        <div key={invitee.id} className="flex items-center justify-between" data-testid={`collab-${invitee.id}`}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{invitee.name}</p>
                              <p className="text-sm text-muted-foreground">{invitee.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{invitee.status}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No collaborators yet. Collaborations are long-term relationships separate from referrals.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Links Quick Reference */}
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
                <div className="space-y-3">
                  {mockEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`earning-row-${earning.id}`}>
                      <div>
                        <p className="font-medium">{earning.program_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {earning.type.replace("_", " ")} • {earning.created_at}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="font-medium">${earning.amount.toFixed(2)}</p>
                        {earning.status === "paid" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborations">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Your Invitor */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Invitor</CardTitle>
                  <CardDescription>The member who invited you to collaborate</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockInvitor ? (
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{mockInvitor.name}</p>
                        <p className="text-sm text-muted-foreground">{mockInvitor.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      You have no invitor. Your collaboration relationships are independent of your referral activity.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Collaboration Info */}
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

            {/* All Collaborators */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Collaborators</CardTitle>
                <CardDescription>Members you have invited to collaborate with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInvitees.length > 0 ? (
                    mockInvitees.map((invitee) => (
                      <div key={invitee.id} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`collab-row-${invitee.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{invitee.name}</p>
                            <p className="text-sm text-muted-foreground">{invitee.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">{invitee.status}</Badge>
                          <p className="text-xs text-muted-foreground">Joined {invitee.joined_at}</p>
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
