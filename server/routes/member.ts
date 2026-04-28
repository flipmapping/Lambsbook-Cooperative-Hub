import { Router, Response, NextFunction } from "express";
import { attachUserContext } from "../middleware/attachUserContext";
import type { AuthenticatedRequest } from "../types/requestContext";

const router = Router();

// Corrected non-blocking wrapper
const attachUserContextSafe = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // If no Authorization header → skip middleware entirely
  if (!req.headers.authorization) {
    req.user = undefined;
    return next();
  }

  // Otherwise run middleware normally
  return attachUserContext(req as any, res as any, next);
};

/**
 * GET /api/member/me
 */
router.get("/me", attachUserContextSafe, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    id: req.user?.id ?? null,
    sbu_id: req.user?.sbu_id ?? null,
    role: req.user?.role ?? null
  });
});

/**
 * GET /api/member/pending-invitation
 */
router.get("/pending-invitation", attachUserContextSafe, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    has_pending_invitation: false,
    invitation: null
  });
});

/**
 * POST /api/member/accept-invitation
 */
router.post("/accept-invitation", attachUserContextSafe, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true
  });
});

export default router;
