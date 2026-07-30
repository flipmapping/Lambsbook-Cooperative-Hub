export type MembershipStatus = 'free' | 'paid';
export type ActivityStatus = 'active' | 'inactive';
export type CollaborationStatus = 'active' | 'paused';
export type LinkedByType = 'invitee' | 'invitor' | 'admin';
export type RevenueBase = 'fee' | 'sales' | 'gross_margin';
export type TriggerCondition = 'payment' | 'attendance' | 'completion' | 'conversion';
export type TutorType = 'school' | 'freelance' | 'volunteer';
export type TutorStatus = 'unverified' | 'verified' | 'partner_educator';
export type EarningStatus = 'pending' | 'paid' | 'paused';

export interface Member {
  id: string;
  user_id: string | null;
  member_type: string;
  membership_status: MembershipStatus;
  subscription_price_at_signup: number | null;
  subscription_renewal_date: string | null;
  join_date: string;
  last_activity_at: string | null;
  activity_status: ActivityStatus;
  invitor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberInsert {
  member_type: string;
  membership_status?: MembershipStatus;
  subscription_price_at_signup?: number | null;
  subscription_renewal_date?: string | null;
  invitor_id?: string | null;
}

export interface MemberUpdate {
  member_type?: string;
  membership_status?: MembershipStatus;
  subscription_price_at_signup?: number | null;
  subscription_renewal_date?: string | null;
  last_activity_at?: string | null;
  activity_status?: ActivityStatus;
}

export interface Collaboration {
  id: string;
  invitee_id: string;
  invitor_id: string;
  linked_at: string;
  linked_by: LinkedByType;
  status: CollaborationStatus;
}

export interface CollaborationInsert {
  invitee_id: string;
  invitor_id: string;
  linked_by: LinkedByType;
  status?: CollaborationStatus;
}

export interface CollaborationUpdate {
  status?: CollaborationStatus;
}

export interface Program {
  id: string;
  program_id: string;
  name: string;

  sbu_id: string;

  // compatibility alias
  sbu?: string;

  program_type: string | null;
  description: string | null;

  revenue_base: RevenueBase;
  trigger_condition: TriggerCondition;
  is_active: boolean;
  created_at: string;
}

export interface ProgramInsert {
  program_id: string;

  name: string;

  sbu_id?: string;

  // compatibility alias
  sbu?: string;

  program_type?: string | null;
  description?: string | null;

  revenue_base: RevenueBase;
  trigger_condition: TriggerCondition;
  is_active?: boolean;
}

export interface ProgramUpdate {
  program_id?: string;

  name?: string;

  sbu_id?: string;

  // compatibility alias
  sbu?: string;

  program_type?: string | null;
  description?: string | null;

