import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, DollarSign, Users, Gift, Copy, ExternalLink, 
  TrendingUp, Clock, CheckCircle2, LogOut, User, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface Referral {
  id: string;
  name: string;
  email: string;
  tier: number;
  status: string;
  joined_at: string;
}

export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch member data
  const { data: member, isLoading: memberLoading } = useQuery<MemberData>({
    queryKey: ["/api/hub/member/me"],
  });

  // Fetch earnings
  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earning[]>({
    queryKey: ["/api/hub/member/earnings"],
  });

  // Fetch referrals
  const { data: referrals = [], isLoading: referralsLoading } = useQuery<Referral[]>({
    queryKey: ["/api/hub/member/referrals"],
  });

  const copyReferralLink = () => {
    if (member?.referral_code) {
      const link = `${window.location.origin}/hub/signup?ref=${member.referral_code}`;
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

  const mockReferrals: Referral[] = referrals.length ? referrals : [
    { id: "1", name: "John Smith", email: "j***@example.com", tier: 1, status: "active", joined_at: "2025-11-20" },
    { id: "2", name: "Maria Garcia", email: "m***@example.com", tier: 1, status: "active", joined_at: "2025-11-25" },
    { id: "3", name: "David Lee", email: "d***@example.com", tier: 2, status: "active", joined_at: "2025-12-01" },
  ];

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

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-total-earnings">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockMember.total_earnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-earnings">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockMember.pending_earnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Awaiting payout</p>
            </CardContent>
          </Card>

          <Card data-testid="card-referrals">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMember.referral_count}</div>
              <p className="text-xs text-muted-foreground">People you've referred</p>
            </CardContent>
          </Card>

          <Card data-testid="card-programs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Programs</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMember.programs_enrolled}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8" data-testid="card-referral-link">
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Link</CardTitle>
            <CardDescription>Share this link to earn commissions on referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-muted rounded-md px-4 py-2 font-mono text-sm truncate">
                {`${window.location.origin}/hub/signup?ref=${mockMember.referral_code}`}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyReferralLink} data-testid="button-copy-link">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Your code: <span className="font-mono font-medium">{mockMember.referral_code}</span>
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
            <TabsTrigger value="referrals" data-testid="tab-referrals">
              <Users className="h-4 w-4 mr-2" />
              Referrals
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

              {/* Recent Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockReferrals.slice(0, 5).map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between" data-testid={`referral-${referral.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{referral.name}</p>
                            <p className="text-sm text-muted-foreground">{referral.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">Tier {referral.tier}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>All your earnings from referrals and programs</CardDescription>
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

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Network</CardTitle>
                <CardDescription>People who joined through your link</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`referral-row-${referral.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.name}</p>
                          <p className="text-sm text-muted-foreground">{referral.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">Tier {referral.tier}</Badge>
                        <p className="text-xs text-muted-foreground">Joined {referral.joined_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
