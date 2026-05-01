import { createClient, AuthApiError } from "@supabase/supabase-js";
import { z } from "zod";

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
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sbus")
    .select("*")
    .order("sbu_number");
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
}

export async function deleteCommissionRule(id: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("commission_rules")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function getHubMembers() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return data || [];
}

export async function getTransactions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getEarnings() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("earnings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/* -------------------------------------------------------------------------- */
/*                                 AUTH LAYER                                 */
/* -------------------------------------------------------------------------- */

interface SignUpData {
  email: string;
  password?: string;
  fullName?: string;
  username?: string;
  phone?: string;
  referrerEmail?: string;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signUpValidationSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, "Invalid email format"),
  fullName: z.string().min(1, "Full name is required").max(255).optional(),
  username: z
    .string()
    .regex(
      USERNAME_REGEX,
      "Username must be 3-50 characters, alphanumeric with underscores/hyphens",
    )
    .optional(),
  phone: z
    .string()
    .regex(PHONE_REGEX, "Phone must be 7-15 digits with optional + prefix")
    .optional(),
  referrerEmail: z.string().email().optional(),
});

export class HubAuthError extends Error {
  statusCode: number;
  originalError?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    originalError?: unknown,
  ) {
    super(message);
    this.name = "HubAuthError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

function hubRedirectUrl(referrerEmail?: string) {
  const base =
    process.env.SITE_URL || process.env.APP_URL || "http://localhost:5000";
  return `${base}/hub/auth/callback?referrer=${encodeURIComponent(referrerEmail || "")}`;
}

/**
 * IMPORTANT:
 * This function creates AUTH identity only.
 * It must NOT auto-create canonical cooperative membership.
 */
export async function signUpMember(data: SignUpData) {
  const validation = signUpValidationSchema.safeParse(data);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map((e) => e.message).join(", ");
    throw new HubAuthError(errorMsg, 400);
  }

  if (!supabaseAuth) {
    throw new HubAuthError("Supabase auth not configured.", 503);
  }

  if (!data.password || data.password.length < 8) {
    throw new HubAuthError("Password must be at least 8 characters.", 400);
  }

  // Internal server-side uniqueness check for username
  if (data.username) {
    const { data: existingUser, error: usernameCheckError } = await supabaseAuth
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .maybeSingle();

    if (usernameCheckError) {
      console.warn(
        "[Hub Auth] Username check warning:",
        usernameCheckError.message,
      );
    }

    if (existingUser) {
      throw new HubAuthError(
        "Username is already taken. Please choose a different one.",
        400,
      );
    }
  }

  // Transitional legacy referrer lookup. Kept only so signup can preserve referral intent.
  let referrerValid = false;
  let referrerId: string | null = null;

  if (data.referrerEmail) {
    try {
      const { data: referrer } = await supabaseAuth
        .from("members")
        .select("id, email")
        .eq("email", data.referrerEmail)
        .maybeSingle();

      referrerValid = !!referrer;
      referrerId = referrer?.id || null;
    } catch (e) {
      console.warn(
        "[Hub Auth] Referrer validation failed, continuing anyway:",
        e,
      );
    }
  }

  try {
    const { data: signUpResult, error } = await supabaseAuth.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: hubRedirectUrl(data.referrerEmail),
        data: {
          full_name: data.fullName,
          username: data.username,
          phone: data.phone,
          referrer_id: referrerId,
        },
      },
    });

    if (error) {
      console.error("[Hub Auth] Supabase signUp error:", error);

      if (error instanceof AuthApiError) {
        if (error.code === "over_email_send_rate_limit") {
          throw new HubAuthError(
            "Email rate limit reached. Please wait a few minutes before trying again.",
            429,
            error,
          );
        }

        if (
          error.code === "user_already_exists" ||
          error.message.includes("already registered")
        ) {
          throw new HubAuthError(
            "An account with this email already exists. Please log in instead.",
            400,
            error,
          );
        }

        if (error.code === "weak_password") {
          throw new HubAuthError(
            "Password is too weak. Please choose a stronger password.",
            400,
            error,
          );
        }
      }

      throw new HubAuthError(`Sign up failed: ${error.message}`, 500, error);
    }

    const needsConfirmation =
      signUpResult?.user?.identities?.length === 0 ||
      signUpResult?.user?.confirmation_sent_at != null;

    return {
      success: true,
      message: needsConfirmation
        ? "Account created! Please check your email to confirm your account."
        : "Account created successfully.",
      needsConfirmation,
      referrerEmail: data.referrerEmail || null,
      referrerValid,
      session: null,
      user: signUpResult?.user
        ? {
            id: signUpResult.user.id,
            email: signUpResult.user.email,
          }
        : null,
    };
  } catch (e) {
    if (e instanceof HubAuthError) throw e;
    console.error("[Hub Auth] Unexpected error during signup:", e);
    throw new HubAuthError(
      "Failed to create account. Please try again.",
      503,
      e,
    );
  }
}

/**
 * Transitional legacy profile sync helper.
 * This is NOT canonical membership creation.
 */
