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

      if (meRes.ok) {
        setState("member");
        return;
      }

      if (meRes.status !== 404) {
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

      if (invData?.invitation) {
        setInvitationId(invData.invitation.id);
        setState("invited_pending_acceptance");
        return;
      }

      setState("non_member_no_invitation");
    };

    checkAccess();
  }, []);

  const acceptInvitation = async () => {
      if (!invitationId) return;

      try {
        await apiRequest("POST", "/api/member/accept-invitation", {
          invitationId,
        });

        window.location.reload();
      } catch (err: any) {
        console.error(err);
        alert(err?.message || "Error accepting invitation");
      }
    };

  // ---------------- UI ----------------

  if (state === "loading") {
    return <div style={{ padding: 20 }}>Preparing your dashboard…</div>;
  }

  if (state === "unauthenticated") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Authentication required</h2>
        <p>Please sign in to continue to your dashboard.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={{ padding: 20 }}>
        <h2>We could not prepare your dashboard right now.</h2>
      </div>
    );
  }

  if (state === "non_member_no_invitation") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Membership pending</h2>
        <p>You can explore the dashboard and share a local idea here. Other cooperative actions will become available once you are a member.</p>
      </div>
    );
  }

  if (state === "invited_pending_acceptance") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Taking you to your invitation…</h2>
        <button onClick={acceptInvitation}>
          Accept Invitation
        </button>
      </div>
    );
  }

  if (state === "member") {
    return (
      <div style={{ padding: 20 }}>
        <h1>Member Dashboard</h1>
        <p>
          As a cooperative member, you can take part in the available dashboard
          actions in this view.
        </p>
      </div>
    );
  }

  return null;
}