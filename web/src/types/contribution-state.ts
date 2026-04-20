import type { Contribution, PipelineStage } from "@/types/contribution";

export const ALLOWED_PIPELINE_STATES: readonly PipelineStage[] = [
  "expressed",
  "acknowledged",
  "engaged",
  "materialized",
  "archived",
] as const;

export const TERMINAL_STATES: readonly PipelineStage[] = [
  "materialized",
  "archived",
] as const;

export const VISIBLE_STAGE_TRANSITIONS: Readonly<
  Record<PipelineStage, readonly PipelineStage[]>
> = {
  expressed: ["acknowledged", "archived"],
  acknowledged: ["engaged", "expressed", "archived"],
  engaged: ["materialized", "acknowledged", "archived"],
  materialized: ["engaged", "archived"],
  archived: [],
} as const;

export interface ElevationReadiness {
  hasInitiator: boolean;
  seconderCount: number;
  meetsMinimumSeconders: boolean;
  canEnterPipeline: boolean;
}

export function getElevationReadiness(contribution: Contribution): ElevationReadiness {
  const hasInitiator = Boolean(contribution.initiator?.memberId);
  const seconderCount = contribution.seconders.length;
  const meetsMinimumSeconders = seconderCount >= 2;

  return {
    hasInitiator,
    seconderCount,
    meetsMinimumSeconders,
    canEnterPipeline: hasInitiator && meetsMinimumSeconders,
  };
}

export function getStageProgressionConditions(stage: PipelineStage): string[] {
  switch (stage) {
    case "expressed":
      return [
        "Contribution has entered pipeline",
        "Initiator is recorded",
        "At least 2 seconders are recorded",
      ];
    case "acknowledged":
      return [
        "Partner confirmation is recorded",
        "Contribution has visible supporting evidence",
      ];
    case "engaged":
      return [
        "Active partner involvement is recorded",
        "Meaningful evidence supports ongoing work",
      ];
    case "materialized":
      return [
        "Outcome is recorded",
        "Materialized evidence is present",
      ];
    case "archived":
      return [
        "Contribution is intentionally closed from active progression",
      ];
    default:
      return [];
  }
}

export function isInPipeline(contribution: Contribution): boolean {
  return Boolean(contribution.pipelineStage);
}

export function canEnterExpressed(contribution: Contribution): boolean {
  if (contribution.pipelineStage) return false;
  const readiness = getElevationReadiness(contribution);
  return readiness.canEnterPipeline;
}

export function canTransitionToAcknowledged(contribution: Contribution): boolean {
  if (contribution.pipelineStage !== "expressed") return false;
  return contribution.partners.length > 0 && contribution.evidence.length > 0;
}

export function canTransitionToEngaged(contribution: Contribution): boolean {
  if (contribution.pipelineStage !== "acknowledged") return false;
  return contribution.partners.length > 0 && contribution.evidence.length > 0;
}

export function canTransitionToMaterialized(contribution: Contribution): boolean {
  if (contribution.pipelineStage !== "engaged") return false;
  return contribution.evidence.length > 0 && Boolean(contribution.materializedOutcome);
}

export function canTransitionToArchived(contribution: Contribution): boolean {
  if (!contribution.pipelineStage) return false;
  return contribution.pipelineStage !== "archived";
}

export interface ReversalViewModel {
  isReversal: boolean;
  fromStage?: PipelineStage;
  toStage?: PipelineStage;
  reason?: string;
  requestedAt?: string;
}

export function toReversalViewModel(
  request?: {
    fromStage: PipelineStage;
    toStage: PipelineStage;
    reason: string;
    requestedAt: string;
  }
): ReversalViewModel {
  if (!request) {
    return { isReversal: false };
  }

  return {
    isReversal: true,
    fromStage: request.fromStage,
    toStage: request.toStage,
    reason: request.reason,
    requestedAt: request.requestedAt,
  };
}
