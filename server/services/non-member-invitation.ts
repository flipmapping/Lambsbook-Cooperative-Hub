/**
 * Non-Member Invitation — Phase-1 business contract.
 *
 * Separate from membership onboarding invitations.
 * Main App owns invitation state; destination surfaces consume this contract.
 */

export type NonMemberInvitationTargetType = "community" | "event";

export type NonMemberInvitationLifecycle =
  | "pending"
  | "opened"
  | "responded"
  | "expired"
  | "cancelled";

export type NonMemberInvitationParticipationState =
  | "none"
  | "interested"
  | "joined"
  | "attended";

export interface NonMemberInvitationInviter {
  id: string;
  displayName: string;
}

export interface CreateNonMemberInvitationInput {
  targetType: NonMemberInvitationTargetType;
  targetId: string;
  inviter: NonMemberInvitationInviter;
  targetName?: string;
  targetPurpose?: string;
  message?: string;
}

export interface NonMemberInvitation {
  token: string;
  targetType: NonMemberInvitationTargetType;
  /** Opaque canonical destination reference. Main App does not interpret it. */
  targetId: string;
  inviter: NonMemberInvitationInviter;
  targetName?: string;
  targetPurpose?: string;
  message?: string;
  lifecycle: NonMemberInvitationLifecycle;
  participationState: NonMemberInvitationParticipationState;
}

/**
 * Phase-1 creation boundary.
 *
 * Community is the only materialized target in this phase.
 * Event remains contract vocabulary only and is intentionally rejected
 * until a canonical Event destination exists.
 */
export function createNonMemberInvitation(
  input: CreateNonMemberInvitationInput,
): NonMemberInvitation {
  if (input.targetType !== "community") {
    throw new Error(
      "Non-member invitation creation currently supports community targets only.",
    );
  }

  if (!input.targetId.trim()) {
    throw new Error("Non-member invitation targetId is required.");
  }

  const token = `nmi_${crypto.randomUUID()}`;

  return {
    token,
    targetType: input.targetType,
    targetId: input.targetId,
    inviter: input.inviter,
    ...(input.targetName !== undefined
      ? { targetName: input.targetName }
      : {}),
    ...(input.targetPurpose !== undefined
      ? { targetPurpose: input.targetPurpose }
      : {}),
    ...(input.message?.trim()
      ? { message: input.message.trim() }
      : {}),
    lifecycle: "pending",
    participationState: "none",
  };
}
