"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type State =
  | "loading"
  | "unauthenticated"
  | "member"
  | "invited_pending_acceptance"
  | "non_member_no_invitation"
  | "error";

export default function MemberDashboard() {
  const [state, setState] = useState<State>("loading");
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [invitationCreatedAt, setInvitationCreatedAt] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccessfully, setAcceptedSuccessfully] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      let meRes: Response;
      try {
        meRes = await apiRequest("GET", "/api/member/me");
      } catch (err) {
        console.error("[MemberDashboard] member/me request failed:", err);
        setState("error");
        return;
      }

      if (!meRes.ok && meRes.status !== 404) {
        console.error("[MemberDashboard] member/me unexpected status:", meRes.status);
        setState("error");
        return;
      }

      let invRes: Response;
      try {
        invRes = await apiRequest("GET", "/api/member/pending-invitation");
      } catch (err) {
        console.error("[MemberDashboard] pending-invitation request failed:", err);
        setState("error");
        return;
      }

      if (!invRes.ok) {
        console.error("[MemberDashboard] pending-invitation unexpected status:", invRes.status);
        setState("error");
        return;
      }

      const invData = await invRes.json();

      if (meRes.ok) {
        setAcceptedSuccessfully(true);

        setTimeout(() => {
          setState("member");
        }, 300);

        return;
      }

      if (invData?.invitation) {
        setInvitationId(invData.invitation.id);
        setInvitationCreatedAt(invData.invitation.created_at ?? null);
        setState("invited_pending_acceptance");
        return;
      }

      setState("non_member_no_invitation");
    };

    checkAccess();
  }, []);

  const acceptInvitation = async () => {
    if (!invitationId || accepting) return;

    setAccepting(true);

    try {
      await apiRequest("POST", "/api/member/accept-invitation", {
        invitationId,
      });

      setState("member");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Error accepting invitation");
      setAccepting(false);
    }
  };

  // ---------------- UI ----------------

  if (state === "loading") {
    return <div style={{ padding: 20 }}>Preparing your member space…</div>;
  }

  if (state === "unauthenticated") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Authentication required</h2>
        <p>Please sign in to continue to your member space and cooperative participation area.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={{ padding: 20 }}>
        <h2>We could not prepare your member space right now. Please refresh and try again.</h2>
      </div>
    );
  }

  if (state === "non_member_no_invitation") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Your membership journey has started</h2>
        <p>You can continue exploring the member space while your membership pathway develops. Additional cooperative participation features will become available as your membership becomes active.</p>
      </div>
    );
  }

  if (state === "invited_pending_acceptance") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Your invitation is ready</h2>

        <p style={{ marginTop: 12 }}>
          Your cooperative invitation is available and ready for acceptance.
        </p>

        {invitationCreatedAt && (
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              opacity: 0.7,
            }}
          >
            Invitation created:
            {" "}
            {new Date(invitationCreatedAt).toLocaleString()}
          </p>
        )}
        <button
          onClick={acceptInvitation}
          disabled={accepting}
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "14px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {accepting
            ? "Accepting invitation..."
            : "Accept Cooperative Invitation"}
        </button>
      </div>
    );
  }

  if (state === "member") {
    return (
      <div style={{ padding: 20 }}>
        {acceptedSuccessfully && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid #22c55e",
              borderRadius: 8,
              background: "#f0fdf4",
            }}
          >
            Your cooperative invitation has been accepted successfully.
          </div>
        )}

        <h1>Member Space</h1>
        <p>
          Welcome to your cooperative member space. This area will help you follow your membership journey and participate in available cooperative activities over time.
        </p>

        <div className="mt-6 rounded-lg border bg-muted/30 p-4 space-y-3">
          <h2 className="text-lg font-semibold">
            Your participation space
          </h2>

          <p className="text-sm text-muted-foreground">
            This lightweight member area is designed to help you stay connected
            with your cooperative membership journey.
          </p>

          <p className="text-sm text-muted-foreground">
            Additional participation features may become available over time as
            your membership pathway develops.
          </p>
        </div>
      </div>
    );
  }

  return null;
}