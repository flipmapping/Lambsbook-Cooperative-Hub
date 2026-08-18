import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function InvitationAcceptancePage() {
  const params = useParams();

  useEffect(() => {
    if (params.token) {
      window.location.assign(
        `/hub/signup?invite=${encodeURIComponent(params.token)}`,
      );
    }
  }, [params.token]);
const [invitationId, setInvitationId] = useState<string | null>(params.invitationId ?? null);
  const [accepting, setAccepting] = useState(false);

const acceptInvitation = async () => {
    if (accepting) return;

    try {
      setAccepting(true);

      await apiRequest(
        "POST",
        "/api/member/accept-invitation",
        {
          invitationId: invitationId,
        }
      );

      window.location.assign("/hub/dashboard");
    } catch (err) {
      console.error(err);
      console.error("INVITATION_ACCEPTANCE_FAILED");
      setAccepting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Invitation Acceptance</h1>

      <p>
        Invitation ID:
      </p>

      <pre>
        {params.invitationId}
      </pre>


      <button
        onClick={acceptInvitation}
        disabled={accepting}
        style={{
          display: "block",
          marginTop: 24,
          padding: "16px 24px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 18,
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
