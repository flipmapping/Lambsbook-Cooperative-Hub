import { Router, Response, NextFunction } from "express";
import { attachUserContext } from "../middleware/attachUserContext";
import type { AuthenticatedRequest } from "../types/requestContext";
import {
  getUserClient,
  getServiceClient
} from "../lib/supabaseClients";
import { SupabaseDAL } from "../lib/supabase-dal";

const router = Router();

const supabaseDAL = new SupabaseDAL();

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
router.get("/me", attachUserContextSafe, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }


    const member =
      await supabaseDAL.getMemberByUserId(user.id);


    if (!member) {
      return res.status(404).json({
        error: "Member not found"
      });
    }

    return res.json({
      id: member.id,
      membership_status: member.membership_status,
      member_type: member.member_type,
      activity_status: member.activity_status
    });
  } catch (err) {
    console.error("MEMBER_ME_ERROR", err);
    console.error("GET_MEMBER_ME_RUNTIME", err);

    return res.status(500).json({
      error: "Failed to fetch member"
    });
  }
});

/**
 * GET /api/member/pending-invitation
 */
router.get("/pending-invitation", attachUserContextSafe, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user?.id || !user?.token) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const supabase = getUserClient(user.token);

    const { data: userEmail, error: userEmailError } =
      await supabase.rpc("get_my_auth_email");


    if (userEmailError || !userEmail) {
      return res.status(401).json({
        error: "User email not found"
      });
    }

    const supabaseAdmin = getServiceClient();

    await supabaseAdmin
      .from("member_invitations")
      .update({ invited_user_id: user.id })
      .eq("status", "pending")
      .is("invited_user_id", null)
      .eq("invited_email", userEmail);

    const { data, error } = await supabaseAdmin
      .from("member_invitations")
      .select("id, inviter_member_id, status, created_at")
      .eq("invited_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();


    if (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to fetch invitation"
      });
    }

    return res.json({
      has_pending_invitation: !!data,
      invitation: data || null
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }
});

/**
 * POST /api/member/invitations
 */
router.post("/invitations", attachUserContextSafe, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user?.token || !user?.id) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required"
        }
      });
    }

    const invitedEmail =
      req.body?.invitedEmail;

    if (
      !invitedEmail ||
      typeof invitedEmail !== "string"
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "Valid invitedEmail is required",
          field: "invitedEmail"
        }
      });
    }

    const supabase =
      getUserClient(user.token);

    const { data, error } =
      await supabase.rpc(
        "issue_member_invitation",
        {
          p_invited_user_id: null,
          p_invited_email: invitedEmail,
          p_program_id: null
        }
      );

    if (error) {
      console.error(
        "ISSUE_MEMBER_INVITATION_ERROR",
        error
      );

      const message =
        error.message || "";

      if (
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("already")
      ) {
        return res.status(409).json({
          error: {
            code: "DUPLICATE_INVITATION",
            message,
            field: "invitedEmail"
          }
        });
      }

      if (
        message.toLowerCase().includes("not allowed") ||
        message.toLowerCase().includes("forbidden")
      ) {
        return res.status(403).json({
          error: {
            code: "NOT_ALLOWED",
            message
          }
        });
      }

      return res.status(500).json({
        error: {
          code: "INVITATION_ISSUE_FAILED",
          message:
            message || "Failed to issue invitation"
        }
      });
    }

    return res.json({
      invitation: data
    });

  } catch (err) {
    console.error(
      "POST_INVITATIONS_RUNTIME",
      err
    );

    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Server error"
      }
    });
  }
});

/**
 * POST /api/member/accept-invitation
 */
router.post("/accept-invitation", attachUserContextSafe, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user?.token || !user?.id) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const invitationId =
      req.body?.invitationId;

    if (!invitationId) {
      return res.status(400).json({
        error: "Missing invitationId"
      });
    }

    const supabase =
      getUserClient(user.token);

    const { error } =
      await supabase.rpc(
        "accept_member_invitation",
        {
          p_invitation_id: invitationId
        }
      );

    if (error) {
      console.error(
        "ACCEPT_INVITATION_RPC_ERROR",
        error.code,
        error.message
      );

      const msg =
        (error.message || "").toLowerCase();

      if (
        error.code === "42501" ||
        msg.includes("not authorized") ||
        msg.includes("not your invitation") ||
        msg.includes("permission denied")
      ) {
        return res.status(403).json({
          error: {
            code: "NOT_ALLOWED",
            message:
              "You are not authorized to accept this invitation."
          }
        });
      }

      if (
        msg.includes("not found") ||
        msg.includes("does not exist") ||
        msg.includes("no invitation")
      ) {
        return res.status(404).json({
          error: {
            code: "INVITATION_NOT_FOUND",
            message:
              "Invitation not found."
          }
        });
      }

      if (
        error.code === "23514" ||
        msg.includes("already accepted") ||
        msg.includes("already processed") ||
        msg.includes("not pending") ||
        msg.includes("expired")
      ) {
        return res.status(409).json({
          error: {
            code: "INVITATION_ALREADY_PROCESSED",
            message:
              "This invitation has already been accepted or is no longer valid."
          }
        });
      }

      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Failed to accept invitation."
        }
      });
    }

    return res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }
});

export default router;