  revenue_base?: RevenueBase;
  trigger_condition?: TriggerCondition;
  is_active?: boolean;
}

export interface ProgramEligibility {
  id: string;
  member_id: string;
  program_id: string;
  eligible: boolean;
  assigned_at: string;
}

export interface ProgramEligibilityInsert {
  member_id: string;
  program_id: string;
  eligible?: boolean;
}

export interface ProgramEligibilityUpdate {
  eligible?: boolean;
}

export interface Subscription {
  id: string;
  member_id: string;
  price: number;
  price_locked_at: string;
  renewal_date: string;
  status: string;
}

export interface SubscriptionInsert {
  member_id: string;
  price: number;
  price_locked_at: string;
  renewal_date: string;
  status: string;
}

export interface SubscriptionUpdate {
  price?: number;
  price_locked_at?: string;
  renewal_date?: string;
  status?: string;
}

export interface Tutor {
  id: string;
  member_id: string;
  tutor_type: TutorType;
  tutor_status: TutorStatus;
  free_class_minutes_last_30_days: number;
  updated_at: string;
}

export interface TutorInsert {
  member_id: string;
  tutor_type: TutorType;
  tutor_status?: TutorStatus;
  free_class_minutes_last_30_days?: number;
}

export interface TutorUpdate {
  tutor_type?: TutorType;
  tutor_status?: TutorStatus;
  free_class_minutes_last_30_days?: number;
}

export interface Earning {
  id: string;
  member_id: string;
  program_id: string;
  source_member_id: string;
  amount: number;
  earning_status: EarningStatus;
  period: string;
  created_at: string;
}

export interface EarningInsert {
  member_id: string;
  program_id: string;
  source_member_id: string;
  amount: number;
  earning_status?: EarningStatus;
  period: string;
}

export interface EarningUpdate {
  amount?: number;
  earning_status?: EarningStatus;
  period?: string;
}

export interface ActivityLog {
  id: string;
  member_id: string;
  activity_type: string;
  created_at: string;
}

export interface ActivityLogInsert {
  member_id: string;
  activity_type: string;
}

export interface GatewayInvitation {
  id: string;
  token: string;
  inviter_user_id: string;
  inviter_email: string;
  status: string;
  expires_at: string;
  accepted_by_user_id: string | null;
  accepted_by_email: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface GatewayInvitationInsert {
  token: string;
  inviter_user_id: string;
  inviter_email: string;
  invited_email?: string | null;
  phone_number?: string | null;
  note?: string | null;
}

export interface Prospect {
  id: string;
  full_name: string;
  email: string;
  country: string;
  program_of_interest: string;
  phone: string | null;
  created_at: string;
}

export interface ProspectInsert {
  full_name: string;
  email: string;
  country: string;
  program_of_interest: string;
  phone?: string | null;
}
export interface Funnel {
  id: string;
  code: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface FunnelInsert {
  code: string;
  name: string;
  active?: boolean;
}

export interface ProspectJourney {
  id: string;
  prospect_id: string;
  funnel_id: string;
  current_stage: string;
  created_at: string;
}

export interface ProspectJourneyInsert {
  prospect_id: string;
  funnel_id: string;
  current_stage?: string;
}

export interface ProspectLifecycleEvent {
  id: string;
  prospect_id: string;
  from_stage: string | null;
  to_stage: string;
  recorded_at: string;
}

export interface ProspectLifecycleEventInsert {
  prospect_id: string;
  from_stage?: string | null;
  to_stage: string;
}

export interface ProspectActivity {
  id: string;
  prospect_id: string;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  recorded_at: string;
}

export interface ProspectActivityInsert {
  prospect_id: string;
  activity_type: string;
  metadata?: Record<string, unknown> | null;
}

export interface FollowupTask {
  id: string;
  prospect_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface FollowupTaskInsert {
  prospect_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
}

export interface FollowupTaskUpdate {
  title?: string;
  description?: string | null;
  due_date?: string | null;
}

export interface ProspectAppointment {
  id: string;
  prospect_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  notes: string | null;
  status: string;
  outcome: string | null;
  outcome_notes: string | null;
  created_at: string;
}

export interface ProspectAppointmentInsert {
  prospect_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes?: number | null;
  location?: string | null;
  notes?: string | null;
}

export interface ProspectAppointmentUpdate {
  title?: string;
  scheduled_at?: string;
  duration_minutes?: number | null;
  location?: string | null;
  notes?: string | null;
}

export interface ProspectDocument {
  id: string;
  prospect_id: string;
  document_type: string;
  file_name: string;
  storage_url: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
}

export interface ProspectDocumentInsert {
  prospect_id: string;
  document_type: string;
  file_name: string;
  storage_url?: string | null;
  notes?: string | null;
}

export interface ProspectDocumentUpdate {
  document_type?: string;
  file_name?: string;
  storage_url?: string | null;
  notes?: string | null;
}

export interface AdmissionDecision {
  id: string;
  prospect_id: string;
  decision: string;
  rationale: string | null;
  decided_by: string | null;
  offer_ready: boolean;
  decided_at: string;
}

export interface AdmissionDecisionInsert {
  prospect_id: string;
  decision: string;
  rationale?: string | null;
  decided_by?: string | null;
  offer_ready?: boolean;
}