export type DashboardEntryState =
  | "loading"
  | "unauthenticated"
  | "member"
  | "invited_pending_acceptance"
  | "non_member_no_invitation"
  | "error";

export type InteractionCapability = {
  canSubmitIdea: boolean;
  canJoinDiscussion: boolean;
  canShowSupport: boolean;
  canConsiderAdoption: boolean;
  explanation: string;
};

export type LocalFeedback = {
  id: string;
  message: string;
  tone: string;
};

export type HeroFeedback = {
  title: string;
  summary: string;
  chipLabel: string;
};

export type PipelineItem = any;
export type PipelineViewMode = string;
export type CooperativeActivityItem = any;
