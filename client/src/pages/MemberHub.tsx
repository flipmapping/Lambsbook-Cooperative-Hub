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
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  User, CreditCard, Users, BookOpen, DollarSign, 
  GraduationCap, Activity, AlertTriangle, CheckCircle,
  ArrowUpCircle, Clock, Eye, EyeOff, RefreshCw,
  Lock, Shield, Camera, Plus, Trash2, QrCode, Phone
} from "lucide-react";
import HubAdminDashboard from "@/pages/HubAdminDashboard";

type MembershipStatus = "free" | "paid";
type ActivityStatus = "active" | "inactive";
type TutorStatus = "unverified" | "verified" | "partner_educator";
type EarningStatus = "pending" | "paid" | "paused";

// ── APP-MEX-001A: Preferred Contact Method types ──────────────────────────────

type MessengerPlatform =
  | "WhatsApp"
  | "Zalo"
  | "LINE"
  | "WeChat"
  | "Telegram"
  | "Signal"
  | "KakaoTalk"
  | "Facebook Messenger"
  | "Other";

const MESSENGER_PLATFORMS: MessengerPlatform[] = [
  "WhatsApp",
  "Zalo",
  "LINE",
  "WeChat",
  "Telegram",
  "Signal",
  "KakaoTalk",
  "Facebook Messenger",
  "Other",
];

interface ContactMethod {
  id: string;
  platform: MessengerPlatform;
  handle: string;
}

// ── APP-MEX-001A: Invitation relationship type ────────────────────────────────

interface SentInvitation {
  id: string;
  invited_email: string | null;
  created_at: string;
  expires_at: string | null;
  note: string | null;
  status: "pending" | "accepted" | "expired" | string;
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

// ============================================================================
// APP-MEX-001C — Profile Preference Persistence
// ----------------------------------------------------------------------------
// Persists visibility, contact methods, and avatar to localStorage keyed by
// userId. Backend persistence endpoint does not yet exist; this is the
// minimum frontend implementation within the authorized boundary.
// Backend dependency: POST /api/member/profile/preferences (not yet available)
// ============================================================================

const PROFILE_STORE_KEY = (userId: string) =>
  `lambsbook.profile.${userId}`;

interface PersistedProfile {
  visibility: "private" | "public";
  contactMethods: ContactMethod[];
  avatarDataUrl: string | null;
}

function loadPersistedProfile(userId: string): PersistedProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORE_KEY(userId));
    if (!raw) {
      return { visibility: "private", contactMethods: [], avatarDataUrl: null };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedProfile>;
    return {
      visibility: parsed.visibility === "public" ? "public" : "private",
      contactMethods: Array.isArray(parsed.contactMethods)
        ? parsed.contactMethods
        : [],
      avatarDataUrl: typeof parsed.avatarDataUrl === "string"
        ? parsed.avatarDataUrl
        : null,
    };
  } catch {
    return { visibility: "private", contactMethods: [], avatarDataUrl: null };
  }
}

