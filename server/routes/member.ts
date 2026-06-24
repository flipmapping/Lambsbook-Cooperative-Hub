import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
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
const attachUserContextSafe = (req: Request, res: Response, next: NextFunction) => {
  // If no Authorization header → skip middleware entirely
  if (!req.headers.authorization) {
    return next();
  }

  // Otherwise run middleware normally
  return attachUserContext(req as any, res as any, next);
};

/**
 * GET /api/member/me
 */
router.get("/me", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
const user = authReq.user;

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
router.get("/pending-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
const user = authReq.user;

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
router.post("/invitations", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
const user = authReq.user;

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

    const phoneNumber =
      req.body?.phoneNumber;

    const note =
      req.body?.note;

    if (
      invitedEmail !== undefined &&
      typeof invitedEmail !== "string"
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "invitedEmail must be a string",
          field: "invitedEmail"
        }
      });
    }

    if (
      phoneNumber !== undefined &&
      typeof phoneNumber !== "string"
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_PHONE_NUMBER",
          message: "phoneNumber must be a string",
          field: "phoneNumber"
        }
      });
    }

    if (
      note !== undefined &&
      typeof note !== "string"
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_NOTE",
          message: "note must be a string",
          field: "note"
        }
      });
    }

    const token = randomUUID();

    const supabase =
      getUserClient(user.token);

    const { data: userEmail, error: userEmailError } =
      await supabase.rpc("get_my_auth_email");

    if (userEmailError || !userEmail) {
      return res.status(401).json({
        error: {
          code: "EMAIL_NOT_FOUND",
          message: "User email not found"
        }
      });
    }

    const data =
      await supabaseDAL.createGatewayInvitation({
        token,
        inviter_user_id: user.id,
        inviter_email: userEmail,
        invited_email: invitedEmail ?? null,
        phone_number: phoneNumber ?? null,
        note: note ?? null
      });

    const inviteUrl =
      `https://onboarding-gateway.replit.app/auth/sign-up?invite=${token}`;

    return res.status(201).json({
      inviteUrl
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
 * POST /api/member/onboarding/materialize-invitation
 */
router.post(
  "/onboarding/materialize-invitation",
  attachUserContext,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user?.token || !user?.id) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { inviteToken } = req.body;

      if (
        typeof inviteToken !== "string" ||
        inviteToken.trim().length === 0
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_TOKEN",
            message: "inviteToken is required",
          },
        });
      }

      const supabase = getUserClient(user.token);

      const { data: invitationId, error } =
        await supabase.rpc(
          "materialize_member_invitation_from_link",
          {
            p_token: inviteToken,
          }
        );

      if (error) {
        const msg =
          (error.message || "").toLowerCase();

        if (
          msg.includes("not pending") ||
          msg.includes("not found") ||
          msg.includes("expired") ||
          msg.includes("self-invitation") ||
          msg.includes("not a canonical member")
        ) {
          console.error(
            "MATERIALIZE_INVITATION_STATE_CONFLICT",
            error.code,
            error.message
          );

          return res.status(422).json({
            error: {
              code: "TOKEN_UNAVAILABLE",
              message:
                "This invitation token is unavailable.",
            },
          });
        }

        if (
          msg.includes("already a canonical member")
        ) {
          return res.status(200).json({
            status: "already_member",
          });
        }

        console.error(
          "MATERIALIZE_INVITATION_RPC_ERROR",
          error.code,
          error.message
        );

        return res.status(500).json({
          error: {
            code: "INTERNAL_ERROR",
            message:
              "Failed to materialize invitation.",
          },
        });
      }

      return res.status(200).json({
        status: "materialized",
        invitationId,
      });

    } catch (err) {
      console.error(
        "MATERIALIZE_INVITATION_RUNTIME",
        err
      );

      return res.status(500).json({
        error: "Server error",
      });
    }
  }
);

/**
 * POST /api/member/accept-invitation
 */
router.post("/accept-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
const user = authReq.user;

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

router.get(
  "/trusted-relationships",
  attachUserContextSafe,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
const user = authReq.user;

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

      const invitor =
        member.invitor_id
          ? await supabaseDAL.getMemberById(member.invitor_id)
          : null;

      const invitees =
        await supabaseDAL.getDirectInvitees(member.id);

      return res.json({
        invitor: invitor
          ? {
              id: invitor.id
            }
          : null,

        invitees: invitees.map(invitee => ({
          id: invitee.id
        }))
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to fetch trusted relationships"
      });
    }
  }
);

router.get(
  "/recent-participation",
  attachUserContextSafe,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
const user = authReq.user;

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

      const recent_logs =
        await supabaseDAL.getActivityLogsByMember(member.id);

      return res.json({
        activity_status: member.activity_status,
        last_activity_at: member.last_activity_at,
        recent_logs
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to fetch participation"
      });
    }
  }
);




router.get(
  "/earnings",
  attachUserContextSafe,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user?.id) {
        return res.status(401).json({
          error: "Unauthorized"
        });
      }

      const member =
        await supabaseDAL.getMemberByUserId(user.id);

      if (!member) {
        return res.json([]);
      }

      const earnings =
        await supabaseDAL.getEarningsByMember(member.id);

      return res.json(earnings);

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to fetch earnings"
      });
    }
  }
);


export default router;
