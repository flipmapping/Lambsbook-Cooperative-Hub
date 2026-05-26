import type {
  Contribution,
  ContributionType,
  PipelineStage,
  ReversalRequest,
  TransitionRequest,
} from "@/types/contribution";

export interface CreateContributionInput {
  title: string;
  description: string;
  contributionType: ContributionType;
  createdByMemberId: string;
  createdByDisplayName: string;
}

export interface InitiateElevationInput {
  contributionId: string;
  actorMemberId: string;
  actorLabel: string;
  initiatedAt: string; // ISO datetime
  note?: string;
}

export interface SecondContributionInput {
  contributionId: string;
  seconderMemberId: string;
  seconderDisplayName: string;
  secondedAt: string; // ISO datetime
}

export interface ConfirmStageTransitionInput extends TransitionRequest {}

export interface RequestReversalInput extends ReversalRequest {}

export type MockContractError =
  | "INVALID_STATE"
  | "NOT_FOUND"
  | "INVALID_INPUT";

export type MockContractResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MockContractError };

export interface ContributionMockContract {
  createContribution(
    input: CreateContributionInput
  ): Promise<MockContractResult<Contribution>>;

  initiateElevation(
    input: InitiateElevationInput
  ): Promise<MockContractResult<Contribution>>;

  secondContribution(
    input: SecondContributionInput
  ): Promise<MockContractResult<Contribution>>;

  confirmStageTransition(
    input: ConfirmStageTransitionInput
  ): Promise<MockContractResult<Contribution>>;

  requestReversal(
    input: RequestReversalInput
  ): Promise<MockContractResult<Contribution>>;
}

export const STAGE_TRANSITION_RULES: Readonly<
  Record<PipelineStage, readonly PipelineStage[]>
> = {
  expressed: ["acknowledged", "archived"],
  acknowledged: ["engaged", "expressed", "archived"],
  engaged: ["materialized", "acknowledged", "archived"],
  materialized: ["engaged", "archived"],
  archived: [],
} as const;
