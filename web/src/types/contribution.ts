export type ContributionType =
  | "service"
  | "resource"
  | "knowledge"
  | "introduction"
  | "coordination"
  | "hospitality"
  | "care"
  | "other";

export type PipelineStage =
  | "expressed"
  | "acknowledged"
  | "engaged"
  | "materialized"
  | "archived";

export interface Partner {
  id: string;
  displayName: string;
  isActive: boolean;
}

export interface Seconder {
  memberId: string;
  displayName: string;
  secondedAt: string; // ISO datetime
}

export interface MeaningfulEvidence {
  id: string;
  kind: "note" | "message_excerpt" | "link" | "file_placeholder" | "observation";
  label: string;
  value: string;
  addedAt: string; // ISO datetime
  addedByMemberId: string;
}

export interface StageHistoryEntry {
  id: string;
  stage: PipelineStage;
  changedAt: string; // ISO datetime
  changedByMemberId: string;
  actorLabel: string;
  note?: string;
}

export interface MaterializedOutcome {
  id: string;
  summary: string;
  recordedAt: string; // ISO datetime
  recordedByMemberId: string;
  notes?: string;
}

export interface ProgramLinkPlaceholder {
  linked: boolean;
  programId?: string;
  programLabel?: string;
  linkType?: "placeholder";
  note?: string;
}

export interface ContributionInitiator {
  memberId: string;
  displayName: string;
  initiatedAt: string; // ISO datetime
}

export interface Contribution {
  id: string;
  title: string;
  description: string;
  contributionType: ContributionType;

  pipelineStage?: PipelineStage;

  createdAt: string; // ISO datetime
  createdByMemberId: string;
  createdByDisplayName: string;

  initiator?: ContributionInitiator;
  partners: Partner[];
  seconders: Seconder[];

  evidence: MeaningfulEvidence[];
  stageHistory: StageHistoryEntry[];

  materializedOutcome?: MaterializedOutcome;
  programLink: ProgramLinkPlaceholder;
}

export interface TransitionRequest {
  contributionId: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  actorMemberId: string;
  actorLabel: string;
  note?: string;
}

export interface ReversalRequest {
  contributionId: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  requestedByMemberId: string;
  requestedByLabel: string;
  reason: string;
  requestedAt: string; // ISO datetime
}

export type ContributionContractGuarantee =
  | "NO_ECONOMIC_FIELDS"
  | "NO_EXECUTABLE_PROGRAM_LOGIC"
  | "NO_BACKEND_COUPLING"
  | "FAIL_CLOSED_STRUCTURE";
