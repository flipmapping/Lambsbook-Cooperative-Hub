import { createClient, AuthApiError } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[Hub] Service role key not configured - auth features will be disabled');
} else {
  console.log('[Hub Auth] Running in Supabase mode - real magic links will be sent');
}

// Service role client for auth operations that create users (server-only)
const supabaseAuth = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Anon client for non-user-creation queries (respects RLS)
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
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
  username?: string;
  phone?: string;
  referrerEmail?: string;
}

// Validation schemas for signup
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signUpValidationSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Invalid email format'),
  fullName: z.string().min(1, 'Full name is required').max(255).optional(),
  username: z.string().regex(USERNAME_REGEX, 'Username must be 3-50 characters, alphanumeric with underscores/hyphens').optional(),
  phone: z.string().regex(PHONE_REGEX, 'Phone must be 7-15 digits with optional + prefix').optional(),
  referrerEmail: z.string().email().optional(),
});

// Custom error class for auth failures with actionable messages
export class HubAuthError extends Error {
  statusCode: number;
  originalError?: unknown;
  
  constructor(message: string, statusCode: number = 500, originalError?: unknown) {
    super(message);
    this.name = 'HubAuthError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export async function signUpMember(data: SignUpData) {
  // Server-side validation
  const validation = signUpValidationSchema.safeParse(data);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map(e => e.message).join(', ');
    throw new HubAuthError(errorMsg, 400);
  }

  if (!supabase) {
    throw new HubAuthError('Supabase not configured.', 503);
  }

  // Check if username is already taken
  if (data.username) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', data.username)
      .single();
    
    if (existingUser) {
      throw new HubAuthError('Username is already taken. Please choose a different one.', 400);
    }
  }

  // Validate referrer email exists if provided (but don't block signup)
  let referrerValid = false;
  let referrerId: string | null = null;
  if (data.referrerEmail) {
    try {
      const { data: referrer } = await supabase
        .from('members')
        .select('id, email')
        .eq('email', data.referrerEmail)
        .single();
      referrerValid = !!referrer;
      referrerId = referrer?.id || null;
    } catch (e) {
      console.warn('[Hub Auth] Referrer validation failed, continuing anyway:', e);
    }
  }

  // Send magic link via Supabase Auth (using service role client for user creation)
  if (!supabaseAuth) {
    throw new HubAuthError('Supabase auth not configured.', 503);
  }
  
  try {
    const { error } = await supabaseAuth.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || process.env.APP_URL || 'http://localhost:5000'}/hub/auth/callback?referrer=${encodeURIComponent(data.referrerEmail || '')}`,
        data: {
          full_name: data.fullName,
          username: data.username,
          phone: data.phone,
          referrer_id: referrerId,
        },
      },
    });

    if (error) {
      console.error('[Hub Auth] Supabase signInWithOtp error:', error);
      
      // Provide actionable error messages based on error type
      if (error instanceof AuthApiError) {
        if (error.code === 'unexpected_failure' || error.message.includes('sending')) {
          throw new HubAuthError(
            'Email service unavailable. Please check Supabase email configuration.',
            503,
            error
          );
        }
        if (error.code === 'over_email_send_rate_limit') {
          throw new HubAuthError(
            'Email rate limit reached. Please wait a few minutes before trying again.',
            429,
            error
          );
        }
        if (error.code === 'user_already_exists') {
          throw new HubAuthError(
            'An account with this email already exists. Please log in instead.',
            400,
            error
          );
        }
      }
      throw new HubAuthError(`Authentication failed: ${error.message}`, 500, error);
    }
  } catch (e) {
    if (e instanceof HubAuthError) throw e;
    console.error('[Hub Auth] Unexpected error during signup:', e);
    throw new HubAuthError('Failed to send magic link. Email service may be unavailable.', 503, e);
  }
  
  return { 
    success: true, 
    message: 'Magic link sent to ' + data.email,
    referrerEmail: data.referrerEmail || null,
    referrerValid
  };
}

// Update profile after successful auth callback
export async function updateProfileAfterAuth(userId: string, data: {
  email: string;
  fullName?: string;
  username?: string;
  phone?: string;
  referrerId?: string;
}) {
  if (!supabase) {
    throw new HubAuthError('Supabase not configured.', 503);
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: data.email,
        full_name: data.fullName,
        username: data.username,
        phone: data.phone,
        inviter_id: data.referrerId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Hub Auth] Profile update error:', error);
      throw error;
    }

    return { success: true };
  } catch (e) {
    console.error('[Hub Auth] Failed to update profile:', e);
    throw new HubAuthError('Failed to update profile', 500, e);
  }
}

// Link referrer to new member after successful authentication
export async function linkReferrer(memberEmail: string, referrerEmail: string) {
  if (!supabase) {
    throw new HubAuthError('Supabase not configured.', 503);
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
// Uses service role client to bypass RLS for internal lookups
export async function getMemberByEmail(email: string) {
  if (!supabaseAuth) return null;
  
  const { data, error } = await supabaseAuth
    .from('members')
    .select('id, email, full_name, invitor_id, member_type, activity_status')
    .eq('email', email)
    .single();
    
  if (error) {
    console.log('[Hub] getMemberByEmail error:', error.message);
    return null;
  }
  return data;
}

export async function loginMember(email: string) {
  if (!supabaseAuth) {
    throw new HubAuthError('Supabase auth not configured.', 503);
  }

  try {
    const { error } = await supabaseAuth.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || process.env.APP_URL || 'http://localhost:5000'}/hub/dashboard`,
      },
    });

    if (error) {
      console.error('[Hub Auth] Supabase login error:', error);
      
      if (error instanceof AuthApiError) {
        if (error.code === 'unexpected_failure' || error.message.includes('sending')) {
          throw new HubAuthError(
            'Email service unavailable. Please check Supabase email configuration.',
            503,
            error
          );
        }
        if (error.code === 'over_email_send_rate_limit') {
          throw new HubAuthError(
            'Email rate limit reached. Please wait a few minutes.',
            429,
            error
          );
        }
      }
      throw new HubAuthError(`Login failed: ${error.message}`, 500, error);
    }
  } catch (e) {
    if (e instanceof HubAuthError) throw e;
    console.error('[Hub Auth] Unexpected login error:', e);
    throw new HubAuthError('Failed to send magic link.', 503, e);
  }

  return { success: true, message: 'Magic link sent to ' + email };
}
