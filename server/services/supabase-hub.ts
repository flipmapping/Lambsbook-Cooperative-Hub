import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured for Hub features');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Validation schemas for Hub entities
export const updateSBUSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  lead_name: z.string().max(255).nullable().optional(),
  lead_email: z.string().email().nullable().optional(),
  entity_name: z.string().max(255).nullable().optional(),
  status: z.enum(['active', 'planning', 'inactive', 'future']).optional(),
  financial_status: z.string().max(50).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
}).strict();

export const insertProgramSchema = z.object({
  program_id: z.string().min(1).max(50).regex(/^[A-Z0-9-]+$/, 'Program ID must be uppercase alphanumeric with dashes'),
  name: z.string().min(1).max(255),
  parent_program_id: z.string().max(50).nullable().optional(),
  sbu_id: z.string().uuid().nullable().optional(),
  program_type: z.enum(['course', 'workshop', 'service', 'product', 'package', 'consultation', 'tutoring']).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  base_price: z.number().min(0).nullable().optional(),
  price_currency: z.enum(['USD', 'VND', 'MYR', 'TWD']).nullable().optional(),
  duration_value: z.number().int().min(1).nullable().optional(),
  duration_unit: z.enum(['hours', 'days', 'weeks', 'months', 'years']).nullable().optional(),
  remainder_recipient: z.enum(['platform', 'tutor', 'partner']).default('platform'),
  is_active: z.boolean().default(true),
}).strict();

export const updateProgramSchema = insertProgramSchema.partial().omit({ program_id: true }).strict();

export const insertCommissionRuleSetSchema = z.object({
  set_name: z.string().min(1).max(255),
  program_id: z.string().max(50).nullable().optional(),
  apply_to_subprograms: z.boolean().default(true),
  remainder_recipient: z.enum(['platform', 'tutor', 'partner']).default('platform'),
  is_active: z.boolean().default(true),
}).strict();

export const insertCommissionRuleSchema = z.object({
  rule_set_id: z.string().uuid(),
  rule_name: z.string().min(1).max(255),
  recipient_role: z.enum(['collaborator_tier1', 'collaborator_tier2', 'partner', 'charity', 'tutor', 'platform']),
  commission_type: z.enum(['percentage', 'fixed']).default('percentage'),
  commission_value: z.number().min(0).max(100),
  priority: z.number().int().min(0).max(1000).default(100),
  is_active: z.boolean().default(true),
}).strict();

export async function getSBUs() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sbus')
    .select('*')
    .order('sbu_number');
  if (error) throw error;
  return data || [];
}

export async function updateSBU(id: string, updates: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('sbus')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPrograms() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function createProgram(program: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('programs')
    .insert(program)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProgram(id: string, updates: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('programs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('program_id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCommissionRuleSets() {
  if (!supabase) return [];
  const { data: ruleSets, error } = await supabase
    .from('commission_rule_sets')
    .select('*')
    .order('set_name');
  if (error) throw error;
  
  const { data: rules } = await supabase
    .from('commission_rules')
    .select('*')
    .order('priority');
  
  return (ruleSets || []).map(rs => ({
    ...rs,
    rules: (rules || []).filter(r => r.rule_set_id === rs.id)
  }));
}

export async function createCommissionRuleSet(ruleSet: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('commission_rule_sets')
    .insert(ruleSet)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCommissionRule(rule: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('commission_rules')
    .insert(rule)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCommissionRule(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('commission_rules')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
}

export async function getHubMembers() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name');
  if (error) throw error;
  return data || [];
}

export async function getTransactions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getEarnings() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Authentication functions
interface SignUpData {
  email: string;
  fullName?: string;
  referrerEmail?: string;
}

export async function signUpMember(data: SignUpData) {
  if (!supabase) {
    // Return success even without Supabase for demo purposes
    console.log('Supabase not configured - simulating magic link sent to:', data.email);
    return { 
      success: true, 
      message: 'Magic link sent to ' + data.email,
      referrerEmail: data.referrerEmail || null
    };
  }

  // Validate referrer email exists if provided (but don't block signup)
  let referrerValid = false;
  if (data.referrerEmail) {
    const { data: referrer } = await supabase
      .from('members')
      .select('id, email')
      .eq('email', data.referrerEmail)
      .single();
    referrerValid = !!referrer;
  }

  // Send magic link via Supabase Auth - ONLY email and redirect options
  // Do NOT include referrerEmail in auth metadata to avoid validation issues
  const { error } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:5000'}/hub/auth/callback?referrer=${encodeURIComponent(data.referrerEmail || '')}`,
      data: {
        full_name: data.fullName,
      },
    },
  });

  if (error) throw error;
  
  return { 
    success: true, 
    message: 'Magic link sent to ' + data.email,
    referrerEmail: data.referrerEmail || null,
    referrerValid
  };
}

// Link referrer to new member after successful authentication
export async function linkReferrer(memberEmail: string, referrerEmail: string) {
  if (!supabase) {
    console.log('Supabase not configured - simulating referrer link');
    return { success: true, message: 'Referrer linked (simulated)' };
  }

  // Find the referrer by email
  const { data: referrer, error: referrerError } = await supabase
    .from('members')
    .select('id, email, full_name')
    .eq('email', referrerEmail)
    .single();

  if (referrerError || !referrer) {
    return { success: false, error: 'Referrer not found with that email address' };
  }

  // Find the new member
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, inviter_id')
    .eq('email', memberEmail)
    .single();

  if (memberError || !member) {
    return { success: false, error: 'Member not found' };
  }

  // Check if already linked
  if (member.inviter_id) {
    return { success: false, error: 'Already linked to a referrer' };
  }

  // Update member with inviter_id
  const { error: updateError } = await supabase
    .from('members')
    .update({ inviter_id: referrer.id, updated_at: new Date().toISOString() })
    .eq('id', member.id);

  if (updateError) throw updateError;

  return { 
    success: true, 
    message: `Successfully linked to referrer: ${referrer.full_name || referrer.email}`,
    referrer: { id: referrer.id, email: referrer.email, name: referrer.full_name }
  };
}

// Get member by email (for validating referrer)
export async function getMemberByEmail(email: string) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('members')
    .select('id, email, full_name')
    .eq('email', email)
    .single();
    
  if (error) return null;
  return data;
}

export async function loginMember(email: string) {
  if (!supabase) {
    // Return success even without Supabase for demo purposes
    console.log('Supabase not configured - simulating magic link sent to:', email);
    return { success: true, message: 'Magic link sent to ' + email };
  }

  // Send magic link via Supabase Auth
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:5000'}/hub/dashboard`,
    },
  });

  if (error) throw error;
  return { success: true, message: 'Magic link sent to ' + email };
}
