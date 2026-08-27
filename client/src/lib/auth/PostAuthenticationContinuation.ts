/**
 * ============================================================================
 * Canonical Authentication Continuation Authority
 * ============================================================================
 *
 * Architectural Role:
 *   Single post-authentication continuation authority.
 *
 * Governance Invariants:
 *   - Single Invocation Contract
 *   - Authentication-mode independent
 *   - Idempotent execution
 *   - Navigation consumes runtime state
 *   - Continuation produces runtime state only
 *
 * CAD Status:
 *   LOCKED v1.0
 *
 * NOTE:
 *   This file intentionally contains architectural stage scaffolding.
 *   Business implementation is activated only through controlled work packages.
 */

export type AuthenticationMode =
  | "signup"
  | "login"
  | "callback"
  | "session_restore"
  | "oauth";

export interface ContinuationContext {
  accessToken: string;
  refreshToken?: string;
  inviteToken?: string;
  authenticationMode: AuthenticationMode;
}

export type ContinuationOutcome =
  | "admin"
  | "member"
  | "pending_invitation"
  | "anonymous"
  | "non_member";

export interface CanonicalRuntimeState {
  authenticationMode: AuthenticationMode;
  outcome: ContinuationOutcome;
  memberId?: string;
  pendingInvitationId?: string;
}

export interface RuntimeState {
  authenticationMode: AuthenticationMode;
  outcome: ContinuationOutcome;
  memberId?: string;
  pendingInvitationId?: string;
}

export type RuntimePublication = RuntimeState;

// ============================================================================
// Exported Types and Interfaces (CAD v1.0 — LOCKED, do not modify)
// ============================================================================

// ============================================================================
// Internal Orchestration Types
// ----------------------------------------------------------------------------
// These types define the private stage-boundary contracts for the internal
// orchestration pipeline. They are architectural only — no business logic is
// executed. All types are private to this module.
// ============================================================================

/**
 * Stage 1 output — produced by _normalizeAuthentication().
 *
 * Represents a validated, mode-normalized view of the raw ContinuationContext.
 * The access token is confirmed present; the authentication mode is surfaced
 * as a first-class discriminant for downstream stages.
 */
interface _NormalizedAuthentication {
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  readonly inviteToken: string | undefined;
  readonly authenticationMode: AuthenticationMode;
}

/**
 * Stage 2 output — produced by _validateContinuationContext().
 *
 * Indicates the normalized authentication context has passed structural
 * validation and is suitable for downstream orchestration.
 */
interface _ValidatedContinuationContext {
  readonly normalized: _NormalizedAuthentication;
  readonly structurallyValid: true;
}

/**
 * Stage 3 output — produced by _resolveInvitationContinuation().
 */
type _InvitationContinuationStage =
  | {
      readonly kind: "invitation";
      readonly inviteToken: string;
    }
  | {
      readonly kind: "non_invitation";
    };

/**
 * Stage 4 output — produced by _determineRuntimeState().
 */
interface _DeterminedRuntimeState {
  readonly authenticationMode: AuthenticationMode;
  readonly outcome: ContinuationOutcome;
  readonly memberId: string | undefined;
  readonly pendingInvitationId: string | undefined;
}

/**
 * Output of _resolveCanonicalMembership() — the sole authority for
 * admin / member / pending-invitation / unaffiliated resolution.
 *
 * Sourced exclusively from GET /api/member/me. The locally-cached
 * gateway.invite.token is never consulted here: it is advisory only
 * (used elsewhere to materialize an invitation after signup) and must
 * never override what the canonical membership authority reports.
 */
interface _CanonicalMembershipResolution {
  readonly outcome: ContinuationOutcome;
  readonly memberId: string | undefined;
  readonly pendingInvitationId: string | undefined;
}

/**
 * Flat GET /api/member/me response shape (certified backend contract,
 * APP-COMPAT-004A). No nested objects — a 404 means no canonical
 * member exists.
 */
interface _CanonicalMemberRecord {
  readonly id?: string;
  readonly membership_status?: string;
  readonly member_type?: string;
  readonly activity_status?: string;
  readonly user_id?: string;
  readonly role?: string;
  readonly sbu_id?: string;
  readonly is_super_admin?: boolean;
}

/**
 * Stage 5 output — produced by _prepareRuntimePublication().
 */
interface _PreparedRuntimePublication {
  readonly publication: RuntimePublication;
}

// ============================================================================
// Internal Orchestration Pipeline
// ============================================================================

function _normalizeAuthentication(
  _context: ContinuationContext,
): _NormalizedAuthentication {
  return {
    accessToken: _context.accessToken.trim(),
    refreshToken: _context.refreshToken?.trim(),
    inviteToken: _context.inviteToken?.trim(),
    authenticationMode: _context.authenticationMode,
  };
}

function _validateContinuationContext(
  _normalized: _NormalizedAuthentication,
): _ValidatedContinuationContext {
  const supported: readonly AuthenticationMode[] = [
    "signup",
    "login",
    "callback",
    "session_restore",
    "oauth",
  ];

  if (!_normalized.accessToken) {
    throw new Error(
      "Continuation validation failed: missing accessToken.",
    );
  }

  if (!supported.includes(_normalized.authenticationMode)) {
    throw new Error(
      `Continuation validation failed: unsupported authenticationMode '${_normalized.authenticationMode}'.`,
    );
  }

  return {
    normalized: _normalized,
    structurallyValid: true,
  };
}

function _resolveInvitationContinuation(
  _validated: _ValidatedContinuationContext,
): _InvitationContinuationStage {
  const inviteToken =
    (_validated.normalized.inviteToken ?? "").trim();

  if (inviteToken.length > 0) {
    return {
      kind: "invitation",
      inviteToken,
    };
  }

  return {
    kind: "non_invitation",
  };
}

