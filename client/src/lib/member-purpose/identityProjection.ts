/**
 * Identity Projection Module
 * Authority: APP-MEX-002A
 *
 * Pure function. No side effects. No API calls. No React.
 * Answers: "Who am I becoming?"
 *
 * Consumed by: useMemberPurpose, IdentityCard
 * Future consumers: Community Graph, Growth Engine, AI Assistant
 */

import type {
  IdentityProjection,
  IdentityAction,
  RawMemberProfile,
  RawActivityData,
  RawRelationshipsData,
} from "./types";

// ── Identity tier ladder ──────────────────────────────────────────────────────

interface IdentityTier {
  label:       string;
  description: string;
  minScore:    number;
  maxScore:    number;
}

const IDENTITY_TIERS: IdentityTier[] = [
  {
    label:       "Cooperative Newcomer",
    description: "You have just joined. Your cooperative story is beginning.",
    minScore:    0,
    maxScore:    25,
  },
  {
    label:       "Emerging Member",
    description: "You are building your cooperative presence and relationships.",
    minScore:    25,
    maxScore:    50,
  },
  {
    label:       "Contributing Member",
    description: "You actively contribute to the cooperative and its network.",
    minScore:    50,
    maxScore:    75,
  },
  {
    label:       "Trusted Cooperative Member",
    description: "Your trust and network are meaningful assets to the community.",
    minScore:    75,
    maxScore:    100,
  },
];

// ── Score computation ─────────────────────────────────────────────────────────
//
// Score is 0–100, weighted from:
//   Membership tier:    0 (free) | 30 (paid)
//   Activity:           0 (inactive) | 20 (active)
//   Tenure:             0–25 (capped at 24 months → 25 pts)
//   Network (invitees): 0–25 (5 pts each, capped at 5 invitees)

function computeScore(
  isPaidMember:  boolean,
  isActive:      boolean,
  tenureMonths:  number,
  inviteeCount:  number,
): number {
  const tierPts    = isPaidMember ? 30 : 0;
  const actPts     = isActive     ? 20 : 0;
  const tenurePts  = Math.min(25, Math.floor((tenureMonths / 24) * 25));
  const networkPts = Math.min(25, inviteeCount * 5);
  return Math.min(100, tierPts + actPts + tenurePts + networkPts);
}

function resolveTier(score: number): IdentityTier {
  for (const tier of [...IDENTITY_TIERS].reverse()) {
    if (score >= tier.minScore) return tier;
  }
  return IDENTITY_TIERS[0];
}

function resolveNextTier(current: IdentityTier): IdentityTier | null {
  const idx = IDENTITY_TIERS.findIndex((t) => t.label === current.label);
  return idx >= 0 && idx < IDENTITY_TIERS.length - 1
    ? IDENTITY_TIERS[idx + 1]
    : null;
}

function resolveProgressToNextTier(
  score:        number,
  currentTier:  IdentityTier,
  nextTier:     IdentityTier | null,
): number {
  if (!nextTier) return 100;
  const rangeSize = nextTier.minScore - currentTier.minScore;
  if (rangeSize <= 0) return 100;
  const progress = ((score - currentTier.minScore) / rangeSize) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

// ── Next-tier narrative ───────────────────────────────────────────────────────

function resolveNextTierNarrative(
  nextTier:     IdentityTier | null,
  isPaidMember: boolean,
  isActive:     boolean,
  inviteeCount: number,
): string | null {
  if (!nextTier) return null;
  if (!isActive) {
    return "Reactivate your account to continue building your cooperative identity.";
  }
  if (!isPaidMember && nextTier.minScore >= 50) {
    return "Upgrading to paid membership is the fastest path to " + nextTier.label + ".";
  }
  if (inviteeCount === 0) {
    return (
      "Welcoming your first trusted member into the cooperative " +
      "will advance you toward " + nextTier.label + "."
    );
  }
  return (
    "Continue growing your cooperative network " +
    "to reach " + nextTier.label + "."
  );
}

// ── Primary action ────────────────────────────────────────────────────────────

function resolvePrimaryAction(
  isPaidMember: boolean,
  isActive:     boolean,
  inviteeCount: number,
  isOnboarding: boolean,
): IdentityAction {
  if (!isActive) {
    return {
      label:       "Reactivate Your Account",
      description: "Log your participation to restore your active standing.",
      destination: "overview",
    };
  }
  if (!isPaidMember) {
    return {
      label:       "Upgrade to Paid Membership",
      description: "Unlock unlimited earning potential across all programs.",
      destination: "membership",
    };
  }
  if (isOnboarding && inviteeCount === 0) {
    return {
      label:       "Welcome Someone You Trust",
      description: "Send your first invitation to grow your cooperative network.",
      destination: "invitations",
    };
  }
  if (inviteeCount === 0) {
    return {
      label:       "Grow Your Network",
      description: "Invite trusted people to deepen your cooperative presence.",
      destination: "invitations",
    };
  }
  return {
    label:       "Explore Earning Programs",
    description: "Discover programs available to you as a paid member.",
    destination: "workspace",
  };
}

// ── Tenure helper ─────────────────────────────────────────────────────────────

function tenureInMonths(joinDateIso: string): number {
  try {
    const join = new Date(joinDateIso);
    const now  = new Date();
    return Math.max(
      0,
      (now.getFullYear() - join.getFullYear()) * 12 +
        (now.getMonth() - join.getMonth()),
    );
  } catch {
    return 0;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function projectIdentity(
  profile:       RawMemberProfile   | null | undefined,
  activity?:     RawActivityData    | null,
  relationships?: RawRelationshipsData | null,
): IdentityProjection {
  const member        = profile?.member ?? null;
  const isPaidMember  = member?.membership_status === "paid";
  const isActive      = (activity?.activity_status ?? member?.activity_status ?? "active") === "active";
  const joinDate      = member?.join_date ?? new Date().toISOString();
  const tenureMonths  = tenureInMonths(joinDate);
  const isOnboarding  = tenureMonths <= 3;
  const inviteeCount  = relationships?.invitees?.length ?? 0;
  const hasInvitor    = !!relationships?.invitor;

  const score        = computeScore(isPaidMember, isActive, tenureMonths, inviteeCount);
  const currentTier  = resolveTier(score);
  const nextTier     = resolveNextTier(currentTier);
  const progressScore = resolveProgressToNextTier(score, currentTier, nextTier);
  const nextTierNarrative = resolveNextTierNarrative(
    nextTier, isPaidMember, isActive, inviteeCount
  );
  const primaryAction = resolvePrimaryAction(
    isPaidMember, isActive, inviteeCount, isOnboarding
  );

  return {
    tierLabel:         currentTier.label,
    tierDescription:   currentTier.description,
    progressScore,
    nextTierLabel:     nextTier?.label ?? null,
    nextTierNarrative,
    networkDepth:      inviteeCount,
    hasInvitor,
    primaryAction,
  };
}
