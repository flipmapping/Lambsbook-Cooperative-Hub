import { getSupabaseAdmin, isSupabaseConfigured } from './supabase-client';
import type {
  Member, MemberInsert, MemberUpdate,
  Collaboration, CollaborationInsert, CollaborationUpdate,
  Program, ProgramInsert, ProgramUpdate,
  ProgramEligibility, ProgramEligibilityInsert, ProgramEligibilityUpdate,
  Subscription, SubscriptionInsert, SubscriptionUpdate,
  Tutor, TutorInsert, TutorUpdate,
  Earning, EarningInsert, EarningUpdate,
  ActivityLog, ActivityLogInsert,
  GatewayInvitation, GatewayInvitationInsert,
  Prospect, ProspectInsert,
  Funnel, FunnelInsert, ProspectJourney, ProspectJourneyInsert,
  ProspectLifecycleEvent, ProspectLifecycleEventInsert,
  ProspectActivity, ProspectActivityInsert,
  FollowupTask, FollowupTaskInsert, FollowupTaskUpdate,
  ProspectAppointment, ProspectAppointmentInsert, ProspectAppointmentUpdate,
  ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate,
  AdmissionDecision, AdmissionDecisionInsert,
  TutorStatus
} from './supabase-types';

export class SupabaseDAL {
  private ensureConfigured() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
  }

  async createMember(data: MemberInsert): Promise<Member> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: member, error } = await supabase
      .schema('meh').from('members')
      .insert({
        member_type: data.member_type,
        membership_status: data.membership_status || 'free',
        subscription_price_at_signup: data.subscription_price_at_signup ?? null,
        subscription_renewal_date: data.subscription_renewal_date ?? null,
        invitor_id: data.invitor_id ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create member: ${error.message}`);
    return member;
  }

  async createProspect(data: ProspectInsert): Promise<Prospect> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: prospect, error } = await supabase
      .schema('growth').from('prospects')
      .insert({
        full_name: data.full_name,
        email: data.email,
        country: data.country,
        program_of_interest: data.program_of_interest,
        phone: data.phone ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create prospect: ${error.message}`);
    return prospect;
  }

  async getFunnelByCode(code: string): Promise<Funnel | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('funnels')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle();

    if (error) throw new Error(`Failed to get funnel: ${error.message}`);
    return data;
  }

  async createProspectJourney(data: ProspectJourneyInsert): Promise<ProspectJourney> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: journey, error } = await supabase
      .schema('growth').from('prospect_journeys')
      .insert({
        prospect_id: data.prospect_id,
        funnel_id:   data.funnel_id,
        current_stage: data.current_stage ?? 'registered',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create prospect journey: ${error.message}`);
    return journey;
  }

  async listProspects(): Promise<Array<{
    id: string;
    full_name: string;
    email: string;
    country: string;
    program_of_interest: string;
    phone: string | null;
    created_at: string;
    funnel_code: string | null;
    current_stage: string | null;
  }>> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('prospects')
      .select(`
        id,
        full_name,
        email,
        country,
        program_of_interest,
        phone,
        created_at,
        prospect_journeys ( current_stage, funnels ( code ) )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to list prospects: ${error.message}`);

    return (data ?? []).map((row: any) => ({
      id:                  row.id,
      full_name:           row.full_name,
      email:               row.email,
      country:             row.country,
      program_of_interest: row.program_of_interest,
      phone:               row.phone ?? null,
      created_at:          row.created_at,
      funnel_code:         row.prospect_journeys?.[0]?.funnels?.code ?? null,
      current_stage:       row.prospect_journeys?.[0]?.current_stage ?? null,
    }));
  }

  async getProspect(id: string): Promise<{
    id: string;
    full_name: string;
    email: string;
    country: string;
    program_of_interest: string;
    phone: string | null;
    created_at: string;
    funnel_code: string | null;
    current_stage: string | null;
  } | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('prospects')
      .select(`
        id,
        full_name,
        email,
        country,
        program_of_interest,
        phone,
        created_at,
        prospect_journeys ( current_stage, funnels ( code ) )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to get prospect: ${error.message}`);
    if (!data) return null;

    return {
      id:                  data.id,
      full_name:           data.full_name,
      email:               data.email,
      country:             data.country,
      program_of_interest: data.program_of_interest,
      phone:               data.phone ?? null,
      created_at:          data.created_at,
      funnel_code:         data.prospect_journeys?.[0]?.funnels?.code ?? null,
      current_stage:       data.prospect_journeys?.[0]?.current_stage ?? null,
    };
  }

  async updateProspectJourneyStage(
    prospectId: string,
    stage: string,
  ): Promise<ProspectJourney | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('prospect_journeys')
      .update({ current_stage: stage })
      .eq('prospect_id', prospectId)
      .select()
      .maybeSingle();

    if (error) throw new Error(`Failed to update prospect journey stage: ${error.message}`);
    return data;
  }

  async recordLifecycleEvent(
    data: ProspectLifecycleEventInsert,
  ): Promise<ProspectLifecycleEvent> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: event, error } = await supabase
      .schema('growth').from('prospect_lifecycle_events')
      .insert({
        prospect_id: data.prospect_id,
        from_stage:  data.from_stage ?? null,
        to_stage:    data.to_stage,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to record lifecycle event: ${error.message}`);
    return event;
  }

  async listLifecycleEvents(
    prospectId: string,
  ): Promise<ProspectLifecycleEvent[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('prospect_lifecycle_events')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('recorded_at', { ascending: true });

    if (error) throw new Error(`Failed to list lifecycle events: ${error.message}`);
    return data ?? [];
  }

  async recordActivity(
    data: ProspectActivityInsert,
  ): Promise<ProspectActivity> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: activity, error } = await supabase
      .schema('growth').from('prospect_activities')
      .insert({
        prospect_id:   data.prospect_id,
        activity_type: data.activity_type,
        metadata:      data.metadata ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to record prospect activity: ${error.message}`);
    return activity;
  }

  async listActivities(
    prospectId: string,
  ): Promise<ProspectActivity[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('prospect_activities')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('recorded_at', { ascending: true });

    if (error) throw new Error(`Failed to list prospect activities: ${error.message}`);
    return data ?? [];
  }

  async createFollowupTask(
    data: FollowupTaskInsert,
  ): Promise<FollowupTask> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: task, error } = await supabase
      .schema('growth').from('prospect_followup_tasks')
      .insert({
        prospect_id:  data.prospect_id,
        title:        data.title,
        description:  data.description ?? null,
        due_at:     data.due_at ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create follow-up task: ${error.message}`);
    return task;
  }

  async listFollowupTasks(
    prospectId: string,
  ): Promise<FollowupTask[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('growth').from('prospect_followup_tasks')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to list follow-up tasks: ${error.message}`);
    return data ?? [];
  }

  async updateFollowupTask(
    taskId: string,
    data: FollowupTaskUpdate,
  ): Promise<FollowupTask> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: task, error } = await supabase
      .schema('growth').from('prospect_followup_tasks')
      .update({
        ...(data.title        !== undefined && { title: data.title }),
        ...(data.description  !== undefined && { description: data.description }),
        ...(data.due_at     !== undefined && { due_at: data.due_at }),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update follow-up task: ${error.message}`);
    return task;
  }

  async completeFollowupTask(taskId: string): Promise<FollowupTask> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: task, error } = await supabase
      .schema('growth').from('prospect_followup_tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete follow-up task: ${error.message}`);
    return task;
  }

  async createAppointment(
    data: ProspectAppointmentInsert,
  ): Promise<ProspectAppointment> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: appt, error } = await supabase
      .schema('growth').from('prospect_appointments')
      .insert({
        prospect_id:       data.prospect_id,
        title:             data.title,
        scheduled_at:      data.scheduled_at,
        duration_minutes:  data.duration_minutes ?? null,
        location:          data.location ?? null,
        description:             data.description ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create appointment: ${error.message}`);
    return appt;
  }

  async listAppointments(
    prospectId: string,
  ): Promise<ProspectAppointment[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .schema('growth').from('prospect_appointments')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('scheduled_at', { ascending: true });
    if (error) throw new Error(`Failed to list appointments: ${error.message}`);
    return data ?? [];
  }

  async updateAppointment(
    appointmentId: string,
    data: ProspectAppointmentUpdate,
  ): Promise<ProspectAppointment> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: appt, error } = await supabase
      .schema('growth').from('prospect_appointments')
      .update({
        ...(data.title            !== undefined && { title: data.title }),
        ...(data.scheduled_at     !== undefined && { scheduled_at: data.scheduled_at }),
        ...(data.duration_minutes !== undefined && { duration_minutes: data.duration_minutes }),
        ...(data.location         !== undefined && { location: data.location }),
        ...(data.description            !== undefined && { description: data.description }),
      })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update appointment: ${error.message}`);
    return appt;
  }

  async cancelAppointment(appointmentId: string): Promise<ProspectAppointment> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: appt, error } = await supabase
      .schema('growth').from('prospect_appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw new Error(`Failed to cancel appointment: ${error.message}`);
    return appt;
  }

  async completeAppointment(
    appointmentId: string,
    outcome: string,
    outcomeNotes?: string | null,
  ): Promise<ProspectAppointment> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: appt, error } = await supabase
      .schema('growth').from('prospect_appointments')
      .update({
        status:        'completed',
        outcome:       outcome,
        outcome_notes: outcomeNotes ?? null,
      })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw new Error(`Failed to complete appointment: ${error.message}`);
    return appt;
  }

  async createDocument(
    data: ProspectDocumentInsert,
  ): Promise<ProspectDocument> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: doc, error } = await supabase
      .schema('growth').from('prospect_documents')
      .insert({
        prospect_id:   data.prospect_id,
        document_type: data.document_type,
        file_name:     data.file_name,
        storage_path:   data.storage_path ?? null,
        description:         data.description ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return doc;
  }

  async listDocuments(
    prospectId: string,
  ): Promise<ProspectDocument[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .schema('growth').from('prospect_documents')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(`Failed to list documents: ${error.message}`);
    return data ?? [];
  }

  async updateDocument(
    documentId: string,
    data: ProspectDocumentUpdate,
  ): Promise<ProspectDocument> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: doc, error } = await supabase
      .schema('growth').from('prospect_documents')
      .update({
        ...(data.document_type !== undefined && { document_type: data.document_type }),
        ...(data.file_name     !== undefined && { file_name: data.file_name }),
        ...(data.storage_path   !== undefined && { storage_path: data.storage_path }),
        ...(data.description         !== undefined && { description: data.description }),
      })
      .eq('id', documentId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update document: ${error.message}`);
    return doc;
  }

  async archiveDocument(documentId: string): Promise<ProspectDocument> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: doc, error } = await supabase
      .schema('growth').from('prospect_documents')
      .update({ archived: true })
      .eq('id', documentId)
      .select()
      .single();
    if (error) throw new Error(`Failed to archive document: ${error.message}`);
    return doc;
  }

  async recordAdmissionDecision(
    data: AdmissionDecisionInsert,
  ): Promise<AdmissionDecision> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data: decision, error } = await supabase
      .schema('growth').from('prospect_admission_decisions')
      .insert({
        prospect_id:  data.prospect_id,
        decision:     data.decision,
        rationale:    data.rationale ?? null,
        decided_by:   data.decided_by ?? null,
        offer_ready:  data.offer_ready ?? false,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to record admission decision: ${error.message}`);
    return decision;
  }

  async listAdmissionDecisions(
    prospectId: string,
  ): Promise<AdmissionDecision[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .schema('growth').from('prospect_admission_decisions')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('decided_at', { ascending: true });
    if (error) throw new Error(`Failed to list admission decisions: ${error.message}`);
    return data ?? [];
  }

  async getMemberByUserId(userId: string): Promise<Member | null> {
    this.ensureConfigured();

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('meh')
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get member by user_id: ${error.message}`);
    }

    return data;
  }

  async getMemberById(id: string): Promise<Member | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('meh').from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get member: ${error.message}`);
    }
    return data;
  }

  async getAllMembers(): Promise<Member[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .schema('meh').from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get members: ${error.message}`);
    return data || [];
  }

  async updateMember(id: string, data: MemberUpdate): Promise<Member> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: member, error } = await supabase
      .schema('meh').from('members')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update member: ${error.message}`);
    return member;
  }

  async deleteMember(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .schema('meh').from('members')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete member: ${error.message}`);
  }

  async createCollaboration(data: CollaborationInsert): Promise<Collaboration> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    if (data.invitee_id === data.invitor_id) {
      throw new Error('A member cannot collaborate with themselves');
    }

    const existing = await this.getCollaborationByInvitee(data.invitee_id);
    if (existing) {
      throw new Error('This member already has an invitor - each invitee can only have one invitor');
    }

    const { data: collab, error } = await supabase
      .from('collaborations')
      .insert({
        invitee_id: data.invitee_id,
        invitor_id: data.invitor_id,
        linked_by: data.linked_by,
        status: data.status || 'active',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create collaboration: ${error.message}`);
    return collab;
  }

  async getCollaborationById(id: string): Promise<Collaboration | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get collaboration: ${error.message}`);
    }
    return data;
  }

  async getCollaborationByInvitee(inviteeId: string): Promise<Collaboration | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .eq('invitee_id', inviteeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get collaboration: ${error.message}`);
    }
    return data;
  }

  async getCollaborationsByInvitor(invitorId: string): Promise<Collaboration[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .eq('invitor_id', invitorId)
      .order('linked_at', { ascending: false });

    if (error) throw new Error(`Failed to get collaborations: ${error.message}`);
    return data || [];
  }

  async getAllCollaborations(): Promise<Collaboration[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('collaborations')
      .select('*')
      .order('linked_at', { ascending: false });

    if (error) throw new Error(`Failed to get collaborations: ${error.message}`);
    return data || [];
  }

  async updateCollaboration(id: string, data: CollaborationUpdate): Promise<Collaboration> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: collab, error } = await supabase
      .from('collaborations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update collaboration: ${error.message}`);
    return collab;
  }

  async deleteCollaboration(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('collaborations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete collaboration: ${error.message}`);
  }

  async createProgram(data: ProgramInsert): Promise<Program> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: program, error } = await supabase
      .from('programs')
      .insert({
        program_id: data.program_id,
        name: data.name,
        sbu_id: data.sbu_id ?? data.sbu,
        program_type: data.program_type ?? null,
        description: data.description ?? null,
        revenue_base: data.revenue_base,
        trigger_condition: data.trigger_condition,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create program: ${error.message}`);
    return program;
  }

  async getProgramById(id: string): Promise<Program | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get program: ${error.message}`);
    }
    return data;
  }

  async getAllPrograms(): Promise<Program[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name');

    if (error) throw new Error(`Failed to get programs: ${error.message}`);
    return data || [];
  }

  async getProgramsBySBU(sbu: string): Promise<Program[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('sbu_id', sbu)
      .order('name');

    if (error) throw new Error(`Failed to get programs: ${error.message}`);
    return data || [];
  }

  async updateProgram(id: string, data: ProgramUpdate): Promise<Program> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const {
      program_id,
      sbu,
      ...updateData
    } = data;

    const normalizedUpdateData = {
      ...updateData,
      ...(updateData.sbu_id === undefined && sbu !== undefined
        ? { sbu_id: sbu }
        : {})
    };

    const { data: program, error } = await supabase
      .from('programs')
      .update(normalizedUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update program: ${error.message}`);
    return program;
  }

  async deleteProgram(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete program: ${error.message}`);
  }

  async createProgramEligibility(data: ProgramEligibilityInsert): Promise<ProgramEligibility> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: eligibility, error } = await supabase
      .from('program_eligibility')
      .insert({
        member_id: data.member_id,
        program_id: data.program_id,
        eligible: data.eligible ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create program eligibility: ${error.message}`);
    return eligibility;
  }

  async getProgramEligibilityByMember(memberId: string): Promise<ProgramEligibility[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('program_eligibility')
      .select('*')
      .eq('member_id', memberId);

    if (error) throw new Error(`Failed to get program eligibility: ${error.message}`);
    return data || [];
  }

  async updateProgramEligibility(id: string, data: ProgramEligibilityUpdate): Promise<ProgramEligibility> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: eligibility, error } = await supabase
      .from('program_eligibility')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update program eligibility: ${error.message}`);
    return eligibility;
  }

  async deleteProgramEligibility(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('program_eligibility')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete program eligibility: ${error.message}`);
  }

  async createSubscription(data: SubscriptionInsert): Promise<Subscription> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        member_id: data.member_id,
        price: data.price,
        price_locked_at: data.price_locked_at,
        renewal_date: data.renewal_date,
        status: data.status,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create subscription: ${error.message}`);
    return subscription;
  }

  async getSubscriptionsByMember(memberId: string): Promise<Subscription[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('member_id', memberId)
      .order('renewal_date', { ascending: false });

    if (error) throw new Error(`Failed to get subscriptions: ${error.message}`);
    return data || [];
  }

  async updateSubscription(id: string, data: SubscriptionUpdate): Promise<Subscription> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update subscription: ${error.message}`);
    return subscription;
  }

  async deleteSubscription(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete subscription: ${error.message}`);
  }

  async createTutor(data: TutorInsert): Promise<Tutor> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: tutor, error } = await supabase
      .from('tutors')
      .insert({
        member_id: data.member_id,
        tutor_type: data.tutor_type,
        tutor_status: data.tutor_status || 'unverified',
        free_class_minutes_last_30_days: data.free_class_minutes_last_30_days ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create tutor: ${error.message}`);
    return tutor;
  }

  async getTutorById(id: string): Promise<Tutor | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get tutor: ${error.message}`);
    }
    return data;
  }

  async getTutorByMember(memberId: string): Promise<Tutor | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .eq('member_id', memberId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get tutor: ${error.message}`);
    }
    return data;
  }

  async getVisibleTutors(minStatus: TutorStatus = 'verified'): Promise<Tutor[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const statusHierarchy: TutorStatus[] = ['unverified', 'verified', 'partner_educator'];
    const minIndex = statusHierarchy.indexOf(minStatus);
    const visibleStatuses = statusHierarchy.slice(minIndex);

    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .in('tutor_status', visibleStatuses)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to get tutors: ${error.message}`);
    return data || [];
  }

  async getAllTutors(): Promise<Tutor[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to get tutors: ${error.message}`);
    return data || [];
  }

  async updateTutor(id: string, data: TutorUpdate): Promise<Tutor> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: tutor, error } = await supabase
      .from('tutors')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update tutor: ${error.message}`);
    return tutor;
  }

  async deleteTutor(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('tutors')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete tutor: ${error.message}`);
  }

  async createEarning(data: EarningInsert): Promise<Earning> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const member = await this.getMemberById(data.member_id);
    if (member && member.activity_status === 'inactive') {
      const earning = await this.insertEarningWithStatus(data, 'paused');
      return earning;
    }

    const sourceMember = await this.getMemberById(data.source_member_id);
    if (!sourceMember) {
      throw new Error('Source member not found');
    }

    const collaboration = await this.getCollaborationByInvitee(data.source_member_id);
    if (!collaboration || collaboration.invitor_id !== data.member_id) {
      throw new Error('Collaboration rewards can only flow from direct invitees');
    }

    const { data: earning, error } = await supabase
      .from('earnings')
      .insert({
        member_id: data.member_id,
        program_id: data.program_id,
        source_member_id: data.source_member_id,
        amount: data.amount,
        earning_status: data.earning_status || 'pending',
        period: data.period,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create earning: ${error.message}`);
    return earning;
  }

  private async insertEarningWithStatus(data: EarningInsert, status: 'pending' | 'paid' | 'paused'): Promise<Earning> {
    const supabase = getSupabaseAdmin();

    const { data: earning, error } = await supabase
      .from('earnings')
      .insert({
        member_id: data.member_id,
        program_id: data.program_id,
        source_member_id: data.source_member_id,
        amount: data.amount,
        earning_status: status,
        period: data.period,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create earning: ${error.message}`);
    return earning;
  }

  async getEarningById(id: string): Promise<Earning | null> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get earning: ${error.message}`);
    }
    return data;
  }

  async getEarningsByMember(memberId: string): Promise<Earning[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get earnings: ${error.message}`);
    return data || [];
  }

  async getAllEarnings(): Promise<Earning[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get earnings: ${error.message}`);
    return data || [];
  }

  async updateEarning(id: string, data: EarningUpdate): Promise<Earning> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: earning, error } = await supabase
      .from('earnings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update earning: ${error.message}`);
    return earning;
  }

  async pauseEarningsForInactiveMember(memberId: string): Promise<number> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('earnings')
      .update({ earning_status: 'paused' })
      .eq('member_id', memberId)
      .eq('earning_status', 'pending')
      .select();

    if (error) throw new Error(`Failed to pause earnings: ${error.message}`);
    return data?.length || 0;
  }

  async resumeEarningsForActiveMember(memberId: string): Promise<number> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('earnings')
      .update({ earning_status: 'pending' })
      .eq('member_id', memberId)
      .eq('earning_status', 'paused')
      .select();

    if (error) throw new Error(`Failed to resume earnings: ${error.message}`);
    return data?.length || 0;
  }

  async deleteEarning(id: string): Promise<void> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('earnings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete earning: ${error.message}`);
  }

  async createActivityLog(data: ActivityLogInsert): Promise<ActivityLog> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data: log, error } = await supabase
      .from('activity_logs')
      .insert({
        member_id: data.member_id,
        activity_type: data.activity_type,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create activity log: ${error.message}`);

    await this.updateMember(data.member_id, {
      last_activity_at: new Date().toISOString(),
      activity_status: 'active',
    });

    return log;
  }

  async getActivityLogsByMember(memberId: string, limit = 100): Promise<ActivityLog[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get activity logs: ${error.message}`);
    return data || [];
  }

  async getAllActivityLogs(limit = 500): Promise<ActivityLog[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get activity logs: ${error.message}`);
    return data || [];
  }

  async getDirectInvitees(invitorId: string): Promise<Member[]> {
    this.ensureConfigured();
    const supabase = getSupabaseAdmin();

    const collaborations = await this.getCollaborationsByInvitor(invitorId);
    const inviteeIds = collaborations.map(c => c.invitee_id);

    if (inviteeIds.length === 0) return [];

    const { data, error } = await supabase
      .schema('meh').from('members')
      .select('*')
      .in('id', inviteeIds);

    if (error) throw new Error(`Failed to get invitees: ${error.message}`);
    return data || [];
  }

  async createGatewayInvitation(
    data: GatewayInvitationInsert
  ): Promise<GatewayInvitation> {
    this.ensureConfigured();

    const supabase = getSupabaseAdmin();

    const { data: invitation, error } = await supabase
      .from('gateway_invitations')
      .insert({
        token: data.token,
        inviter_user_id: data.inviter_user_id,
        inviter_email: data.inviter_email,
        invited_email: data.invited_email ?? null,
        phone_number: data.phone_number ?? null,
        note: data.note ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create gateway invitation: ${error.message}`
      );
    }

    return invitation;
  }
}

export const supabaseDAL = new SupabaseDAL();
