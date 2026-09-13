import type {
  CommunicationResolution,
  InsertCommunicationResolution,
} from "@shared/schema";
import { storage } from "../storage";

export interface ResolveCommunicationInput {
  intentId: string;
  traceId: string;
  organizationId: string | null;
  communicationProfileId?: string | null;
  communicationPolicyId?: string | null;
  language?: string | null;
}

export async function resolveCommunication(
  input: ResolveCommunicationInput,
): Promise<CommunicationResolution> {
  const language = input.language ?? "en";

  const resolution: InsertCommunicationResolution = {
    intentId: input.intentId,
    traceId: input.traceId,
    organizationId: input.organizationId,
    communicationProfileId: input.communicationProfileId ?? null,
    communicationPolicyId: input.communicationPolicyId ?? null,
    templateKey: "member-invitation",
    templateVersion: "1",
    resolvedChannel: "email",
    resolvedProvider: "Resend",
    resolvedLanguage: language,
  };

  return storage.createCommunicationResolution(resolution);
}