function savePersistedProfile(
  userId: string,
  data: PersistedProfile
): void {
  try {
    localStorage.setItem(PROFILE_STORE_KEY(userId), JSON.stringify(data));
  } catch {
    // Storage unavailable — silently continue. State remains in-memory.
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

async function deleteWithAuth(url: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

// ── APP-MEX-001A: QR code placeholder ────────────────────────────────────────

function QrPlaceholder({ platform, handle }: { platform: MessengerPlatform; handle: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-muted bg-muted/20 shrink-0"
      aria-label={`QR code placeholder for ${platform} ${handle}`}
      data-testid="qr-placeholder"
    >
      <QrCode className="h-6 w-6 text-muted-foreground mb-1" />
      <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
        {platform}
      </span>
    </div>
  );
}

export default function MemberHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  // ── APP-MEX-001A / APP-MEX-001C: Profile state with persistence ──────────
  const [profileVisibility, setProfileVisibility] = useState<"private" | "public">("private");
  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false);
  // Avatar: stored as data URL for session-free persistence
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Track whether persistence has been hydrated for the current user
  const [profileHydrated, setProfileHydrated] = useState(false);

  // ── APP-MEX-001A / APP-MEX-001C: Contact methods state (max 2) ───────────
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [addingContact, setAddingContact] = useState(false);
  const [newContactPlatform, setNewContactPlatform] = useState<MessengerPlatform>("WhatsApp");
  const [newContactHandle, setNewContactHandle] = useState("");

  // ── APP-MEX-001A: Sent invitations state ─────────────────────────────────
  const [deletingInvitationId, setDeletingInvitationId] = useState<string | null>(null);

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

  // ── APP-MEX-001A: Sent invitations query ─────────────────────────────────
  const { data: sentInvitationsData, isLoading: sentInvitationsLoading } = useQuery<any>({
    queryKey: ["/api/member/invitations"],
    queryFn: () => fetchWithAuth("/api/member/invitations"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  // APP-MEX-001C — Hydrate persisted profile preferences once userId is known
  useEffect(() => {
    const userId = profile?.user_id ?? profile?.id ?? null;
    if (!userId || profileHydrated) return;

    const persisted = loadPersistedProfile(String(userId));
    setProfileVisibility(persisted.visibility);
    setContactMethods(persisted.contactMethods);
    setAvatarDataUrl(persisted.avatarDataUrl);
    setProfileHydrated(true);
  }, [profile, profileHydrated]);

  // APP-MEX-001C — Persist profile preferences on every change
  useEffect(() => {
    const userId = profile?.user_id ?? profile?.id ?? null;
    if (!userId || !profileHydrated) return;

    savePersistedProfile(String(userId), {
      visibility: profileVisibility,
      contactMethods,
      avatarDataUrl,
    });
  }, [profile, profileHydrated, profileVisibility, contactMethods, avatarDataUrl]);

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

      queryClient.invalidateQueries({ queryKey: ["/api/member/invitations"] });

      // APP-MEX-001B: Close modal so the newly created invitation is
      // immediately visible in the Sent Invitations list below.
      setInviteModalOpen(false);
      setInvitedEmail("");

      toast({
        title: "Invitation created",
        description: "Your invitation is now visible in Sent Invitations.",
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

  // ── APP-MEX-001A: Delete unaccepted invitation ────────────────────────────
  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId: string) =>
      deleteWithAuth(`/api/member/invitations/${invitationId}`),
    onSuccess: () => {
      setDeletingInvitationId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/member/invitations"] });
      toast({ title: "Invitation deleted" });
    },
    onError: (error: Error) => {
      setDeletingInvitationId(null);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // ── APP-MEX-001A: Contact method handlers ─────────────────────────────────

  // APP-MEX-001C — Avatar upload handler
  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Enforce reasonable size limit (2 MB) to stay within localStorage budget
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image under 2 MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setAvatarDataUrl(result);
        }
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be re-selected if needed
      e.target.value = "";
    },
    [toast]
  );

  function handleAddContact() {
    if (!newContactHandle.trim()) return;
    if (contactMethods.length >= 2) return;
    const next: ContactMethod = {
      id: `cm-${Date.now()}`,
      platform: newContactPlatform,
      handle: newContactHandle.trim(),
    };
    setContactMethods((prev) => [...prev, next]);
    setNewContactHandle("");
    setNewContactPlatform("WhatsApp");
    setAddingContact(false);
  }

  function handleRemoveContact(id: string) {
    setContactMethods((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Sent invitations from query or empty array ────────────────────────────
  const sentInvitations: SentInvitation[] =
    (sentInvitationsData?.invitations ?? sentInvitationsData ?? []) as SentInvitation[];

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
        <TabsList className="grid grid-cols-7 w-full" data-testid="tabs-member">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="membership" data-testid="tab-membership">Membership</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">Invitations</TabsTrigger>
          <TabsTrigger value="relationships" data-testid="tab-relationships">Relationships</TabsTrigger>
          <TabsTrigger value="workspace" data-testid="tab-workspace">Workspace</TabsTrigger>
        </TabsList>

        {/* ================================================================
            PROFILE TAB — APP-MEX-001A
            Consumes authenticated identity only.
            No authentication, role resolution, or routing here.
        ================================================================ */}
        <TabsContent value="profile" className="space-y-4" data-testid="tab-content-profile">

          {/* ── 1. Identity card with Profile Image placeholder ─────────── */}
          <Card data-testid="card-member-identity">
            <CardHeader>
              <div className="flex items-center gap-4">

                {/* Profile image placeholder — APP-MEX-001A */}
                <div className="relative shrink-0" data-testid="profile-image-container">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-muted overflow-hidden">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                        data-testid="img-avatar"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  {/* Hidden file input — APP-MEX-001C */}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-hidden="true"
                    onChange={handleAvatarUpload}
                    data-testid="input-avatar-file"
                  />
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-background"
                    aria-label="Upload profile image"
                    data-testid="button-upload-avatar"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg truncate">
                    {profile?.user?.email ?? "Member account"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={profile?.member?.membership_status === "paid" ? "default" : "secondary"}
                      className="text-xs"
                      data-testid="badge-membership-status"
                    >
                      {profile?.member?.membership_status === "paid" ? "Paid Member" : "Free Member"}
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
                  <div className="text-xs text-muted-foreground mb-1">Member ID</div>
                  <div className="font-mono text-xs truncate" data-testid="text-member-id">
                    {profile?.member?.id ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">Member Type</div>
                  <div className="text-sm capitalize" data-testid="text-member-type">
                    {profile?.member?.member_type ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">Join Date</div>
                  <div className="text-sm" data-testid="text-join-date">
                    {profile?.member?.join_date
                      ? new Date(profile.member.join_date).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">Last Active</div>
                  <div className="text-sm" data-testid="text-last-active">
                    {profile?.member?.last_activity_at
                      ? new Date(profile.member.last_activity_at).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── 2. Profile Visibility — functional switch ───────────────── */}
          <Card data-testid="card-profile-visibility">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Profile Visibility
                </CardTitle>
                {profileVisibility === "public" && (
                  <Button
                    variant="outline"
                    onClick={() => setProfilePreviewOpen(true)}
                    data-testid="button-preview-public-profile"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
              <CardDescription>
                Control who can see your profile within the cooperative.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* Private option */}
              <button
                type="button"
                className={`w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  profileVisibility === "private"
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-transparent hover:bg-muted/30"
                }`}
                aria-pressed={profileVisibility === "private"}
                data-testid="button-visibility-private"
                onClick={() => setProfileVisibility("private")}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  profileVisibility === "private" ? "bg-primary/10" : "bg-muted"
                }`}>
                  <EyeOff className={`h-4 w-4 ${
                    profileVisibility === "private" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">Private</div>
                  <div className="text-xs text-muted-foreground">
                    Only you and cooperative administrators can view your profile.
                  </div>
                </div>
                {profileVisibility === "private" && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>

              {/* Public option — now functional */}
              <button
                type="button"
                className={`w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  profileVisibility === "public"
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-transparent hover:bg-muted/30"
                }`}
                aria-pressed={profileVisibility === "public"}
                data-testid="button-visibility-public"
                onClick={() => setProfileVisibility("public")}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  profileVisibility === "public" ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Eye className={`h-4 w-4 ${
                    profileVisibility === "public" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">Public</div>
                  <div className="text-xs text-muted-foreground">
                    Visible to all cooperative members.
                  </div>
                </div>
                {profileVisibility === "public" && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>

            </CardContent>
          </Card>

          {/* ── 3. Public Profile preview modal ────────────────────────── */}
          <Dialog open={profilePreviewOpen} onOpenChange={setProfilePreviewOpen}>
            <DialogContent data-testid="dialog-public-profile-preview">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Public Profile Preview
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                        data-testid="img-preview-avatar"
                      />
                    ) : (
                      <User className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{profile?.user?.email ?? "Member"}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {profile?.member?.member_type ?? "Member"}
                    </div>
                  </div>
                </div>
                {contactMethods.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      Preferred Contact Platforms
                    </div>
                    {/* APP-MEX-001B: platform label + QR only — no phone numbers or messenger IDs */}
                    <div className="flex gap-3 flex-wrap">
                      {contactMethods.map((cm) => (
                        <div
                          key={cm.id}
                          className="flex flex-col items-center gap-1"
                          data-testid={`preview-contact-${cm.id}`}
                        >
                          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border border-dashed border-muted bg-muted/20">
                            <QrCode className="h-5 w-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
                              {cm.platform}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Scan QR to connect. Contact details are not shown publicly.
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground border-t pt-3">
                  This is how your profile appears to other cooperative members.
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* ── 4. Preferred Contact Methods — max 2, messenger type, QR ── */}
          <Card data-testid="card-preferred-contact-methods">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4" />
                  Preferred Contact Methods
                </CardTitle>
                {contactMethods.length < 2 && !addingContact && (
                  <Button
                    variant="outline"
                    onClick={() => setAddingContact(true)}
                    data-testid="button-add-contact-method"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              <CardDescription>
                Up to two contact methods. A QR code placeholder is shown for each.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {contactMethods.length === 0 && !addingContact && (
                <div className="text-sm text-muted-foreground" data-testid="text-no-contact-methods">
                  No contact methods added yet.
                </div>
              )}

              {contactMethods.map((cm) => (
                <div
                  key={cm.id}
                  className="flex items-center gap-4 border rounded-lg p-3"
                  data-testid={`contact-method-${cm.id}`}
                >
                  <QrPlaceholder platform={cm.platform} handle={cm.handle} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{cm.platform}</div>
                    <div className="text-xs text-muted-foreground truncate">{cm.handle}</div>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label={`Remove ${cm.platform} contact method`}
                    data-testid={`button-remove-contact-${cm.id}`}
                    onClick={() => handleRemoveContact(cm.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {addingContact && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/20" data-testid="form-add-contact">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Platform</div>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={newContactPlatform}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewContactPlatform(e.target.value as MessengerPlatform)}
                      data-testid="select-contact-platform"
                    >
                      {MESSENGER_PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Handle or phone number</div>
                    <Input
                      placeholder={`Your ${newContactPlatform} handle`}
                      value={newContactHandle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContactHandle(e.target.value)}
                      data-testid="input-contact-handle"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddContact}
                      disabled={!newContactHandle.trim()}
                      data-testid="button-confirm-add-contact"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddingContact(false);
                        setNewContactHandle("");
                        setNewContactPlatform("WhatsApp");
                      }}
                      data-testid="button-cancel-add-contact"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {contactMethods.length >= 2 && (
                <div className="text-xs text-muted-foreground" data-testid="text-max-contacts-reached">
                  Maximum of 2 contact methods reached.
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

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

        {/* ================================================================
            INVITATIONS TAB — APP-MEX-001A
            Invitation Relationship Workspace: email, created, expiry,
            notes, delete unaccepted.
        ================================================================ */}
        <TabsContent value="invitations" className="space-y-4">

          {/* Generate invitation card */}
          <Card>
            <CardHeader>
              <CardTitle>Send an Invitation</CardTitle>
              <CardDescription>
                Invite someone you personally know and trust to join the cooperative.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                onClick={() => setInviteModalOpen(true)}
                data-testid="button-open-invite-modal"
              >
                Generate Invitation
              </Button>

              <Dialog
                open={inviteModalOpen}
                onOpenChange={setInviteModalOpen}
              >
                <DialogContent>
                  <div className="space-y-4">

                    <Input
                      type="email"
                      value={invitedEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvitedEmail(e.target.value)}
                      placeholder="Invitee email"
                      data-testid="input-invited-email"
                    />

                    <Button
                      onClick={() => createInvitationMutation.mutate()}
                      disabled={createInvitationMutation.isPending}
                      data-testid="button-create-invitation"
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
                          data-testid="button-copy-invite-link"
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

          {/* Pending received invitation card — APP-MEX-001B: no UUID exposure */}
          {invitationData?.has_pending_invitation && (
            <Card data-testid="card-pending-invitation">
              <CardHeader>
                <CardTitle>Pending Invitation</CardTitle>
                <CardDescription>You have been invited to join the cooperative.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-2">
                  {invitationData?.invitation?.inviter_email && (
                    <div className="text-sm">
                      <span className="font-medium">Invited by: </span>
                      <span className="text-muted-foreground" data-testid="pending-inviter-email">
                        {invitationData.invitation.inviter_email}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Status: </span>
                    <Badge variant="outline" className="text-xs" data-testid="pending-invitation-status">
                      {invitationData?.invitation?.status ?? "pending"}
                    </Badge>
                  </div>
                  {invitationData?.invitation?.created_at && (
                    <div className="text-xs text-muted-foreground" data-testid="pending-invitation-created">
                      Received {new Date(invitationData.invitation.created_at).toLocaleDateString()}
                    </div>
                  )}
                  {invitationData?.invitation?.note && (
                    <div className="text-xs text-muted-foreground border-t pt-2" data-testid="pending-invitation-note">
                      <span className="font-medium text-foreground">Note: </span>
                      {invitationData.invitation.note}
                    </div>
                  )}
                  <Button
                    className="mt-2"
                    onClick={() => acceptInvitationMutation.mutate()}
                    disabled={acceptInvitationMutation.isPending}
                    data-testid="button-accept-invitation"
                  >
                    Accept Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── APP-MEX-001A: Sent Invitations Workspace ─────────────────── */}
          <Card data-testid="card-sent-invitations">
            <CardHeader>
              <CardTitle>Sent Invitations</CardTitle>
              <CardDescription>
                Invitations you have created. Unaccepted invitations can be deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentInvitationsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading invitations...
                </div>
              ) : sentInvitations.length === 0 ? (
                <div className="text-sm text-muted-foreground" data-testid="text-no-sent-invitations">
                  No invitations sent yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {sentInvitations.map((inv) => {
                    const isPending =
                      inv.status === "pending" || inv.status === null || inv.status === undefined;
                    const isDeleting = deletingInvitationId === inv.id;

                    return (
                      <div
                        key={inv.id}
                        className="border rounded-lg p-4 space-y-2"
                        data-testid={`invitation-row-${inv.id}`}
                      >
                        {/* Email */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium" data-testid={`invitation-email-${inv.id}`}>
                              {inv.invited_email ?? "—"}
                            </div>
                            <Badge
                              variant={
                                inv.status === "accepted"
                                  ? "default"
                                  : inv.status === "expired"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[10px] mt-1"
                              data-testid={`invitation-status-${inv.id}`}
                            >
                              {inv.status ?? "pending"}
                            </Badge>
                          </div>

                          {/* Delete — only for unaccepted */}
                          {isPending && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Delete invitation"
                              data-testid={`button-delete-invitation-${inv.id}`}
                              disabled={isDeleting || deleteInvitationMutation.isPending}
                              onClick={() => {
                                setDeletingInvitationId(inv.id);
                                deleteInvitationMutation.mutate(inv.id);
                              }}
                            >
                              {isDeleting ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Created date */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">Created: </span>
                            <span data-testid={`invitation-created-${inv.id}`}>
                              {inv.created_at
                                ? new Date(inv.created_at).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>

                          {/* Expiry date */}
                          <div>
                            <span className="font-medium text-foreground">Expires: </span>
                            <span data-testid={`invitation-expires-${inv.id}`}>
                              {inv.expires_at
                                ? new Date(inv.expires_at).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {inv.note && (
                          <div className="text-xs text-muted-foreground border-t pt-2" data-testid={`invitation-note-${inv.id}`}>
                            <span className="font-medium text-foreground">Note: </span>
                            {inv.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          {/* ================================================================
              RELATIONSHIPS TAB — APP-MEX-001B
              Business entities only. UUIDs must never appear in Founder UI.
              Consumes /api/member/trusted-relationships defensively.
          ================================================================ */}
          <Card data-testid="card-trusted-relationships">
            <CardHeader>
              <CardTitle>Trusted Relationships</CardTitle>
              <CardDescription>
                Your cooperative network — the members who invited you and those you have welcomed.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* ── Invitor ───────────────────────────────────────────────── */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Invited By
                </div>
                {!relationshipsData?.invitor ? (
                  <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground" data-testid="text-no-invitor">
                    No invitor recorded for this account.
                  </div>
                ) : (
                  <div className="rounded-lg border px-4 py-3 space-y-1" data-testid="card-invitor">
                    <div className="text-sm font-medium" data-testid="invitor-member-type">
                      {relationshipsData.invitor.member_type
                        ? `${String(relationshipsData.invitor.member_type).charAt(0).toUpperCase()}${String(relationshipsData.invitor.member_type).slice(1)} member`
                        : "Cooperative member"}
                    </div>
                    {relationshipsData.invitor.email && (
                      <div className="text-xs text-muted-foreground" data-testid="invitor-email">
                        {relationshipsData.invitor.email}
                      </div>
                    )}
                    {relationshipsData.invitor.join_date && (
                      <div className="text-xs text-muted-foreground">
                        Member since {new Date(relationshipsData.invitor.join_date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Direct relationship source
                    </div>
                  </div>
                )}
              </div>

              {/* ── Direct Invitees ───────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Members You Have Welcomed
                  </div>
                  <Badge variant="outline" className="text-xs" data-testid="invitee-count">
                    {relationshipsData?.invitees?.length ?? 0}
                  </Badge>
                </div>

                {!relationshipsData?.invitees?.length ? (
                  <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground" data-testid="text-no-invitees">
                    No members welcomed yet. Send an invitation from the Invitations tab.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(relationshipsData.invitees as any[]).map((item: any, idx: number) => {
                      // Defensive shape resolution — API may return flat or nested
                      const entity = item.invitee ?? item;
                      const memberType: string =
                        entity.member_type ?? item.member_type ?? "";
                      const email: string | null =
                        entity.email ?? item.email ?? null;
                      const joinDate: string | null =
                        entity.join_date ?? item.join_date ?? null;
                      const status: string | null =
                        item.status ?? entity.status ?? null;

                      return (
                        <div
                          key={idx}
                          className="rounded-lg border px-4 py-3 space-y-1"
                          data-testid={`invitee-row-${idx}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium" data-testid={`invitee-member-type-${idx}`}>
                              {memberType
                                ? `${memberType.charAt(0).toUpperCase()}${memberType.slice(1)} member`
                                : "Cooperative member"}
                            </div>
                            {status && (
                              <Badge
                                variant={status === "active" ? "default" : "secondary"}
                                className="text-[10px]"
                                data-testid={`invitee-status-${idx}`}
                              >
                                {status}
                              </Badge>
                            )}
                          </div>
                          {email && (
                            <div className="text-xs text-muted-foreground" data-testid={`invitee-email-${idx}`}>
                              {email}
                            </div>
                          )}
                          {joinDate && (
                            <div className="text-xs text-muted-foreground">
                              Member since {new Date(joinDate).toLocaleDateString()}
                            </div>
                          )}
                          {!email && !joinDate && (
                            <div className="text-xs text-muted-foreground italic" data-testid={`invitee-limited-data-${idx}`}>
                              Member profile available after account activation.
                            </div>
                          )}
                        </div>
                      );
                    })}
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
