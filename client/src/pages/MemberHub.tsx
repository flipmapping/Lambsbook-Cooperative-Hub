import { useState, useEffect, useRef, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  User, CreditCard, Users, BookOpen, DollarSign,
  GraduationCap, Activity, AlertTriangle, CheckCircle,
  ArrowUpCircle, Clock, Eye, EyeOff, RefreshCw, Camera, QrCode, Trash2
} from "lucide-react";
import HubAdminDashboard from "@/pages/HubAdminDashboard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import { dashboardT } from "@/lib/dashboardI18n";

type MembershipStatus = "free" | "paid";
type ActivityStatus = "active" | "inactive";
type TutorStatus = "unverified" | "verified" | "partner_educator";
type EarningStatus = "pending" | "paid" | "paused";

type MessengerPlatform =
  | "WhatsApp" | "Zalo" | "LINE" | "WeChat" | "Telegram"
  | "Signal" | "KakaoTalk" | "Facebook Messenger" | "Other";

const MESSENGER_PLATFORMS: MessengerPlatform[] = [
  "WhatsApp", "Zalo", "LINE", "WeChat", "Telegram",
  "Signal", "KakaoTalk", "Facebook Messenger", "Other",
];

interface ContactMethod {
  id: string;
  platform: MessengerPlatform;
  handle: string;
}

