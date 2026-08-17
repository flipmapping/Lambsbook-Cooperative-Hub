import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { createClient } from "@/lib/supabase/client";
import CommunityPage from "@/pages/CommunityPage";

type NonMemberInvitation = {
  id: string;
  token: string;
  targetType: string;
  targetId: string;
  inviterId: string;
  inviterDisplayName: string;
  targetName?: string | null;
  targetPurpose?: string | null;
  message?: string | null;
  lifecycle: string;
  participationState: "none" | "interested" | "joined" | "attended" | "declined";
};

export default function NonMemberInvitationPage() {
  const params = useParams();

   const [invitation, setInvitation] = useState<NonMemberInvitation | null>(
    null,
  );
  const [loading, setLoading] = useState(Boolean(params.token));
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.token) return;

    let cancelled = false;

    const token = params.token;
    if (!token) return;

    createClient().auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;

      if (!session?.access_token) {
        window.location.assign(
          `/hub/signup?invite=${encodeURIComponent(token)}`,
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params.token]);


  useEffect(() => {
    if (!params.token) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(
      `/api/non-member-invitations/${encodeURIComponent(params.token)}`,
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Invitation could not be loaded.");
        }

        return response.json();
      })
      .then((data: NonMemberInvitation) => {
        if (cancelled) return;

        setInvitation(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);
        setError("This invitation could not be loaded.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.token]);

  const respondToInvitation = async (
    participationState:
      | "interested"
      | "joined"
      | "attended"
      | "declined",
  ) => {
    if (!params.token || responding) return;

    try {
      setResponding(true);
      setError(null);

      const response = await apiRequest(
        "POST",
        `/api/non-member-invitations/${encodeURIComponent(params.token)}/respond`,
        { participationState },
      );

      const updated = (await response.json()) as NonMemberInvitation;

      setInvitation(updated);
    } catch (err) {
      console.error(err);
      setError("Your response could not be saved.");
    } finally {
      setResponding(false);
    }
  };


  if (params.token) {
    if (loading) {
      return (
        <div style={{ padding: 24 }}>
          <h1>Loading Invitation</h1>
        </div>
      );
    }

    if (error && !invitation) {
      return (
        <div style={{ padding: 24 }}>
          <h1>Invitation Unavailable</h1>
          <p>{error}</p>
        </div>
      );
    }

    if (!invitation) {
      return null;
    }

    const responded = invitation.participationState !== "none";

    return (
      <div>
        <CommunityPage
          params={{}}
          invitation={{
            inviter: invitation.inviterDisplayName,
            targetName:
              invitation.targetName ?? invitation.targetId,
            targetPurpose: invitation.targetPurpose ?? undefined,
            message: invitation.message ?? undefined,
          }}
          onRecipientAction={(outcome) => {
            void respondToInvitation(
              outcome === "join"
                ? "joined"
                : outcome === "express_interest"
                  ? "interested"
                  : "declined",
            );
          }}
        />

        {responded ? (
          <div
            style={{
              margin: "0 auto 24px",
              maxWidth: 720,
              padding: 16,
              border: "1px solid #16a34a",
              borderRadius: 8,
            }}
          >
            <strong>Response saved</strong>
            <p style={{ marginTop: 8 }}>
              Your response is: {invitation.participationState}.
            </p>
          </div>
        ) : null}

        {error ? (
          <p
            style={{ margin: "0 auto 24px", maxWidth: 720 }}
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }

}
