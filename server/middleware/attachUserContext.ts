/* ========================================================================== */
/* APP_REC_018C_IDENTITY_OBSERVABILITY                                        */
/* Temporary diagnostic scaffold.                                             */
/* Remove after identity corridor certification.                              */
/* ========================================================================== */
import { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/requestContext";
import { createAuthenticatedClient } from "../lib/supabase-member-client";

/* ========================================================================== */
/* APP-REC-029 — Structured identity trace                                    */
/* Correlation ID threads every decision point within a single request.       */
/* Never throws. Never alters control flow.                                   */
/* ========================================================================== */
function identityTrace(
  correlationId: string,
  stage: string,
  success: boolean,
  extra: Record<string, unknown> = {}
): void {
  try {
    console.info("[IDENTITY]", {
      correlationId,
      stage,
      success,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  } catch (_) {
    // Never interfere with request processing.
  }
}

function generateCorrelationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
/* ========================================================================== */

export async function attachUserContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const correlationId = generateCorrelationId();

  try {
    const authHeader = req.headers.authorization;

    identityTrace(correlationId, "header_check", true, {
      hasAuthorization: !!authHeader,
      bearer: authHeader?.startsWith("Bearer ") ?? false,
      tokenLength: authHeader ? authHeader.replace("Bearer ", "").length : 0,
    });

    if (!authHeader) {
      identityTrace(correlationId, "no_auth_header", true, {
        decision: "pass_through_unauthenticated",
      });
      next();
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      identityTrace(correlationId, "invalid_header_format", false, {
        decision: "reject_401",
      });
      res.status(401).json({ error: "Invalid authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    identityTrace(correlationId, "token_extracted", true, {
      tokenLength: token.length,
    });

    const supabase = createAuthenticatedClient(token);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    identityTrace(correlationId, "get_user", !userError && !!userData?.user, {
      userId: userData?.user?.id ?? null,
      userErrorMessage: userError?.message ?? null,
      userErrorStatus: userError?.status ?? null,
    });

    if (userError || !userData?.user) {
      identityTrace(correlationId, "auth_rejected", false, {
        decision: "reject_401",
        reason: "getUser_failed",
        userErrorMessage: userError?.message ?? null,
        userErrorStatus: userError?.status ?? null,
        hasUser: !!userData?.user,
      });
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const userId = userData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("sbu_id, role, is_super_admin")
      .eq("user_id", userId)
      .single();

    const hasProfile = !!profile && !profileError;

    identityTrace(correlationId, "profile_fetch", true, {
      userId,
      hasProfile,
      profileErrorMessage: profileError?.message ?? null,
      profileErrorCode: (profileError as Record<string, unknown> | null)?.code ?? null,
      sbu_id: profile?.sbu_id ?? null,
      role: profile?.role ?? null,
      is_super_admin: profile?.is_super_admin ?? null,
    });

    // Attach structured identity to request
    authReq.user = {
      id: userId,
      token,
      ...(hasProfile
        ? {
            sbu_id: profile.sbu_id,
            role: profile.role,
            is_super_admin: profile.is_super_admin,
          }
        : {}),
    };

    identityTrace(correlationId, "context_attached", true, {
      userId,
      hasProfile,
      decision: "pass_through_authenticated",
    });

    next();
  } catch (err) {
    identityTrace(correlationId, "unhandled_exception", false, {
      errorMessage: err instanceof Error ? err.message : String(err),
      errorName: err instanceof Error ? err.name : "Unknown",
      errorStack: err instanceof Error ? err.stack : null,
      decision: "reject_500",
    });
    console.error("[APP-REC-029] attachUserContext unhandled exception:", {
      correlationId,
      error: err,
    });
    res.status(500).json({ error: "User context attachment failed" });
  }
}
