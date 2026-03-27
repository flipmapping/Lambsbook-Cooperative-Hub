import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireSBUAccess, SBURequest } from "../middleware/requireSBUAccess";
import { requireSBURole } from "../middleware/requireSBURole";
import { postTransaction, closeFinancialPeriod } from "../dal/financial";

const router = Router();

router.post(
  "/api/sbu/:sbu_id/transactions",
  requireAuth,
  requireSBUAccess,
  requireSBURole(["finance"]),
  async (req: SBURequest, res) => {
    try {
      const jwt = req.headers.authorization?.replace("Bearer ", "").trim();

      if (!jwt || !req.sbu_id) {
        return res.status(400).json({ error: "Invalid request context" });
      }

      const { transaction_type, amount, description } = req.body;

      if (!transaction_type || typeof amount !== "number") {
        return res.status(400).json({ error: "Invalid transaction payload" });
      }

      const result = await postTransaction(jwt, {
        sbu_id: req.sbu_id,
        transaction_type,
        amount,
        description,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || "Transaction failed",
      });
    }
  },
);
router.post(
  "/api/sbu/:sbu_id/close-period",
  requireAuth,
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

      const result = await closeFinancialPeriod(jwt, req.sbu_id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message || "Close period failed",
      });
    }
  }
);

export default router;