interface PersistedProfilePreferences {
  visibility: "private" | "public";
  contactMethods: ContactMethod[];
  avatarDataUrl: string | null;
}

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
  const { language } = useLanguage();
  const dt = (key: string) => dashboardT(language, key);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [invitationNote, setInvitationNote] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [invitationShareMessage, setInvitationShareMessage] = useState("");
  const [invitationLanguage, setInvitationLanguage] = useState<"en" | "vi" | "zh">("en");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileVisibility, setProfileVisibility] =
    useState<"private" | "public">("private");
  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false);
  const [contactMethods, setContactMethods] =
    useState<ContactMethod[]>([]);
  const [newContactPlatform, setNewContactPlatform] =
    useState<MessengerPlatform>("WhatsApp");
  const [newContactHandle, setNewContactHandle] = useState("");
  const [profileHydratedForUser, setProfileHydratedForUser] =
    useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  // Avatar remains browser-local; no profile-preference API is called.
  const handleAvatarUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Unsupported file",
          description: "Please select an image file.",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image under 2 MB.",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string" &&
            reader.result.startsWith("data:image/")) {
          setAvatarDataUrl(reader.result);
        }
      };
      reader.onerror = () => {
        toast({
          title: "Image could not be read",
          description: "Please try selecting the image again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [toast],
  );


  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/member/me"],
    queryFn: () => fetchWithAuth("/api/member/me"),
    enabled: isAuthenticated,
  });

  // Local-only profile preferences. No unverified backend endpoint is called.
  useEffect(() => {
    const userId = profile?.user?.id;
    if (!userId || profileHydratedForUser === userId) return;

    let stored: Partial<PersistedProfilePreferences> = {};
    try {
      const raw = localStorage.getItem(`lambsbook.profile.${userId}`);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // Invalid or unavailable local storage falls back to safe defaults.
    }

    setProfileVisibility(stored.visibility === "public" ? "public" : "private");
    setAvatarDataUrl(
      typeof stored.avatarDataUrl === "string" &&
      stored.avatarDataUrl.startsWith("data:image/")
        ? stored.avatarDataUrl
        : null
    );
    setContactMethods(
      Array.isArray(stored.contactMethods)
        ? stored.contactMethods.filter(
            (item): item is ContactMethod =>
              !!item &&
              typeof item.id === "string" &&
              MESSENGER_PLATFORMS.includes(item.platform) &&
              typeof item.handle === "string"
          ).slice(0, 2)
        : []
    );
    setProfileHydratedForUser(userId);
  }, [profile?.user?.id, profileHydratedForUser]);

  useEffect(() => {
    const userId = profile?.user?.id;
    if (!userId || profileHydratedForUser !== userId) return;

    try {
      const preferences: PersistedProfilePreferences = {
        visibility: profileVisibility,
        contactMethods,
        avatarDataUrl,
      };
      localStorage.setItem(
        `lambsbook.profile.${userId}`,
        JSON.stringify(preferences)
      );
    } catch {
      toast({
        title: "Profile preferences not saved",
        description: "Browser storage is unavailable. Your changes may not persist.",
        variant: "destructive",
      });
    }
  }, [
    profile?.user?.id,
    profileHydratedForUser,
    profileVisibility,
    contactMethods,
    avatarDataUrl,
    toast,
  ]);

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

  const { data: sentInvitationsData, isLoading: sentInvitationsLoading } = useQuery<any>({
    queryKey: ["/api/member/sent-invitations"],
    queryFn: () => fetchWithAuth("/api/member/sent-invitations"),
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
        invitedEmail,
        note: invitationNote.trim() || undefined
      }),
    onSuccess: (data: any) => {
      const returnedUrl = data?.inviteUrl;

      let validInviteUrl = false;
      try {
        const parsed = new URL(returnedUrl);
        validInviteUrl =
          ["https:", "http:"].includes(parsed.protocol) &&
          Boolean(parsed.hostname);
      } catch {
        validInviteUrl = false;
      }

      if (!validInviteUrl) {
        setInviteLink("");
        toast({
          title: "Invitation link unavailable",
          description: "The server did not return a valid invitation link. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setInviteLink(returnedUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/member/sent-invitations"] });
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

  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const token = getAuthToken();
      const response = await fetch(`/api/member/invitations/${encodeURIComponent(invitationId)}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!response.ok) {
        let message = "Failed to delete invitation";
        try {
          const body = await response.json();
          message = body?.error?.message || message;
        } catch {}
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/sent-invitations"] });
      toast({ title: "Invitation deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
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
        <div className="flex justify-end mb-4"><LanguageSwitcher /></div>
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
    hasProfile: !!profile,
    memberId: profile?.id ?? null,
    userId: profile?.user_id ?? null,
    role: profile?.role ?? null,
    isSuperAdmin: profile?.is_super_admin ?? null,
    profile,
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

  if (profile?.is_super_admin || profile?.role === "admin") {
    return <HubAdminDashboard />;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{dt("member.dashboard")}</h1>
          <p className="text-muted-foreground">
            {profile?.user?.email || dt("member.memberAccount")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <Badge
          variant={profile?.member?.membership_status === "paid" ? "default" : "secondary"}
          className="text-sm"
        >
          {profile?.member?.membership_status === "paid" ? dt("member.paidTier") : dt("member.freeTier")}
          </Badge>
        </div>
      </div>

      {activity?.warning && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-inactivity-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{dt("member.inactivityWarning")}</AlertTitle>
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
          <AlertTitle>{dt("member.accountInactive")}</AlertTitle>
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
        <TabsList className="grid grid-cols-7 w-full" data-testid="tabs-member">
          <TabsTrigger value="overview" data-testid="tab-overview">{dt("member.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">{dt("member.tabs.profile")}</TabsTrigger>
          <TabsTrigger value="membership" data-testid="tab-membership">{dt("member.tabs.membership")}</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">{dt("member.tabs.earnings")}</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">{dt("member.tabs.invitations")}</TabsTrigger>
          <TabsTrigger value="relationships" data-testid="tab-relationships">{dt("member.tabs.relationships")}</TabsTrigger>
          <TabsTrigger value="workspace" data-testid="tab-workspace">{dt("member.tabs.workspace")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6" data-testid="tab-content-profile">
          <Card data-testid="card-member-identity">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0" data-testid="profile-image-container">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-muted bg-muted flex items-center justify-center">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt={dt("member.profileAvatarAlt")}
                        className="h-full w-full object-cover"
                        data-testid="img-avatar"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label={dt("member.chooseProfileImage")}
                    onChange={handleAvatarUpload}
                    data-testid="input-avatar-file"
                  />
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary"
                    aria-label={dt("member.uploadProfileImage")}
                    data-testid="button-upload-avatar"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">
                    {profile?.user?.email ?? dt("member.memberAccount")}
                  </CardTitle>
                  <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={profile?.member?.membership_status === "paid" ? "default" : "secondary"}
                      className="text-xs"
                      data-testid="badge-membership-status"
                    >
                      {profile?.member?.membership_status === "paid" ? dt("member.paidTier") : dt("member.freeTier")}
                    </Badge>
                    <Badge
                      variant={activity?.activity_status === "active" ? "outline" : "secondary"}
                      className="text-xs"
                      data-testid="badge-activity-status"
                    >
                      {activity?.activity_status ?? "Active"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="mb-1 text-xs text-muted-foreground">{dt("member.memberId")}</div>
                  <div className="truncate font-mono text-xs" data-testid="text-member-id">
                    {profile?.member?.id ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="mb-1 text-xs text-muted-foreground">{dt("member.memberType")}</div>
                  <div className="text-sm capitalize" data-testid="text-member-type">
                    {profile?.member?.member_type ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="mb-1 text-xs text-muted-foreground">{dt("member.joinDate")}</div>
                  <div className="text-sm" data-testid="text-join-date">
                    {profile?.member?.join_date
                      ? new Date(profile.member.join_date).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="mb-1 text-xs text-muted-foreground">{dt("member.lastActive")}</div>
                  <div className="text-sm" data-testid="text-last-active">
                    {activity?.last_activity_at
                      ? new Date(activity.last_activity_at).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {dt("member.avatarLocalOnly")}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-profile-visibility">
            <CardHeader>
              <CardTitle>{dt("member.profileVisibility")}</CardTitle>
              <CardDescription>
                {dt("member.visibilityLocalOnly")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={profileVisibility === "private" ? "default" : "outline"}
                aria-pressed={profileVisibility === "private"}
                data-testid="button-visibility-private"
                onClick={() => setProfileVisibility("private")}
              >
                {dt("member.private")}
              </Button>
              <Button
                type="button"
                variant={profileVisibility === "public" ? "default" : "outline"}
                aria-pressed={profileVisibility === "public"}
                data-testid="button-visibility-public"
                onClick={() => setProfileVisibility("public")}
              >
                {dt("member.public")}
              </Button>
              {profileVisibility === "public" && (
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-preview-public-profile"
                  onClick={() => setProfilePreviewOpen(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {dt("member.previewProfile")}
                </Button>
              )}
            </CardContent>
          </Card>

          <Dialog
            open={profilePreviewOpen}
            onOpenChange={setProfilePreviewOpen}
          >
            <DialogContent data-testid="dialog-public-profile-preview">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {dt("member.publicProfilePreview")}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt={dt("member.profileAvatarAlt")}
                        className="h-full w-full object-cover"
                        data-testid="img-preview-avatar"
                      />
                    ) : (
                      <User className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="break-all font-semibold">
                      {profile?.user?.email ?? dt("member.memberAccount")}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {profile?.member?.member_type ?? dt("member.memberAccount")}
                    </p>
                  </div>
                </div>

                {contactMethods.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {dt("member.preferredContactPlatforms")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {contactMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex flex-col items-center"
                          data-testid={`preview-contact-${method.id}`}
                        >
                          <div
                            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20"
                            aria-label={`QR code placeholder for ${method.platform}`}
                          >
                            <QrCode className="mb-1 h-5 w-5 text-muted-foreground" />
                            <span className="px-1 text-center text-[10px] leading-tight">
                              {method.platform}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dt("member.qrPlaceholderNote")}
                    </p>
                  </div>
                )}

                <p className="border-t pt-3 text-xs text-muted-foreground">
                  {dt("member.localProfilePreviewNote")}
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Card data-testid="card-preferred-contact-methods">
            <CardHeader>
              <CardTitle>{dt("member.preferredContactMethods")}</CardTitle>
              <CardDescription>
                {dt("member.contactMethodsStorageNote")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {dt("member.noContactMethods")}
                </p>
              )}

              {contactMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
                  data-testid={`contact-method-${method.id}`}
                >
                  <div
                    className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20"
                    aria-label={`QR code placeholder for ${method.platform}`}
                    data-testid={`qr-placeholder-${method.id}`}
                  >
                    <QrCode className="mb-1 h-5 w-5 text-muted-foreground" />
                    <span className="px-1 text-center text-[10px] leading-tight">
                      {method.platform}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{method.platform}</p>
                    <p className="break-all text-sm text-muted-foreground">
                      {method.handle}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Remove ${method.platform} contact method`}
                    onClick={() =>
                      setContactMethods((previous) =>
                        previous.filter((item) => item.id !== method.id)
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}

              {contactMethods.length < 2 && (
                <div className="space-y-3 rounded-lg border p-4">
                  <label className="block space-y-1 text-sm">
                    <span>{dt("member.platform")}</span>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2"
                      value={newContactPlatform}
                      onChange={(event) =>
                        setNewContactPlatform(event.target.value as MessengerPlatform)
                      }
                      data-testid="select-contact-platform"
                    >
                      {MESSENGER_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span>{dt("member.contactDetail")}</span>
                    <Input
                      value={newContactHandle}
                      onChange={(event) => setNewContactHandle(event.target.value)}
                      placeholder={`Your ${newContactPlatform} handle`}
                      data-testid="input-contact-handle"
                    />
                  </label>
                  <Button
                    type="button"
                    disabled={!newContactHandle.trim()}
                    data-testid="button-add-contact-method"
                    onClick={() => {
                      const handle = newContactHandle.trim();
                      if (!handle || contactMethods.length >= 2) return;
                      setContactMethods((previous) => [
                        ...previous,
                        {
                          id: `cm-${Date.now()}`,
                          platform: newContactPlatform,
                          handle,
                        },
                      ]);
                      setNewContactHandle("");
                    }}
                  >
                    Add Contact Method
                  </Button>
                </div>
              )}

              {contactMethods.length >= 2 && (
                <p className="text-sm text-muted-foreground">
                  Maximum of two contact methods reached.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="stat-card-membership">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">{dt("member.membership")}</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{dt(profile?.member?.membership_status === "paid" ? "member.paidTier" : "member.freeTier")}</div>
                <p className="text-xs text-muted-foreground">
                  {profile?.member?.membership_status === "paid" ? dt("member.unlimitedProgramAccess") : dt("member.twoPrograms")}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-card-activity">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">{dt("member.activityStatus")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{dt(activity?.activity_status === "inactive" ? "member.inactive" : "member.active")}</div>
                <p className="text-xs text-muted-foreground">
                  {dt("member.lastActive")}: {activity?.last_activity_at ? new Date(activity.last_activity_at).toLocaleDateString() : dt("member.recently")}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2" data-testid="card-recent-participation">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{dt("member.recentParticipation")}</CardTitle>

                  <div className="text-[10px] px-2 py-1 rounded-full border text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? dt("member.participationActive")
                      : dt("member.participationPending")}
                  </div>
                </div>
                <CardDescription>
                  {dt("member.participationDescription")}
                </CardDescription>

                <div className="px-6 pb-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? dt("member.participationContinuityActive")
                      : dt("member.participationContinuityPending")}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? dt("member.participationHistoryGrowing")
                      : dt("member.participationSummaryPending")}
                  </div>

                  <div className="pt-2">
                    <button
                      className="text-xs border rounded-md px-3 py-1 hover:bg-muted transition-colors"
                      type="button"
                    >
                      {dt("member.continueParticipation")}
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
                              ? dt("member.manualCheckIn")
                              : log.activity_type.replaceAll("_", " ")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dt("member.participationActivity")}
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

                            if (diffDays <= 0) return dt("member.today");
                            if (diffDays === 1) return dt("member.yesterday");
                            if (diffDays < 7) return dt("member.daysAgo").replace("{days}", String(diffDays));

                            return created.toLocaleDateString();
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {dt("member.noRecentParticipation")}
                  </div>
                )}
              </CardContent>
            </Card>          </div>

          {profile?.member?.membership_status === "free" && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5" data-testid="card-upgrade-cta">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  {dt("member.upgradePaidMembership")}
                </CardTitle>
                <CardDescription>{dt("member.unlockEarnings")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {dt("member.earnAllPrograms")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {dt("member.noProgramLimits")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {dt("member.prioritySupport")}
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button data-testid="button-upgrade">{dt("member.upgradeNow")}</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dt("member.membershipOverview")}</CardTitle>
              <CardDescription>{dt("member.membershipDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{dt("member.currentStatus")}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile?.member?.membership_status === "paid"
                      ? dt("member.fullProgramAccess")
                      : dt("member.freeTier")}
                  </div>
                </div>
                <Badge variant={profile?.member?.membership_status === "paid" ? "default" : "secondary"} className="text-lg px-4 py-2">
                  {profile?.member?.membership_status === "paid" ? "PAID" : "FREE"}
                </Badge>
              </div>



              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className={profile?.member?.membership_status === "free" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dt("member.freeTier")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {dt("member.accessByMembership")}
                    </p>
                  </CardContent>
                </Card>
                <Card className={profile?.member?.membership_status === "paid" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dt("member.paidTier")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {dt("member.paidFullAccess")}
                    </p>
                    <div className="mt-4">
                      <Badge>{dt("member.unlimitedPrograms")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dt("member.earningsTitle")}</CardTitle>
              <CardDescription>
                {dt("member.earningsDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!earnings?.length ? (
                <div className="text-sm text-muted-foreground">
                  {dt("member.noEarningsYet")}
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
                          {dt("member.earningStatus")}: {earning.earning_status}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {dt("member.earningPeriod")}: {earning.period}
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
              <CardTitle>{dt("member.invitationsTitle")}</CardTitle>
              <CardDescription>
                {dt("member.invitationsDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent>

              <Button
                className="mb-4"
                onClick={() => setInviteModalOpen(true)}
              >
                {dt("member.generateInvitation")}
              </Button>

              {!invitationData?.has_pending_invitation ? (
                <div className="text-sm text-muted-foreground">
                  {dt("member.noPendingInvitation")}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">
                      {dt("member.invitationFound")}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {dt("member.invitationDetails")}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {dt("member.invitationStatus")}: {invitationData?.invitation?.status}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {dt("member.created")}: {invitationData?.invitation?.created_at}
                    </div>

                    <Button
                      className="mt-3"
                      onClick={() => acceptInvitationMutation.mutate()}
                      disabled={acceptInvitationMutation.isPending}
                    >
                      {dt("member.acceptInvitation")}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <h3 className="font-medium">{dt("member.sentInvitations")}</h3>

                {sentInvitationsLoading ? (
                  <div className="text-sm text-muted-foreground">{dt("member.loadingInvitations")}</div>
                ) : !sentInvitationsData?.invitations?.length ? (
                  <div className="text-sm text-muted-foreground">{dt("member.noInvitations")}</div>
                ) : (
                  sentInvitationsData.invitations.map((invitation: any) => (
                    <div key={invitation.id} className="rounded-lg border p-3 space-y-1">
                      <div className="font-medium">
                        {invitation.invited_email || dt("member.inviteeNotSpecified")}
                      </div>
                      <div className="text-sm">{dt("member.invitationStatus")}: {invitation.status}</div>
                      {invitation.note ? (
                        <div className="text-sm text-muted-foreground">
                          {dt("member.message")}: {invitation.note}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        {dt("member.created")}: {invitation.created_at ? new Date(invitation.created_at).toLocaleString() : "—"}
                      </div>
                      {invitation.accepted_at ? (
                        <div className="text-xs text-muted-foreground">
                          {dt("member.accepted")}: {new Date(invitation.accepted_at).toLocaleString()}
                        </div>
                      ) : null}
                      {invitation.expires_at ? (
                        <div className="text-xs text-muted-foreground">
                          {dt("member.expires")}: {new Date(invitation.expires_at).toLocaleString()}
                        </div>
                      ) : null}
                      {(invitation.status === "pending" || invitation.status == null) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteInvitationMutation.isPending}
                          onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                          data-testid={`button-delete-invitation-${invitation.id}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {dt("member.deleteInvitation")}
                        </Button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

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
                      placeholder={dt("member.inviteeEmail")}
                    />

                    <Textarea
                      value={invitationNote}
                      onChange={(e) => setInvitationNote(e.target.value)}
                      placeholder={dt("member.optionalPersonalMessage")}
                      rows={3}
                    />

                    <Button
                      onClick={() => createInvitationMutation.mutate()}
                      disabled={createInvitationMutation.isPending}
                    >
                      {dt("member.createInvitation")}
                    </Button>

                    {inviteLink && (
                      <div className="space-y-2">
                        <div className="text-xs">
                          {dt("member.inviteLink")}
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
                          {dt("member.copyLink")}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              const result: any = await postWithAuth("/api/member/invitations/share", {
                                invitationLink: inviteLink,
                                language: invitationLanguage,
                              });
                              if (typeof result?.message !== "string") {
                                throw new Error("The invitation message was not returned.");
                              }
                              setInvitationShareMessage(result.message);
                              toast({ title: "Invitation message ready to personalize" });
                            } catch (error) {
                              toast({
                                title: "Share message failed",
                                description: error instanceof Error ? error.message : "Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid="button-share-invitation-message"
                        >
                          {dt("member.shareInvitationMessage")}
                        </Button>
                        <label className="block text-sm font-medium" htmlFor="invitation-language">
                          {dt("member.messageLanguage")}
                        </label>
                        <select
                          id="invitation-language"
                          className="block w-full min-h-11 rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label={dt("member.selectInvitationMessageLanguage")}
                          value={invitationLanguage}
                          onChange={(event) => setInvitationLanguage(event.target.value as "en" | "vi" | "zh")}
                        >
                          <option value="en">English</option>
                          <option value="vi">Tiếng Việt</option>
                          <option value="zh">中文</option>
                        </select>
                        {invitationShareMessage ? (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium" htmlFor="invitation-share-message">
                              {dt("member.invitationMessage")}
                            </label>
                            <Textarea
                              id="invitation-share-message"
                              value={invitationShareMessage}
                              onChange={(event) => setInvitationShareMessage(event.target.value)}
                              rows={7}
                              data-testid="textarea-invitation-share-message"
                            />
                            <Button
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(invitationShareMessage);
                                  toast({ title: "Invitation message copied to clipboard" });
                                } catch {
                                  toast({
                                    title: "Copy failed",
                                    description: "Please try again.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              data-testid="button-copy-personalized-invitation-message"
                            >
                              {dt("member.copyInvitationMessage")}
                            </Button>
                          </div>
                        ) : null}
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
                  {relationshipsData?.invitor?.id
                    ? `Member ID: ${relationshipsData.invitor.id}`
                    : "No invitor recorded"}
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
                        {invitee.id ? `Member ID: ${invitee.id}` : "Member ID unavailable"}
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
