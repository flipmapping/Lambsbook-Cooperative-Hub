// InvitationAcceptanceSection
//
// Vite-compatible canonical invitation acceptance surface.
// Mounts inside HubDashboard for entryState === "invited_pending_acceptance".
//
// ISOLATION RULES:
// - No imports from educational namespace (@/lib/learning/*)
// - No imports from cooperative participation components
// - No InteractionCapability coupling
// - No entryState mutation — acceptance triggers onAccepted callback only
// - No routing — HubDashboard controls state transition after acceptance
// - No modal — inline section surface only
// - No new global context
//
// API CONTRACT:
// - Calls existing POST /api/member/accept-invitation with { invitationId }
// - Backend is not modified by this component
//
// PROPS:
// - pendingInvitationId: string — passed from HubDashboard state
// - onAccepted: () => void — signals HubDashboard to transition to member state

import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

const HUB_API_BASE = import.meta.env.VITE_HUB_API_BASE_URL ?? "";

type AcceptanceStatus = "idle" | "submitting" | "error";

type InvitationAcceptanceSectionProps = {
  pendingInvitationId: string;
  onAccepted: () => void;
};

export function InvitationAcceptanceSection({
  pendingInvitationId,
  onAccepted,
}: InvitationAcceptanceSectionProps) {
  const [status, setStatus] = useState<AcceptanceStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAccept = async () => {
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage(null);

    
      try {
        const res = await apiRequest(
          "POST",
          "/api/member/accept-invitation",
          {
            invitationId: pendingInvitationId,
          },
        );


      
        onAccepted();
        return;

    } catch {
      setErrorMessage(
        "Unable to reach the server. Please check your connection and try again."
      );
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage(null);
  };

  return (
    <section
      aria-labelledby="invitation-acceptance-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Cooperative Membership
        </p>
        <h2
          id="invitation-acceptance-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          You have a pending invitation
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          You have been invited to join the cooperative. Accepting this
          invitation activates your membership and unlocks full cooperative
          participation.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Invitation acceptance is the sole membership activation surface.
        </p>
      </div>

      {status === "error" && errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-800/60 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAccept}
          disabled={status === "submitting"}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Accepting…" : "Accept invitation"}
        </button>

        {status === "error" ? (
          <button
            type="button"
            onClick={handleRetry}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Try again
          </button>
        ) : null}
      </div>
    </section>
  );
}
