import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: any };
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await logAuthFailure(null, "missing_token");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      await logAuthFailure(null, "invalid_token");
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).user = data.user;
    next();
  } catch (err) {
    await logAuthFailure(null, "auth_middleware_exception");
    return res.status(401).json({ error: "Unauthorized" });
  }
}

async function logAuthFailure(
  userId: string | null,
  reason: string
) {
  await supabaseAdmin.from("core.system_audit_log").insert({
    actor_user_id: userId,
    sbu_id: null,
    action: "authentication_failed",
    metadata: {
      reason,
    },
  });
}
