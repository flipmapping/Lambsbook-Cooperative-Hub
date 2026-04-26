import { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/requestContext";
import { createAuthenticatedClient } from "../lib/supabase-member-client";

export async function attachUserContext(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createAuthenticatedClient(token);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userId = userData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("sbu_id, role, is_super_admin")
      .eq("user_id", userId)
      .single();

    const hasProfile = !!profile && !profileError;

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
    next();
  } catch (err) {
    return res.status(500).json({ error: "User context attachment failed" });
  }
}
