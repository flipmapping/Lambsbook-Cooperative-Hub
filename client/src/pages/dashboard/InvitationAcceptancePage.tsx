/**
 * InvitationAcceptancePage
 * Authority: APP-INV-001
 *
 * Handles two routes:
 *
 * 1. /invitation-link/:token
 *    Unauthenticated invitation URL entry point.
 *    Redirects to /hub/signup?invite=<token> to preserve the token through signup.
 *
 * 2. /hub/accept-invitation  (routed via App.tsx)
 *    Post-authentication invitation acceptance surface.
 *    Resolves the pending invitation from the canonical membership authority
 *    and presents the acceptance UI. Never exposes internal UUIDs.
 *
 * This page is the canonical acceptance surface.
 * POST /api/member/accept-invitation is the canonical membership creation path.
 */
import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function InvitationAcceptancePage() {
  const params = useParams<{ token?: string; invitationId?: string }>();

  // ── Invitation-link entry: redirect to signup preserving the token ──────────
  useEffect(() => {
    if (params.token) {
      window.location.assign(
        `/hub/signup?invite=${encodeURIComponent(params.token)}`,
      );
    }
  }, [params.token]);

  // ── Post-authentication acceptance state ────────────────────────────────────
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve invitation ID from URL param or from pending-invitation API
  const [resolvedInvitationId, setResolvedInvitationId] = useState<string | null>(
    params.invitationId ?? null,
  );
  const [resolving, setResolving] = useState(!params.invitationId && !params.token);

  useEffect(() => {
    // Only resolve from API when there's no token (entry via /hub/accept-invitation)
    // and no explicit invitationId in the URL.
    if (params.token || params.invitationId || resolvedInvitationId) return;

    let cancelled = false;

    const resolveFromPendingInvitation = async () => {
      try {
        const token = (() => {
          try {
            const stored = localStorage.getItem("supabase.auth.token");
            if (!stored) return null;
            return (JSON.parse(stored) as { access_token?: string }).access_token ?? null;
          } catch {
            return null;
          }
        })();

        if (!token) {
          if (!cancelled) {
            setError("Not authenticated. Please sign in to accept your invitation.");
            setResolving(false);
          }
          return;
        }

        const res = await fetch("/api/member/pending-invitation", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (!cancelled) {
            setError("No pending invitation found for your account.");
            setResolving(false);
          }
          return;
        }

        const data = await res.json() as {
          has_pending_invitation?: boolean;
          invitation?: { id?: string };
        };

        if (!cancelled) {
          if (data.has_pending_invitation && data.invitation?.id) {
            setResolvedInvitationId(data.invitation.id);
          } else {
            setError("No pending invitation found for your account.");
          }
          setResolving(false);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load your invitation. Please try again.");
          setResolving(false);
        }
      }
    };

    resolveFromPendingInvitation();
    return () => { cancelled = true; };
  }, [params.token, params.invitationId, resolvedInvitationId]);

  const acceptInvitation = async () => {
    if (accepting || !resolvedInvitationId) return;

    try {
      setAccepting(true);
      setError(null);

      const token = (() => {
        try {
          const stored = localStorage.getItem("supabase.auth.token");
          if (!stored) return null;
          return (JSON.parse(stored) as { access_token?: string }).access_token ?? null;
        } catch {
          return null;
        }
      })();

      const res = await fetch("/api/member/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ invitationId: resolvedInvitationId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as {
          error?: string | { message?: string };
        };
        const msg =
          typeof body.error === "string"
            ? body.error
            : body.error?.message ?? "Failed to accept invitation.";
        setError(msg);
        setAccepting(false);
        return;
      }

      setAccepted(true);

      // Navigate to dashboard after brief confirmation
      setTimeout(() => {
        window.location.assign("/hub/dashboard");
      }, 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setAccepting(false);
    }
  };

  // Redirect path: show minimal loading while redirect fires
  if (params.token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle>Preparing your invitation</CardTitle>
            <CardDescription>
              Redirecting you to sign up...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Accepted state
  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Welcome to the Cooperative</CardTitle>
            <CardDescription>
              Your invitation has been accepted. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Resolving state
  if (resolving) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle>Loading your invitation</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !resolvedInvitationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Invitation Unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.assign("/hub/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Acceptance UI — no UUID exposed
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Accept Your Cooperative Invitation</CardTitle>
          <CardDescription>
            You have been personally invited to join Lambsbook Cooperative.
            Accepting confirms your place in the network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            className="w-full"
            onClick={acceptInvitation}
            disabled={accepting || !resolvedInvitationId}
            data-testid="button-accept-invitation"
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Accepting invitation...
              </>
            ) : (
              "Accept Cooperative Invitation"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.assign("/hub/dashboard")}
            data-testid="button-go-to-dashboard"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
