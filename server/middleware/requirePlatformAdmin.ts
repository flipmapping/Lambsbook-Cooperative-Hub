import { Request, Response, NextFunction } from "express";
import { getUserClient } from "../lib/supabaseClients";

export interface PlatformRequest extends Request {
  isPlatformAdmin?: boolean;
}

export async function detectPlatformAdmin(
  req: PlatformRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const jwt = req.headers.authorization?.replace("Bearer ", "").trim();

    if (!jwt) {
      req.isPlatformAdmin = false;
      return next();
    }

    const supabase = getUserClient(jwt);

    const { data, error } = await supabase
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", req.user?.id)
      .single();

    if (error || !data) {
      req.isPlatformAdmin = false;
    } else {
      req.isPlatformAdmin = true;
    }

    return next();
  } catch {
    req.isPlatformAdmin = false;
    return next();
  }
}
