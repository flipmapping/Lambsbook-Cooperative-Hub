import { Router, type Response } from "express";
import { attachUserContext } from "../middleware/attachUserContext";
import type { AuthenticatedRequest } from "../types/requestContext";
import {
  createNonMemberInvitation,
  type CreateNonMemberInvitationInput,
} from "../services/non-member-invitation";

const router = Router();

router.post(
  "/",
  attachUserContext,
  async (req: AuthenticatedRequest, res: Response) => {
    const { targetType, targetId, message } =
      req.body as Partial<CreateNonMemberInvitationInput>;

    if (targetType !== "community") {
      return res.status(400).json({
        error:
          "Non-member invitation creation currently supports community targets only.",
      });
    }

    if (typeof targetId !== "string" || !targetId.trim()) {
      return res.status(400).json({
        error: "Non-member invitation targetId is required.",
      });
    }

    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const invitation = createNonMemberInvitation({
      targetType,
      targetId,
      inviter: {
        id: user.id,
        displayName: user.email ?? user.id,
      },
      ...(typeof message === "string" ? { message } : {}),
    });

    return res.status(201).json(invitation);
  },
);

export default router;
