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
