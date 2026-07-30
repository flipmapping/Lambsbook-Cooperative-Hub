import { createClient, AuthApiError } from "@supabase/supabase-js";
import ws from "ws";
import { z } from "zod";
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "[Hub] Service role key not configured - auth features will be disabled",
  );
} else {
  console.log("[Hub Auth] Running in Supabase mode - real auth will be used");
}

/**
 * Service-role client for auth + internal server-side data access.
 * This is the correct client for server-controlled auth flows and internal lookups.
 */
const supabaseAuth =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        realtime: {
          transport: ws as unknown as WebSocketLikeConstructor,
        },
      })
    : null;

/**
 * Public/anon client kept for compatibility where needed.
 * Do not rely on this for internal auth-governed lookups.
 */
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        realtime: {
          transport: ws as unknown as WebSocketLikeConstructor,
        },
      })
    : null;

/* -------------------------------------------------------------------------- */
/*                                  SCHEMAS                                   */
/* -------------------------------------------------------------------------- */

export const updateSBUSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    lead_name: z.string().max(255).nullable().optional(),
    lead_email: z.string().email().nullable().optional(),
    entity_name: z.string().max(255).nullable().optional(),
    status: z.enum(["active", "planning", "inactive", "future"]).optional(),
    financial_status: z.string().max(50).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const insertProgramSchema = z
  .object({
    program_id: z
      .string()
      .min(1)
      .max(50)
      .regex(
        /^[A-Z0-9-]+$/,
        "Program ID must be uppercase alphanumeric with dashes",
      ),
    name: z.string().min(1).max(255),
    parent_program_id: z.string().max(50).nullable().optional(),
    sbu_id: z.string().uuid().nullable().optional(),
    program_type: z
      .enum([
        "course",
        "workshop",
        "service",
        "product",
        "package",
        "consultation",
        "tutoring",
      ])
      .nullable()
      .optional(),
    description: z.string().max(2000).nullable().optional(),
    base_price: z.number().min(0).nullable().optional(),
    price_currency: z.enum(["USD", "VND", "MYR", "TWD"]).nullable().optional(),
    duration_value: z.number().int().min(1).nullable().optional(),
    duration_unit: z
      .enum(["hours", "days", "weeks", "months", "years"])
      .nullable()
      .optional(),
    remainder_recipient: z
      .enum(["platform", "tutor", "partner"])
      .default("platform"),
    is_active: z.boolean().default(true),
  })
  .strict();

export const updateProgramSchema = insertProgramSchema
  .partial()
  .omit({ program_id: true })
  .strict();

export const insertCommissionRuleSetSchema = z
  .object({
    set_name: z.string().min(1).max(255),
    program_id: z.string().max(50).nullable().optional(),
    apply_to_subprograms: z.boolean().default(true),
    remainder_recipient: z
      .enum(["platform", "tutor", "partner"])
      .default("platform"),
    is_active: z.boolean().default(true),
  })
  .strict();

export const insertCommissionRuleSchema = z
  .object({
    rule_set_id: z.string().uuid(),
    rule_name: z.string().min(1).max(255),
    recipient_role: z.enum([
      "collaborator_tier1",
      "collaborator_tier2",
      "partner",
      "charity",
      "tutor",
      "platform",
    ]),
    commission_type: z.enum(["percentage", "fixed"]).default("percentage"),
    commission_value: z.number().min(0).max(100),
    priority: z.number().int().min(0).max(1000).default(100),
    is_active: z.boolean().default(true),
  })
  .strict();

/* -------------------------------------------------------------------------- */
/*                                   DATA API                                 */
/* -------------------------------------------------------------------------- */

export async function getSBUs() {
  if (!supabaseAuth) return [];
  const { data, error } = await supabaseAuth
    .schema("meh")
    .from("sbus")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function updateSBU(id: string, updates: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("sbus")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPrograms() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function createProgram(program: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("programs")
    .insert(program)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProgram(
  id: string,
  updates: Record<string, unknown>,
) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("programs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("program_id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCommissionRuleSets() {
  if (!supabase) return [];

  const { data: ruleSets, error } = await supabase
    .from("commission_rule_sets")
    .select("*")
    .order("set_name");

  if (error) throw error;

  const { data: rules } = await supabase
    .from("commission_rules")
    .select("*")
    .order("priority");

  return (ruleSets || []).map((rs) => ({
    ...rs,
    rules: (rules || []).filter((r) => r.rule_set_id === rs.id),
  }));
}

export async function createCommissionRuleSet(
  ruleSet: Record<string, unknown>,
) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("commission_rule_sets")
    .insert(ruleSet)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCommissionRule(rule: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("commission_rules")
    .insert(rule)
    .select()
    .single();
  if (error) throw error;
  return data;