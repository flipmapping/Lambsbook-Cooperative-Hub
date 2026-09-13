import type {
  CommunicationRecord,
  InsertCommunicationRecord,
} from "@shared/schema";
import { storage } from "../storage";

export interface CreateCommunicationRecordInput {
  recordId: string;
  intentId: string;
  dispatchId: string;
  traceId: string;
  organizationId: string | null;
  communicationProfileId?: string | null;
  templateKey: string;
  templateVersion: string;
  selectedProvider: string;
  selectedChannel: string;
}

export async function createCommunicationRecord(
  input: CreateCommunicationRecordInput,
): Promise<CommunicationRecord> {
  const record: InsertCommunicationRecord = {
    recordId: input.recordId,
    intentId: input.intentId,
    dispatchId: input.dispatchId,
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
  if (!createdRecord) {
    throw new Error("Failed to create communication record");
  }
  return createdRecord;
}

export async function updateCommunicationRecordStatus(
  recordId: string,
  runtimeStatus: "delivered" | "failed",
): Promise<CommunicationRecord> {
  const updatedRecord = await storage.updateCommunicationRecord(recordId, {
    runtimeStatus,
  });
  if (!updatedRecord) {
    throw new Error("Failed to update communication record status");
  }
  return updatedRecord;
}
