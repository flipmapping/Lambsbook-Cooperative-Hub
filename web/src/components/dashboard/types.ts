export type DashboardEntryState =
  | "loading"
  | "unauthenticated"
  | "non_member_no_invitation"
  | "invited_pending_acceptance"
  | "member"
  | "error";

export type PipelineStageKey =
  | "idea"
  | "discussion"
  | "candidate"
  | "refinement"
  | "support"
  | "adoption"
  | "formalized";

export type PipelineItem = {
  id: string;
  title: string;
  summary: string;
  stage: PipelineStageKey;
  authorLabel: string;
  supportCount: number;
  discussionCount: number;
  isMemberActionable: boolean;
};

export type ContributionSummary = {
  ideasSubmitted: number;
  discussionsJoined: number;
  refinementsMade: number;
  supportsGiven: number;
};

export type CooperativeActivityItem = {
  id: string;
  type: "discussion" | "candidate" | "adoption" | "formalized_program" | "idea" | "support";
  title: string;
  summary: string;
  timestampLabel: string;
};

export type FormalizedProgram = {
  id: string;
  name: string;
  summary: string;
  statusLabel: string;
  subscriptionContextLabel?: string;
  creditContextLabel?: string;
};

export type RelationshipContext = {
  membershipLabel: string;
  invitationContextLabel?: string;
  trustMessage: string;
};

export type DashboardMockData = {
  heroTitle: string;
  heroDescription: string;
  pipelineItems: PipelineItem[];
  contributions: ContributionSummary;
  cooperativeActivity: CooperativeActivityItem[];
  programs: FormalizedProgram[];
  relationshipContext: RelationshipContext;
};

export const StageActionLabel: Record<PipelineStageKey, string> = {
  idea: "Join discussion",
  discussion: "Help clarify",
  candidate: "Review candidate",
  refinement: "Contribute refinement",
  support: "Show support",
  adoption: "Consider adoption",
  formalized: "View program",
};

export const StageMeaningLabel: Record<PipelineStageKey, string> = {
  idea: "Early concept being surfaced for shared visibility.",
  discussion: "Clarification and shared understanding are growing.",
  candidate: "The idea has clearer shape and review interest.",
  refinement: "The proposal is being improved in practical detail.",
  support: "Visible backing is gathering around the proposal.",
  adoption: "The cooperative is considering active commitment.",
  formalized: "The idea has become a formalized program outcome.",
};

export type PipelineViewMode =
  | "all"
  | "idea"
  | "discussion"
  | "candidate"
  | "refinement"
  | "support"
  | "adoption"
  | "formalized";

export type FeedbackTone = "success" | "info";

export type LocalFeedback = {
  id: string;
  message: string;
  tone: FeedbackTone;
};

export type HeroFeedback = {
  title: string;
  summary: string;
  chipLabel: string;
};

export type InteractionCapability = {
  canSubmitIdea: boolean;
  canJoinDiscussion: boolean;
  canShowSupport: boolean;
  canConsiderAdoption: boolean;
  explanation: string;
};
