"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type State =
  | "loading"
  | "member"
  | "invited"
  | "no_invitation";

export default function MemberDashboard() {
  const [state, setState] = useState<State>("loading");
  const [invitationId, setInvitationId] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Step 1 — check if already member
        const res = await apiRequest("GET", "/api/hub/member/me");

        if (res.ok) {
          const data = await res.json();

          if (data?.member) {
            setState("member");
            return;
          }
        }

        // Step 2 — check invitation
        const invRes = await apiRequest("GET", "/api/hub/member/invitations");

        if (invRes.ok) {
          const invData = await invRes.json();

          if (invData?.invitation) {
            setInvitationId(invData.invitation.id);
            setState("invited");
            return;
          }
        }

        // Step 3 — no invitation
        setState("no_invitation");

      } catch (err) {
        console.error(err);
        setState("no_invitation");
      }
    };

    checkAccess();
  }, []);

  const acceptInvitation = async () => {
      if (!invitationId) return;

      try {
        await apiRequest("POST", "/api/hub/member/accept-invitation", {
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