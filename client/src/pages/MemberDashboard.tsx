"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type State =
  | "loading"
  | "member"
  | "invited"
  | "no_invitation"
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
        setState("invited");
        return;
      }

      setState("no_invitation");
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
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (state === "error") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Something went wrong</h2>
        <p>Unable to load your membership status. Please try again later.</p>
      </div>
    );
  }

  if (state === "no_invitation") {
    return (
      <div style={{ padding: 20 }}>
        <h2>You are not yet a cooperative member</h2>
        <p>You need an invitation to join the Lambsbook Cooperative.</p>
      </div>
    );
  }

  if (state === "invited") {
    return (
      <div style={{ padding: 20 }}>
        <h2>You have been invited</h2>
        <p>Accept your invitation to join the cooperative.</p>
        <button onClick={acceptInvitation}>
          Accept Invitation
        </button>
      </div>
    );
  }

  // state === "member"
  return (
    <div style={{ padding: 20 }}>
      <h1>Member Dashboard</h1>
      <p>Welcome to Lambsbook Cooperative Hub.</p>
    </div>
  );
}