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
  message?: string;
}

export interface NonMemberInvitation {
  token: string;
  targetType: NonMemberInvitationTargetType;
  targetId: string;
  inviter: NonMemberInvitationInviter;
  message?: string;
  lifecycle: NonMemberInvitationLifecycle;
  participationState: NonMemberInvitationParticipationState;
}

export function createNonMemberInvitation(
  input: CreateNonMemberInvitationInput,
  inviter: NonMemberInvitationInviter,
): NonMemberInvitation {
  if (input.targetType !== "community") {
    throw new Error("Non-member invitation creation currently supports community targets only.");
  }

  if (!input.targetId.trim()) {
    throw new Error("Non-member invitation targetId is required.");
  }

  const token = `nmi_${crypto.randomUUID()}`;

  return {
    token,
    targetType: input.targetType,
    targetId: input.targetId,
    inviter,
    ...(input.message?.trim() ? { message: input.message.trim() } : {}),
    lifecycle: "pending",
    participationState: "none",
  };
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

export interface CreateNonMemberInvitationInput {
  targetType: NonMemberInvitationTargetType;
  targetId: string;

  inviter: NonMemberInvitationInviter;

  targetName?: string;
  targetPurpose?: string;
  message?: string;
}

/**
 * Phase-1 creation boundary.
 *
 * Community is the only materialized target in this phase.
 * Event remains part of the contract vocabulary but is intentionally
 * rejected until a canonical Event destination exists.
 */
export function createNonMemberInvitationContract(
  input: CreateNonMemberInvitationInput,
  token: string,
): NonMemberInvitation {
  if (input.targetType !== "community") {
    throw new Error(
      "Non-member invitation creation currently supports community targets only.",
    );
  }

  if (!input.targetId.trim()) {
    throw new Error("Non-member invitation targetId is required.");
  }

  if (!token.trim()) {
    throw new Error("Non-member invitation token is required.");
  }

  return {
    token,
    targetType: input.targetType,
    targetId: input.targetId,
    inviter: input.inviter,
    targetName: input.targetName,
    targetPurpose: input.targetPurpose,
    message: input.message,
    lifecycle: "pending",
    participationState: "none",
  };
}
