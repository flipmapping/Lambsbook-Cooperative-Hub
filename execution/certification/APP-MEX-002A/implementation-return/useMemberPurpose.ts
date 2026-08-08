/**
 * useMemberPurpose Hook
 * Authority: APP-MEX-002A
 *
 * Composes Purpose and Identity projections from the member's live API data.
 * Consumed by: MemberHub, PurposeCard, IdentityCard
 *
 * Contract:
 * - Accepts raw profile, activity, and relationships data already loaded by the parent.
 * - Returns memoised projections. Re-projects only when inputs change.
 * - Zero API calls. Zero side effects. Pure derivation.
 */

import { useMemo } from "react";

import { projectPurpose }  from "@/lib/member-purpose/purposeProjection";
import { projectIdentity } from "@/lib/member-purpose/identityProjection";

import type {
  PurposeProjection,
  IdentityProjection,
  RawMemberProfile,
  RawActivityData,
  RawRelationshipsData,
} from "@/lib/member-purpose/types";

export interface MemberPurposeResult {
  purpose:  PurposeProjection  | null;
  identity: IdentityProjection | null;
  /** True while inputs are still loading */
  isLoading: boolean;
}

export interface UseMemberPurposeInput {
  profile?:       RawMemberProfile    | null;
  activity?:      RawActivityData     | null;
  relationships?: RawRelationshipsData | null;
  isLoading?:     boolean;
}

export function useMemberPurpose({
  profile,
  activity,
  relationships,
  isLoading = false,
}: UseMemberPurposeInput): MemberPurposeResult {

  const purpose = useMemo(() => {
    if (!profile?.member) return null;
    return projectPurpose(profile, activity);
  }, [profile, activity]);

  const identity = useMemo(() => {
    if (!profile?.member) return null;
    return projectIdentity(profile, activity, relationships);
  }, [profile, activity, relationships]);

  return { purpose, identity, isLoading };
}
