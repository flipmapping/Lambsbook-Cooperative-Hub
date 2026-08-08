/**
 * Living Member Digital Twin — Shared Types
 * Authority: APP-MEX-002A
 *
 * These types define the semantic projection contracts consumed by:
 * - PurposeCard
 * - IdentityCard
 * - useMemberPurpose
 * - (future) Organization Studio, Growth Engine, Community Graph, AI Assistant
 *
 * Projection Before Ownership: projections compute derived semantic views
 * from raw member data. They own no business state.
 */

// ── Source data shapes ────────────────────────────────────────────────────────

export type MembershipStatus = "free" | "paid";
export type ActivityStatus   = "active" | "inactive";
export type MemberType       = "individual" | "institutional" | string;

export interface RawMemberProfile {
  user: { id: string; email: string };
  member: {
    id:                            string;
    member_type:                   MemberType;
    membership_status:             MembershipStatus;
    activity_status?:              ActivityStatus;
    join_date:                     string;
    last_activity_at?:             string | null;
    subscription_price_at_signup?: number | null;
    subscription_renewal_date?:    string | null;
  } | null;
  user_id?:        string;
  id?:             string;
  role?:           string;
  is_super_admin?: boolean;
}

export interface RawActivityData {
  activity_status:  ActivityStatus;
  last_activity_at: string | null;
  recent_logs:      Array<{ id: string; activity_type: string; created_at: string }>;
  warning?:         { message: string; consequence: string; action: string } | null;
  reactivation?:    { message: string; consequence: string; action: string } | null;
  inactivity_threshold?: string;
}

export interface RawRelationshipsData {
  invitor: {
    member_type?:  string | null;
    join_date?:    string | null;
    email?:        string | null;
  } | null;
  invitees: Array<{
    member_type?:     string | null;
    join_date?:       string | null;
    activity_status?: string | null;
    email?:           string | null;
  }>;
}

// ── Purpose Projection ────────────────────────────────────────────────────────

/**
 * PurposeProjection answers: "Why am I here?"
 *
 * Derived from membership tier, activity standing, and cooperative tenure.
 * Read-only semantic view. Owns no business state.
 */
export interface PurposeProjection {
  headline:         string;
  statement:        string;
  chapter:          string;
  tenureMonths:     number;
  isOnboarding:     boolean;
  isPaidMember:     boolean;
  isActive:         boolean;
  valueProposition: string;
}

// ── Identity Projection ───────────────────────────────────────────────────────

/**
 * IdentityProjection answers: "Who am I becoming?"
 *
 * Derived from membership tier, community standing, and relational network.
 * Read-only semantic view. Owns no business state.
 */
export interface IdentityProjection {
  tierLabel:         string;
  tierDescription:   string;
  progressScore:     number;
  nextTierLabel:     string | null;
  nextTierNarrative: string | null;
  networkDepth:      number;
  hasInvitor:        boolean;
  primaryAction:     IdentityAction;
}

export interface IdentityAction {
  label:       string;
  description: string;
  destination: string | null;
}
