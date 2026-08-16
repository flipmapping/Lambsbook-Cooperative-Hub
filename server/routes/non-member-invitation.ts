import { Router, type Request, type Response } from "express";
import { attachUserContext } from "../middleware/attachUserContext";
import type { AuthenticatedRequest } from "../types/requestContext";
import { storage } from "../storage";
import {
  createNonMemberInvitation,
  type CreateNonMemberInvitationInput,
  type NonMemberInvitation,
} from "../services/non-member-invitation";

const router = Router();

router.get("/:token", async (req: Request, res: Response) => {
  const token = req.params.token;

  if (!token || !token.trim()) {
    return res.status(400).json({
      error: "Invitation token is required.",
    });
  }

  const invitation =
    await storage.getNonMemberInvitationByToken(token);

  if (!invitation) {
    return res.status(404).json({
      error: "Invitation not found.",
    });
  }

  return res.status(200).json(invitation);
});

router.post("/:token/respond", async (req: Request, res: Response) => {
  const token = req.params.token;

  if (!token || !token.trim()) {
    return res.status(400).json({
      error: "Invitation token is required.",
    });
  }

  const participationState = req.body?.participationState;

  const allowedStates = new Set([
    "interested",
    "joined",
    "attended",
    "declined",
  ]);

  if (
    typeof participationState !== "string" ||
    !allowedStates.has(participationState)
  ) {
    return res.status(400).json({
      error:
        "participationState must be interested, joined, attended, or declined.",
    });
  }

  const invitation =
    await storage.getNonMemberInvitationByToken(token);

  if (!invitation) {
    return res.status(404).json({
      error: "Invitation not found.",
    });
  }

  const updatedInvitation =
    await storage.updateNonMemberInvitationParticipationState(
      token,
      participationState as NonMemberInvitation["participationState"],
    );

  if (!updatedInvitation) {
    return res.status(404).json({
      error: "Invitation not found.",
    });
  }

  return res.status(200).json(updatedInvitation);
});

router.post(
  "/",
  attachUserContext,
  async (req: Request, res: Response) => {
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

    const user = (req as AuthenticatedRequest).user;

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

    const persistedInvitation = await storage.createNonMemberInvitation({
      token: invitation.token,
      targetType: invitation.targetType,
      targetId: invitation.targetId,
      inviterId: invitation.inviter.id,
      inviterDisplayName: invitation.inviter.displayName,
      ...(invitation.targetName !== undefined
        ? { targetName: invitation.targetName }
        : {}),
      ...(invitation.targetPurpose !== undefined
        ? { targetPurpose: invitation.targetPurpose }
        : {}),
      ...(invitation.message !== undefined
        ? { message: invitation.message }
        : {}),
      lifecycle: invitation.lifecycle,
      participationState: invitation.participationState,
    });

    return res.status(201).json(persistedInvitation);
  },
);

export default router;
