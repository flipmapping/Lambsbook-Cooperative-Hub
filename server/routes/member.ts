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

    console.group("[APP-REC-IDENTITY]");
    console.log("JWT user.id:", user?.id);
    console.log("JWT email:", user?.email);
    console.groupEnd();


    if (!user?.id) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }



    console.log("[MEMBER_ROUTE]", {
      authenticatedUserId: user.id,
    });

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
      activity_status: member.activity_status,
      join_date: member.join_date,

      // Canonical authenticated identity
      user_id: user.id,
      email: user.email ?? null,
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
      .select("id, inviter_member_id, status, created_at, invited_email")
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
    console.error("========================================");
    console.error("ACCEPT_INVITATION_EXCEPTION");
    console.error("invitationId:", req.body?.invitationId);
    console.error("userId:", (req as AuthenticatedRequest).user?.id ?? null);
    console.error("tokenPresent:", !!(req as AuthenticatedRequest).user?.token);

    if (err instanceof Error) {
      console.error("name:", err.name);
      console.error("message:", err.message);
      console.error("stack:");
      console.error(err.stack);
    } else {
      console.error("non_error_value:", err);
    }

    console.error("========================================");

    return res.status(500).json({
      error: "Server error"
    });
  }
});

/**
 * POST /api/member/invitations
 */
router.get("/invitations", attachUserContextSafe, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user?.id) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
    }

    const invitations =
      await supabaseDAL.getGatewayInvitationsByInviter(user.id);

    return res.json({ invitations });
  } catch (err) {
    console.error("GET_INVITATIONS_RUNTIME", err);

    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Server error",
      },
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

    const data =
      await supabaseDAL.createGatewayInvitation({
        token,
        inviter_user_id: user.id,
        inviter_email: userEmail,
        invited_email: invitedEmail ?? null,
        phone_number: phoneNumber ?? null,
        note: note ?? null
      });

    const appOrigin =
      process.env.APP_URL ??
      (process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : "http://localhost:5000");

    const invitationBase =
      process.env.INVITATION_BASE_URL ??
      "https://lambsbookcoop.com";

    return res.status(201).json({
      invitation: {
        id: data.id,
        status: data.status,
        token: data.token
      },
      invitationUrl: `${invitationBase}/invitation-link/${data.token}`
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

    const { data: memberId, error } =
      await supabase.rpc(
        "accept_member_invitation",
        {
          p_invitation_id: invitationId
        }
      );

    console.log(
      "ACCEPT_INVITATION_RPC_RESULT",
      JSON.stringify({
        invitationId,
        memberId,
        hasMemberId: memberId !== null && memberId !== undefined,
        error: error?.message ?? null
      }, null, 2)
    );

    if (!error && !memberId) {
      return res.status(500).json({
        error: {
          code: "RPC_RETURNED_NULL",
          message: "accept_member_invitation completed without returning a member id."
        }
      });
    }

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
    console.error("ACCEPT_INVITATION_EXCEPTION", err);
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

      const secondLevelInvitees =
        await supabaseDAL.getSecondLevelInvitees(
          invitees.map(invitee => invitee.id)
        );

      // APP-MEX-001D: return business fields, not raw UUIDs
      return res.json({
        invitor: invitor
          ? {
              member_type:  invitor.member_type ?? null,
              join_date:    (invitor as any).join_date ?? null,
            }
          : null,

        invitees: invitees.map(invitee => ({
          member_type:  invitee.member_type ?? null,
          join_date:    (invitee as any).join_date ?? null,
          activity_status: invitee.activity_status ?? null,
        })),

        second_level_invitees: secondLevelInvitees.map(invitee => ({
          member_type: invitee.member_type ?? null,
          join_date: (invitee as any).join_date ?? null,
          activity_status: invitee.activity_status ?? null,
        })),
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


/**
 * GET /api/member/profile/preferences
 * APP-MEX-001D — Hydrate profile preferences from backend persistence.
 */
router.get(
  "/profile/preferences",
  attachUserContextSafe,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const member = await supabaseDAL.getMemberByUserId(user.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      const prefs = await supabaseDAL.getMemberProfilePreferences(member.id);

      return res.json(prefs);
    } catch (err) {
      console.error("GET_PROFILE_PREFERENCES_ERROR", err);
      return res.status(500).json({ error: "Failed to fetch profile preferences" });
    }
  }
);

/**
 * PUT /api/member/profile/preferences
 * APP-MEX-001D — Persist profile preferences to backend.
 * Accepts: { avatar_reference?, profile_visibility?, contact_methods? }
 */
router.put(
  "/profile/preferences",
  attachUserContextSafe,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { avatar_reference, profile_visibility, contact_methods } = req.body ?? {};

      // Input validation
      if (
        profile_visibility !== undefined &&
        profile_visibility !== "private" &&
        profile_visibility !== "public"
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_VISIBILITY",
            message: "profile_visibility must be 'private' or 'public'",
          },
        });
      }

      if (contact_methods !== undefined) {
        if (!Array.isArray(contact_methods)) {
          return res.status(400).json({
            error: {
              code: "INVALID_CONTACT_METHODS",
              message: "contact_methods must be an array",
            },
          });
        }
        if (contact_methods.length > 2) {
          return res.status(400).json({
            error: {
              code: "TOO_MANY_CONTACT_METHODS",
              message: "contact_methods may contain at most 2 entries",
            },
          });
        }
        for (const cm of contact_methods) {
          if (
            typeof cm !== "object" || cm === null ||
            typeof cm.platform !== "string" ||
            typeof cm.handle   !== "string"
          ) {
            return res.status(400).json({
              error: {
                code: "INVALID_CONTACT_METHOD_SHAPE",
                message: "Each contact method must have platform (string) and handle (string)",
              },
            });
          }
        }
      }

      if (
        avatar_reference !== undefined &&
        avatar_reference !== null &&
        typeof avatar_reference !== "string"
      ) {
        return res.status(400).json({
          error: {
            code: "INVALID_AVATAR_REFERENCE",
            message: "avatar_reference must be a string or null",
          },
        });
      }

      const member = await supabaseDAL.getMemberByUserId(user.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      await supabaseDAL.updateMemberProfilePreferences(member.id, {
        ...(avatar_reference   !== undefined && { avatar_reference }),
        ...(profile_visibility !== undefined && { profile_visibility }),
        ...(contact_methods    !== undefined && { contact_methods }),
      });

      return res.json({ success: true });
    } catch (err) {
      console.error("PUT_PROFILE_PREFERENCES_ERROR", err);
      return res.status(500).json({ error: "Failed to update profile preferences" });
    }
  }
);

export default router;