const _ADMIN_ROLES: ReadonlySet<string> = new Set([
  "platform_admin",
  "hub_admin",
]);

const _PENDING_MEMBERSHIP_STATUSES: ReadonlySet<string> = new Set([
  "pending",
  "invited",
]);

/**
 * Canonical membership resolution — GET /api/member/me.
 *
 * This is the single source of truth for admin / member / pending /
 * unaffiliated status. Any failure to reach or parse this endpoint
 * fails safe to the least-privileged outcome ("non_member") rather
 * than guessing admin or member status.
 *
 * Per APP-COMPAT-004A: the response is a flat record (no nested
 * objects), and administrator evaluation considers BOTH `role` and
 * `is_super_admin`.
 */
async function _resolveCanonicalMembership(
  _normalized: _NormalizedAuthentication,
): Promise<_CanonicalMembershipResolution> {
  const unaffiliated: _CanonicalMembershipResolution = {
    outcome: "non_member",
    memberId: undefined,
    pendingInvitationId: undefined,
  };

  try {
    const response = await fetch("/api/member/me", {
      headers: {
        Authorization: `Bearer ${_normalized.accessToken}`,
      },
    });

    // "No canonical member exists."
    if (response.status === 404) {
      return unaffiliated;
    }

    if (!response.ok) {
      return unaffiliated;
    }

    const member = (await response.json()) as _CanonicalMemberRecord;

    const isPending =
      typeof member.membership_status === "string" &&
      _PENDING_MEMBERSHIP_STATUSES.has(member.membership_status);

    const isAdmin =
      member.is_super_admin === true ||
      (typeof member.role === "string" && _ADMIN_ROLES.has(member.role));

    if (isAdmin && !isPending) {
      return {
        outcome: "admin",
        memberId: member.id,
        pendingInvitationId: undefined,
      };
    }

    if (isPending) {
      return {
        outcome: "pending_invitation",
        memberId: undefined,
        pendingInvitationId: member.id,
      };
    }

    if (member.id) {
      return {
        outcome: "member",
        memberId: member.id,
        pendingInvitationId: undefined,
      };
    }

    return unaffiliated;
  } catch {
    return unaffiliated;
  }
}

async function _determineRuntimeState(
  _validated: _ValidatedContinuationContext,
  _invitationStage: _InvitationContinuationStage,
): Promise<_DeterminedRuntimeState> {
  const membership = await _resolveCanonicalMembership(_validated.normalized);

  if (
    membership.outcome !== "non_member" ||
    _invitationStage.kind !== "invitation"
  ) {
    return {
      authenticationMode: _validated.normalized.authenticationMode,
      outcome: membership.outcome,
      memberId: membership.memberId,
      pendingInvitationId: membership.pendingInvitationId,
    };
  }

  try {
    const pendingResponse = await fetch(
      "/api/member/pending-invitation",
      {
        headers: {
          Authorization: `Bearer ${_validated.normalized.accessToken}`,
        },
      },
    );

    if (!pendingResponse.ok) {
      return {
        authenticationMode: _validated.normalized.authenticationMode,
        outcome: "non_member",
        memberId: undefined,
        pendingInvitationId: undefined,
      };
    }

    const pendingData = (await pendingResponse.json()) as {
      has_pending_invitation?: boolean;
      invitation?: { id?: string };
    };

    const invitationId = pendingData.invitation?.id?.trim();

    if (!pendingData.has_pending_invitation || !invitationId) {
      return {
        authenticationMode: _validated.normalized.authenticationMode,
        outcome: "non_member",
        memberId: undefined,
        pendingInvitationId: undefined,
      };
    }

    const acceptanceResponse = await fetch(
      "/api/member/accept-invitation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_validated.normalized.accessToken}`,
        },
        body: JSON.stringify({
          invitationId,
        }),
      },
    );

    if (!acceptanceResponse.ok) {
      return {
        authenticationMode: _validated.normalized.authenticationMode,
        outcome: "non_member",
        memberId: undefined,
        pendingInvitationId: undefined,
      };
    }

    const resolvedMembership =
      await _resolveCanonicalMembership(_validated.normalized);

    return {
      authenticationMode: _validated.normalized.authenticationMode,
      outcome: resolvedMembership.outcome,
      memberId: resolvedMembership.memberId,
      pendingInvitationId: resolvedMembership.pendingInvitationId,
    };
  } catch {
    return {
      authenticationMode: _validated.normalized.authenticationMode,
      outcome: "non_member",
      memberId: undefined,
      pendingInvitationId: undefined,
    };
  }
}

function _prepareRuntimePublication(
  _determined: _DeterminedRuntimeState,
): _PreparedRuntimePublication {
  return {
    publication: {
      authenticationMode: _determined.authenticationMode,
      outcome: _determined.outcome,
      memberId: _determined.memberId,
      pendingInvitationId: _determined.pendingInvitationId,
    },
  };
}

// ============================================================================
// Exported Continuation Authority (CAD v1.0 — LOCKED)
// ============================================================================

export async function postAuthenticationContinuation(
  _context: ContinuationContext,
): Promise<RuntimeState> {
  const normalized = _normalizeAuthentication(_context);

  const validated = _validateContinuationContext(normalized);

  const invitationStage =
    _resolveInvitationContinuation(validated);

  const runtimeState =
    await _determineRuntimeState(validated, invitationStage);

  const prepared =
    _prepareRuntimePublication(runtimeState);

  return prepared.publication;
}