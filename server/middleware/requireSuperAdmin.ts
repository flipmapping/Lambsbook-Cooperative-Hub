import { Request, Response, NextFunction } from "express";

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user || user.is_super_admin !== true) {
    return res.status(403).json({
      error: "Super admin privileges required"
    });
  }

  next();
}
