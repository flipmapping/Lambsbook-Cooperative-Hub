import { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/requestContext";

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;

  if (!user || user.is_super_admin !== true) {
    return res.status(403).json({
      error: "Super admin privileges required"
    });
  }

  next();
}
