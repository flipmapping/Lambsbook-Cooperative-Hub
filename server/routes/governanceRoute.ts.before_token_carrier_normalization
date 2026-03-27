import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireSBUAccess, SBURequest } from "../middleware/requireSBUAccess";
import { requireSBURole } from "../middleware/requireSBURole";
import { manageSBUMember, transferSBUOwnership, setSBUStatus } from "../dal/governance";
import { governanceRateLimit } from "../middleware/governanceRateLimit";

const router = Router();

router.post(
  "/api/sbu/:sbu_id/manage-member",
  requireAuth,
  governanceRateLimit,
  requireSBUAccess,
  requireSBURole(["admin", "owner"]),
  async (req: SBURequest, res) => {
    try {
      const jwt = req.headers.authorization?.replace("Bearer ", "").trim();

      if (!jwt || !req.sbu_id) {
        return res.status(400).json({
          success: false,
          error: "Invalid request context",
        });
      }

      const { target_user_id, role, status } = req.body;

      if (!target_user_id) {
        return res.status(400).json({
          success: false,
          error: "target_user_id is required",
        });
      }

      const result = await manageSBUMember(jwt, {
        sbu_id: req.sbu_id!,
        user_id: target_user_id,
        role,
        action: status || "update",
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || "Governance action failed",
      });
    }
  }
);

router.post(
  "/api/sbu/:sbu_id/transfer-ownership",
  requireAuth,
  governanceRateLimit,
  requireSBUAccess,
  requireSBURole(["owner"]),
  async (req: SBURequest, res) => {
    try {
      const jwt = req.headers.authorization?.replace("Bearer ", "").trim();

      if (!jwt || !req.sbu_id) {
        return res.status(400).json({
          success: false,
          error: "Invalid request context",
        });
      }

      const { new_owner_user_id } = req.body;

      if (!new_owner_user_id) {
        return res.status(400).json({
          success: false,
          error: "new_owner_user_id is required",
        });
      }

      const result = await transferSBUOwnership(jwt, {
        sbu_id: req.sbu_id!,
        new_owner_user_id,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || "Ownership transfer failed",
      });
    }
  }
);

router.post(
  "/api/sbu/:sbu_id/set-status",
  requireAuth,
  governanceRateLimit,
  requireSBUAccess,
  requireSBURole(["owner"]),
  async (req: SBURequest, res) => {
    try {
      const jwt = req.headers.authorization?.replace("Bearer ", "").trim();

      if (!jwt || !req.sbu_id) {
        return res.status(400).json({
          success: false,
          error: "Invalid request context",
        });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: "status is required",
        });
      }

      const result = await setSBUStatus(jwt, {
        sbu_id: req.sbu_id!,
        status,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || "Set SBU status failed",
      });
    }
  }
);

export default router;
