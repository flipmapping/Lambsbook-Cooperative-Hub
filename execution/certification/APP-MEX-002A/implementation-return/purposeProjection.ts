/**
 * Purpose Projection Module
 * Authority: APP-MEX-002A
 *
 * Pure function. No side effects. No API calls. No React.
 * Answers: "Why am I here?"
 *
 * Consumed by: useMemberPurpose, PurposeCard
 * Future consumers: Organization Studio, AI Assistant
 */

import type {
  PurposeProjection,
  RawMemberProfile,
  RawActivityData,
} from "./types";

// ── Chapter definitions ───────────────────────────────────────────────────────

interface Chapter {
  label:            string;
  minMonths:        number;
  maxMonths:        number | null;
  requiresPaid?:    boolean;
  requiresInactive?: boolean;
}

const CHAPTERS: Chapter[] = [
  { label: "Getting Started",    minMonths: 0,  maxMonths: 3  },
  { label: "Finding My Footing", minMonths: 3,  maxMonths: 6  },
  { label: "Active Contributor", minMonths: 6,  maxMonths: 12 },
  { label: "Established Member", minMonths: 12, maxMonths: 24 },
  { label: "Cooperative Pillar", minMonths: 24, maxMonths: null },
];

function resolveChapter(tenureMonths: number): string {
  for (const chapter of CHAPTERS) {
    const withinMax =
      chapter.maxMonths === null || tenureMonths < chapter.maxMonths;
    if (tenureMonths >= chapter.minMonths && withinMax) {
      return chapter.label;
    }
  }
  return "Cooperative Pillar";
}

// ── Headline derivation ────────────────────────────────────────────────────────

function resolveHeadline(
  chapter: string,
  isPaidMember: boolean,
  isActive: boolean
): string {
  if (!isActive) {
    return "Reconnect with your cooperative purpose";
  }
  switch (chapter) {
    case "Getting Started":
      return "You are beginning your cooperative journey";
    case "Finding My Footing":
      return "You are finding your place in the cooperative";
    case "Active Contributor":
      return isPaidMember
        ? "You are an active cooperative contributor"
        : "You are growing your cooperative presence";
    case "Established Member":
      return "You are an established cooperative member";
    case "Cooperative Pillar":
      return "You are a pillar of this cooperative";
    default:
      return "You are part of something meaningful";
  }
}

// ── Statement derivation ──────────────────────────────────────────────────────

function resolveStatement(
  chapter: string,
  isPaidMember: boolean,
  isActive: boolean
): string {
  if (!isActive) {
    return (
      "Your cooperative membership is waiting for you. " +
      "Reconnecting takes just a moment and keeps your earning potential intact."
    );
  }
  if (!isPaidMember) {
    return (
      "As a free member, you are building the foundation of your cooperative identity. " +
      "Upgrading to paid membership unlocks unlimited earning potential and full community access."
    );
  }
  switch (chapter) {
    case "Getting Started":
      return (
        "Welcome to the Lambsbook Cooperative. Your first weeks are about discovery — " +
        "exploring earning programs, connecting with your invitor, and understanding " +
        "how the cooperative works for you."
      );
    case "Finding My Footing":
      return (
        "You have passed your first weeks and are beginning to understand the rhythm " +
        "of cooperative life. This is the time to deepen your participation and invite " +
        "others you trust."
      );
    case "Active Contributor":
      return (
        "You are an active, contributing member. Your participation directly strengthens " +
        "the cooperative and creates value for every member in your network."
      );
    case "Established Member":
      return (
        "Your tenure reflects real commitment to the cooperative mission. " +
        "Members like you are the backbone of sustainable cooperative growth."
      );
    case "Cooperative Pillar":
      return (
        "You have built a lasting cooperative presence. Your experience and network " +
        "are invaluable assets to every member you have welcomed into this community."
      );
    default:
      return "Your cooperative membership is a meaningful part of something larger.";
  }
}

// ── Value proposition ─────────────────────────────────────────────────────────

function resolveValueProposition(
  isPaidMember: boolean,
  isActive: boolean,
  isOnboarding: boolean
): string {
  if (!isActive) {
    return "Reactivate your account to restore your earning standing.";
  }
  if (isOnboarding && !isPaidMember) {
    return "Explore earning programs and discover how the cooperative works.";
  }
  if (isOnboarding && isPaidMember) {
    return "You are set up for full earning potential from day one.";
  }
  if (!isPaidMember) {
    return "Upgrade to paid membership to earn from all programs automatically.";
  }
  return "Your paid membership earns across all available cooperative programs.";
}

// ── Tenure calculation ────────────────────────────────────────────────────────

function tenureInMonths(joinDateIso: string): number {
  try {
    const join = new Date(joinDateIso);
    const now  = new Date();
    const diff =
      (now.getFullYear() - join.getFullYear()) * 12 +
      (now.getMonth()   - join.getMonth());
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function projectPurpose(
  profile:   RawMemberProfile | null | undefined,
  activity?: RawActivityData  | null,
): PurposeProjection {
  const member        = profile?.member ?? null;
  const isPaidMember  = member?.membership_status === "paid";
  const isActive      = (activity?.activity_status ?? member?.activity_status ?? "active") === "active";
  const joinDate      = member?.join_date ?? new Date().toISOString();
  const tenureMonths  = tenureInMonths(joinDate);
  const isOnboarding  = tenureMonths <= 3;
  const chapter       = resolveChapter(tenureMonths);
  const headline      = resolveHeadline(chapter, isPaidMember, isActive);
  const statement     = resolveStatement(chapter, isPaidMember, isActive);
  const valueProposition = resolveValueProposition(isPaidMember, isActive, isOnboarding);

  return {
    headline,
    statement,
    chapter,
    tenureMonths,
    isOnboarding,
    isPaidMember,
    isActive,
    valueProposition,
  };
}
