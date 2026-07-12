
// server/services/admissions.ts
// Admissions Service — RMP-010E13
// Persistence via SupabaseDAL. Response contract preserved from RMP-010E11.
import { supabaseDAL } from '../lib/supabase-dal';

export interface ProspectRegistrationPayload {
  fullName: string;
  email: string;
  country: string;
  programOfInterest: string;
  phone?: string;
}

export interface ProspectRegistrationResult {
  accepted: true;
  status: "validated";
  message: "Prospect registration accepted for future persistence.";
}

const DEFAULT_FUNNEL_CODE = "CTBC-2026";

function resolveRegistrationFunnel(): string {
  return DEFAULT_FUNNEL_CODE;
}

export async function submitProspectRegistration(
  payload: ProspectRegistrationPayload,
): Promise<ProspectRegistrationResult> {
  const prospect = await supabaseDAL.createProspect({
    full_name:            payload.fullName,
    email:                payload.email,
    country:              payload.country,
    program_of_interest:  payload.programOfInterest,
    phone:                payload.phone ?? null,
  });

  const funnel = await supabaseDAL.getFunnelByCode(resolveRegistrationFunnel());

  if (funnel) {
    await supabaseDAL.createProspectJourney({
      prospect_id: prospect.id,
      funnel_id:   funnel.id,
      current_stage: 'registered',
    });
  }

  return {
    accepted: true,
    status: "validated",
    message: "Prospect registration accepted for future persistence.",
  };
}

export async function listProspects() {
  return supabaseDAL.listProspects();
}

export async function getProspect(id: string) {
  return supabaseDAL.getProspect(id);
}

export async function updateProspectStage(id: string, stage: string) {
  return supabaseDAL.updateProspectJourneyStage(id, stage);
}

export async function recordProspectLifecycleEvent(
  prospectId: string,
  fromStage: string | null,
  toStage: string,
) {
  return supabaseDAL.recordLifecycleEvent({
    prospect_id: prospectId,
    from_stage:  fromStage,
    to_stage:    toStage,
  });
}

export async function getProspectLifecycleEvents(prospectId: string) {
  return supabaseDAL.listLifecycleEvents(prospectId);
}

export async function recordProspectActivity(
  prospectId: string,
  activityType: string,
  metadata?: Record<string, unknown> | null,
) {
  return supabaseDAL.recordActivity({
    prospect_id:   prospectId,
    activity_type: activityType,
    metadata:      metadata ?? null,
  });
}

export async function getProspectActivities(prospectId: string) {
  return supabaseDAL.listActivities(prospectId);
}

export async function createProspectFollowupTask(
  prospectId: string,
  title: string,
  description?: string | null,
  dueDate?: string | null,
) {
  return supabaseDAL.createFollowupTask({
    prospect_id:  prospectId,
    title,
    description:  description ?? null,
    due_date:     dueDate ?? null,
  });
}

export async function getProspectFollowupTasks(prospectId: string) {
  return supabaseDAL.listFollowupTasks(prospectId);
}

export async function updateProspectFollowupTask(
  taskId: string,
  title?: string,
  description?: string | null,
  dueDate?: string | null,
) {
  return supabaseDAL.updateFollowupTask(taskId, {
    ...(title       !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(dueDate     !== undefined && { due_date: dueDate }),
  });
}

export async function completeProspectFollowupTask(taskId: string) {
  return supabaseDAL.completeFollowupTask(taskId);
}

export async function createProspectAppointment(
  prospectId: string,
  title: string,
  scheduledAt: string,
  durationMinutes?: number | null,
  location?: string | null,
  notes?: string | null,
) {
  return supabaseDAL.createAppointment({
    prospect_id:      prospectId,
    title,
    scheduled_at:     scheduledAt,
    duration_minutes: durationMinutes ?? null,
    location:         location ?? null,
    notes:            notes ?? null,
  });
}

export async function getProspectAppointments(prospectId: string) {
  return supabaseDAL.listAppointments(prospectId);
}

export async function updateProspectAppointment(
  appointmentId: string,
  title?: string,
  scheduledAt?: string,
  durationMinutes?: number | null,
  location?: string | null,
  notes?: string | null,
) {
  return supabaseDAL.updateAppointment(appointmentId, {
    ...(title            !== undefined && { title }),
    ...(scheduledAt      !== undefined && { scheduled_at: scheduledAt }),
    ...(durationMinutes  !== undefined && { duration_minutes: durationMinutes }),
    ...(location         !== undefined && { location }),
    ...(notes            !== undefined && { notes }),
  });
}

export async function cancelProspectAppointment(appointmentId: string) {
  return supabaseDAL.cancelAppointment(appointmentId);
}

export async function completeProspectAppointment(
  appointmentId: string,
  outcome: string,
  outcomeNotes?: string | null,
) {
  return supabaseDAL.completeAppointment(appointmentId, outcome, outcomeNotes ?? null);
}

export async function createProspectDocument(
  prospectId: string,
  documentType: string,
  fileName: string,
  storageUrl?: string | null,
  notes?: string | null,
) {
  return supabaseDAL.createDocument({
    prospect_id:   prospectId,
    document_type: documentType,
    file_name:     fileName,
    storage_url:   storageUrl ?? null,
    notes:         notes ?? null,
  });
}

export async function getProspectDocuments(prospectId: string) {
  return supabaseDAL.listDocuments(prospectId);
}

export async function updateProspectDocument(
  documentId: string,
  documentType?: string,
  fileName?: string,
  storageUrl?: string | null,
  notes?: string | null,
) {
  return supabaseDAL.updateDocument(documentId, {
    ...(documentType !== undefined && { document_type: documentType }),
    ...(fileName     !== undefined && { file_name: fileName }),
    ...(storageUrl   !== undefined && { storage_url: storageUrl }),
    ...(notes        !== undefined && { notes }),
  });
}

export async function archiveProspectDocument(documentId: string) {
  return supabaseDAL.archiveDocument(documentId);
}

export async function recordProspectAdmissionDecision(
  prospectId: string,
  decision: string,
  rationale?: string | null,
  decidedBy?: string | null,
  offerReady?: boolean,
) {
  return supabaseDAL.recordAdmissionDecision({
    prospect_id:  prospectId,
    decision,
    rationale:    rationale ?? null,
    decided_by:   decidedBy ?? null,
    offer_ready:  offerReady ?? false,
  });
}

export async function getProspectAdmissionDecisions(prospectId: string) {
  return supabaseDAL.listAdmissionDecisions(prospectId);
}
