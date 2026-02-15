import { Request, Response, NextFunction } from "express";

export function blockSbuInjection(req: Request, res: Response, next: NextFunction) {
  if (req.body?.p_sbu_id || req.body?.sbu_id) {
    return res.status(400).json({
      error: "Manual SBU injection is not allowed"
    });
  }

  next();
}
