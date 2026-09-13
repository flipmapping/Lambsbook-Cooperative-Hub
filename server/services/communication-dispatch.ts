import { randomUUID } from "node:crypto";
import type {
  CommunicationDispatch,
  CommunicationRecord,
  InsertCommunicationDispatch,
  InsertCommunicationRecord,
} from "@shared/schema";
import { storage } from "../storage";

export interface DispatchCommunicationInput {
  intentId: string;
  resolutionId: string;
  traceId: string;
  organizationId: string | null;
  communicationProfileId?: string | null;
  templateKey: string;
  templateVersion: string;
  selectedProvider: string;
  selectedChannel: string;
  priority?: number;
  dispatchAfter?: Date | null;
  decisionReason?: string | null;
}

export interface DispatchCommunicationResult {
  dispatch: CommunicationDispatch;
  record: CommunicationRecord;
}

export async function dispatchCommunication(
  input: DispatchCommunicationInput,
): Promise<DispatchCommunicationResult> {
  const recordId = randomUUID();

  const dispatch: InsertCommunicationDispatch = {
    recordId,
    resolutionId: input.resolutionId,
    traceId: input.traceId,
    organizationId: input.organizationId,
    approvedChannel: input.selectedChannel,
    approvedProvider: input.selectedProvider,
    dispatchAfter: input.dispatchAfter ?? null,
    priority: input.priority ?? 0,
    decisionReason: input.decisionReason ?? null,
  };

  const createdDispatch = await storage.createCommunicationDispatch(dispatch);

  const record: InsertCommunicationRecord = {
    recordId,
    intentId: input.intentId,
    dispatchId: createdDispatch.dispatchId,
    traceId: input.traceId,
    organizationId: input.organizationId,
    communicationProfileId: input.communicationProfileId ?? null,
    templateKey: input.templateKey,
    templateVersion: input.templateVersion,
    selectedProvider: input.selectedProvider,
    selectedChannel: input.selectedChannel,
    runtimeStatus: "queued",
  };

  const createdRecord = await storage.createCommunicationRecord(record);

  return {
    dispatch: createdDispatch,
    record: createdRecord,
  };
}
