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
  name: string;
  sbu: string;
  revenue_base: RevenueBase;
  trigger_condition: TriggerCondition;
  is_active: boolean;
  created_at: string;
}

export interface ProgramInsert {
  name: string;
  sbu: string;
  revenue_base: RevenueBase;
  trigger_condition: TriggerCondition;
  is_active?: boolean;
}

export interface ProgramUpdate {
  name?: string;
  sbu?: string;
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
