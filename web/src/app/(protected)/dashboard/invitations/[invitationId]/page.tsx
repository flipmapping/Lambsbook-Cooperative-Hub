"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const HUB_API_BASE = process.env.NEXT_PUBLIC_HUB_API_BASE_URL ?? "";

type Outcome = {
  invitationId: string;
  status: "accepted";
  acceptedAt: string;
};

type ApiError = {
  code: string;
  message: string;
};

export default function InvitationOutcomePage() {
  const params = useParams();
  const invitationId = params?.invitationId as string;

  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invitationId) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("sb-access-token") ?? ""
        : "";

    fetch(`${HUB_API_BASE}/api/member/invitations/${invitationId}/outcome`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((body) => ({ status: res.status, body })))
      .then(({ status, body }) => {
        if (status === 200) {
          setOutcome(body as Outcome);
        } else {
          setError((body?.error as ApiError) ?? { code: "UNKNOWN", message: "Unexpected error." });
        }
      })
      .catch(() => setError({ code: "NETWORK_ERROR", message: "Could not reach server." }))
      .finally(() => setLoading(false));
  }, [invitationId]);

  if (loading) {
    return <p>Loading invitation outcome…</p>;
  }

  if (error) {
    if (error.code === "INVITATION_NOT_FOUND") {
      return <p>Invitation not found.</p>;
    }
    if (error.code === "INVITATION_NOT_ACCEPTED") {
      return <p>This invitation has not been accepted yet.</p>;
    }
    if (error.code === "UNAUTHENTICATED") {
      return <p>You must be signed in to view this.</p>;
    }
    return <p>Error: {error.message}</p>;
  }

  if (!outcome) return null;

  return (
    <div>
      <h1>Invitation Accepted</h1>
      <dl>
        <dt>Invitation ID</dt>
        <dd>{outcome.invitationId}</dd>
        <dt>Status</dt>
        <dd>{outcome.status}</dd>
        <dt>Accepted At</dt>
        <dd>{new Date(outcome.acceptedAt).toLocaleString()}</dd>
      </dl>
    </div>
  );
}
