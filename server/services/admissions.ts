
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
