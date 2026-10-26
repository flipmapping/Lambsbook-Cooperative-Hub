import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { attachUserContext } from "../middleware/attachUserContext";
import type { AuthenticatedRequest } from "../types/requestContext";
import {
  getUserClient,
  getServiceClient
} from "../lib/supabaseClients";
import { SupabaseDAL } from "../lib/supabase-dal";
import { generateInvitationShareMessage, resolveLanguage } from "../services/invitation-delivery";

import { getUserEmailFromToken } from "../lib/getUserEmailFromToken";
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

    const email = await getUserEmailFromToken(user.token);

    return res.json({
      user: {
        id: user.id,
        email,
      },
      id: member.id,
      membership_status: member.membership_status,
      member_type: member.member_type,
      activity_status: member.activity_status,

      // Canonical authenticated identity
      user_id: user.id,
      role: user.role ?? null,
      sbu_id: user.sbu_id ?? null,
      is_super_admin: user.is_super_admin ?? false,
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
 * GET /api/member/sent-invitations
 * Returns only display-safe fields for invitations created by the authenticated user.
 * Invitation tokens are deliberately excluded.
 */
router.get("/sent-invitations", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user?.id || !user?.token) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required"
        }
      });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("gateway_invitations")
      .select("id, invited_email, note, status, created_at, expires_at, accepted_at")
      .eq("inviter_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("GET_SENT_INVITATIONS", error.message);
      return res.status(500).json({
        error: {
          code: "SENT_INVITATIONS_UNAVAILABLE",
          message: "Unable to load sent invitations"
        }
      });
    }

    return res.json({ invitations: data ?? [] });
  } catch (err) {
    console.error("GET_SENT_INVITATIONS_RUNTIME", err);
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Server error"
      }
    });
  }
});

/**
 * POST /api/member/invitations
 */

/**
 * DELETE /api/member/invitations/:id
 * Only the authenticated inviter may delete their own pending invitation.
 */
router.delete("/invitations/:id", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user?.id) {
      return res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Authentication required" },
      });
    }

    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        error: { code: "MISSING_ID", message: "Invitation ID required" },
      });
    }

    const admin = getServiceClient();
    const { data: invitation, error: fetchError } = await admin
      .from("gateway_invitations")
      .select("id, inviter_user_id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !invitation) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Invitation not found" },
      });
    }
    if (invitation.inviter_user_id !== user.id) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "You may only delete your own invitations" },
      });
    }
    if (invitation.status !== "pending") {
      return res.status(409).json({
        error: { code: "INVALID_STATUS", message: "Only pending invitations may be deleted" },
      });
    }

    const { error: deleteError } = await admin
      .from("gateway_invitations")
      .delete()
      .eq("id", id)
      .eq("inviter_user_id", user.id)
      .eq("status", "pending");

    if (deleteError) {
      console.error("DELETE_INVITATION_ERROR", deleteError);
      return res.status(500).json({
        error: { code: "SERVER_ERROR", message: "Failed to delete invitation" },
      });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("DELETE_INVITATION_RUNTIME", err);
    return res.status(500).json({
      error: { code: "SERVER_ERROR", message: "Server error" },
    });
  }
});


router.post("/invitations/share", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      return res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Authentication required" },
      });
    }

    const invitationLink = req.body?.invitationLink;
    const language = req.body?.language;
    const memberName = req.body?.memberName;

    if (typeof invitationLink !== "string" || !invitationLink.trim()) {
      return res.status(400).json({
        error: { code: "INVALID_INVITATION_LINK", message: "invitationLink is required" },
      });
    }
    if (language !== undefined && typeof language !== "string") {
      return res.status(400).json({
        error: { code: "INVALID_LANGUAGE", message: "language must be a string" },
      });
    }
    if (memberName !== undefined && typeof memberName !== "string") {
      return res.status(400).json({
        error: { code: "INVALID_MEMBER_NAME", message: "memberName must be a string" },
      });
    }

    const resolvedLanguage = resolveLanguage(language);
    const message = generateInvitationShareMessage({
      invitationLink,
      language: resolvedLanguage,
      ...(memberName?.trim() ? { memberName: memberName.trim() } : {}),
    });
    return res.json({ invitationLink, language: resolvedLanguage, message });
  } catch (err) {
    console.error("POST_INVITATION_SHARE_RUNTIME", err);
    return res.status(500).json({
      error: { code: "SERVER_ERROR", message: "Server error" },
    });
  }
});

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

    const configuredSiteUrl = process.env.SITE_URL?.trim();
    let siteUrl: URL;

    try {
      if (!configuredSiteUrl) {
        throw new Error("SITE_URL is not configured");
      }

      siteUrl = new URL(configuredSiteUrl);

      if (
        !["https:", "http:"].includes(siteUrl.protocol) ||
        !siteUrl.hostname ||
        siteUrl.username ||
        siteUrl.password ||
        siteUrl.search ||
        siteUrl.hash
      ) {
        throw new Error("SITE_URL is invalid");
      }
    } catch {
      return res.status(503).json({
        error: {
          code: "INVITATION_URL_UNAVAILABLE",
          message: "Invitation links are temporarily unavailable"
        }
      });
    }

    const inviteUrl = new URL("/hub/signup", siteUrl);
    inviteUrl.searchParams.set("invite", token);

    const data =
      await supabaseDAL.createGatewayInvitation({
        token,
        inviter_user_id: user.id,
        inviter_email: userEmail,
        invited_email: invitedEmail ?? null,
        phone_number: phoneNumber ?? null,
        note: note ?? null
      });

    return res.status(201).json({
      invitation: {
        id: data.id,
        status: data.status
      },
      inviteUrl: inviteUrl.toString()
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