export async function updateProfileAfterAuth(
  userId: string,
  data: {
    email: string;
    fullName?: string;
    username?: string;
    phone?: string;
    referrerId?: string;
  },
) {
  if (!supabaseAuth) {
    throw new HubAuthError("Supabase auth not configured.", 503);
  }

  try {
    const { error } = await supabaseAuth.from("profiles").upsert(
      {
        id: userId,
        email: data.email,
        full_name: data.fullName,
        username: data.username,
        phone: data.phone,
        inviter_id: data.referrerId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("[Hub Auth] Profile update error:", error);
      throw error;
    }

    return { success: true };
  } catch (e) {
    console.error("[Hub Auth] Failed to update profile:", e);
    throw new HubAuthError("Failed to update profile", 500, e);
  }
}

/**
 * Transitional legacy referrer linker.
 * This must not be confused with canonical invitation-governed membership.
 */
export async function linkReferrer(memberEmail: string, referrerEmail: string) {
  if (!supabaseAuth) {
    throw new HubAuthError("Supabase auth not configured.", 503);
  }

  const { data: referrer, error: referrerError } = await supabaseAuth
    .from("members")
    .select("id, email, full_name")
    .eq("email", referrerEmail)
    .maybeSingle();

  if (referrerError || !referrer) {
    return {
      success: false,
      error: "Referrer not found with that email address",
    };
  }

  const { data: member, error: memberError } = await supabaseAuth
    .from("members")
    .select("id, inviter_id")
    .eq("email", memberEmail)
    .maybeSingle();

  if (memberError || !member) {
    return { success: false, error: "Member not found" };
  }

  if (member.inviter_id) {
    return { success: false, error: "Already linked to a referrer" };
  }

  const { error: updateError } = await supabaseAuth
    .from("members")
    .update({ inviter_id: referrer.id, updated_at: new Date().toISOString() })
    .eq("id", member.id);

  if (updateError) throw updateError;

  return {
    success: true,
    message: `Successfully linked to referrer: ${referrer.full_name || referrer.email}`,
    referrer: {
      id: referrer.id,
      email: referrer.email,
      name: referrer.full_name,
    },
  };
}

/**
 * Transitional legacy lookup for current referrer-email UX.
 */
export async function getMemberByEmail(email: string) {
  if (!supabaseAuth) return null;

  const { data, error } = await supabaseAuth
    .from("members")
    .select("id, email, full_name, invitor_id, member_type, activity_status")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.log("[Hub] getMemberByEmail error:", error.message);
    return null;
  }

  return data;
}

export async function loginMember(email: string, password?: string) {
  if (!supabaseAuth) {
    throw new HubAuthError("Supabase auth not configured.", 503);
  }

  if (!password) {
    throw new HubAuthError("Password is required.", 400);
  }

  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Hub Auth] Supabase login error:", error);

      if (error instanceof AuthApiError) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.code === "invalid_credentials"
        ) {
          throw new HubAuthError(
            "Invalid email or password. Please try again.",
            401,
            error,
          );
        }

        if (error.message.includes("Email not confirmed")) {
          throw new HubAuthError(
            "Please confirm your email address before logging in.",
            401,
            error,
          );
        }

        if (error.code === "over_email_send_rate_limit") {
          throw new HubAuthError(
            "Too many attempts. Please wait a few minutes.",
            429,
            error,
          );
        }
      }

      throw new HubAuthError(`Login failed: ${error.message}`, 500, error);
    }

    return {
      success: true,
      message: "Login successful",
      session: null,
    };
  } catch (e) {
    if (e instanceof HubAuthError) throw e;
    console.error("[Hub Auth] Unexpected login error:", e);
    throw new HubAuthError("Login failed. Please try again.", 503, e);
  }
}


export async function forgotPassword(email: string) {
  if (!supabaseAuth) {
    throw new HubAuthError("Supabase auth not configured.", 503);
  }

  try {
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL || process.env.APP_URL || "http://localhost:5000"}/auth/reset`,
    });

    if (error) {
      console.error("[Hub Auth] Password reset error:", error);

      if (
        error instanceof AuthApiError &&
        error.code === "over_email_send_rate_limit"
      ) {
        throw new HubAuthError(
          "Too many requests. Please wait a few minutes.",
          429,
          error,
        );
      }

      throw new HubAuthError(
        `Failed to send reset email: ${error.message}`,
        500,
        error,
      );
    }

    return {
      success: true,
      message:
        "If an account exists with this email, a reset link has been sent.",
    };
  } catch (e) {
    if (e instanceof HubAuthError) throw e;
    console.error("[Hub Auth] Unexpected forgot password error:", e);
    throw new HubAuthError("Failed to send reset email.", 503, e);
  }
}

export async function resetPassword(accessToken: string, newPassword: string) {
  if (!supabaseAuth || !supabaseUrl) {
    throw new HubAuthError("Supabase auth not configured.", 503);
  }

  try {
    const supabaseWithToken = createClient(
      supabaseUrl,
      supabaseAnonKey || supabaseServiceRoleKey!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { error } = await supabaseWithToken.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("[Hub Auth] Reset password error:", error);

      if (error.message.includes("same password")) {
        throw new HubAuthError(
          "New password must be different from your current password.",
          400,
          error,
        );
      }

      throw new HubAuthError(
        `Failed to reset password: ${error.message}`,
        500,
        error,
      );
    }

    return {
      success: true,
      message: "Password has been reset successfully.",
    };
  } catch (e) {
    if (e instanceof HubAuthError) throw e;
    console.error("[Hub Auth] Unexpected reset password error:", e);
    throw new HubAuthError("Failed to reset password.", 503, e);
  }
}

