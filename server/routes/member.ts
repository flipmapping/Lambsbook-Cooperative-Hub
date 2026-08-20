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

    const invitationBase =
      process.env.INVITATION_BASE_URL ??
      "https://lambsbookcoop.com";

    return res.json({
      invitations: invitations.map((invitation) => ({
        id: invitation.id,
        invited_email: invitation.accepted_by_email ?? null,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at ?? null,
        note: null,
        status: invitation.status,
        // D2: Include invitation URL so the link can be retrieved from history
        invitation_url: (invitation as any).token
          ? `${invitationBase}/invitation-link/${(invitation as any).token}`
          : null,
      })),
    });
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

/**
 * DELETE /api/member/invitations/:id
 * D3: Delete an unaccepted (pending) invitation.
 * Only the inviter may delete their own pending invitations.
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: { code: "MISSING_ID", message: "Invitation ID required" },
      });
    }

    const supabaseAdmin = getServiceClient();

    // Fetch the invitation to verify ownership and status
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("member_invitations")
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
        error: {
          code: "INVALID_STATUS",
          message: "Only pending invitations may be deleted",
        },
      });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("member_invitations")
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

      // D7: Fetch invitation metadata to show alongside relationship data
      const supabaseAdmin = getServiceClient();

      // Look up the invitation that created this member's relationship to their invitor
      const { data: receivedInvitation } = await supabaseAdmin
        .from("member_invitations")
        .select("invited_email, created_at, expires_at, status, token")
        .eq("invited_user_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();

      // Look up the invitations that created each invitee relationship
      const inviteeUserIds = invitees
        .map(i => (i as any).user_id)
        .filter(Boolean);

      const { data: sentInvitations } = inviteeUserIds.length > 0
        ? await supabaseAdmin
            .from("member_invitations")
            .select("invited_user_id, invited_email, created_at, expires_at, status, token")
            .in("invited_user_id", inviteeUserIds)
            .eq("status", "accepted")
        : { data: [] };

      const inviteeInvitationMap = new Map(
        (sentInvitations ?? []).map(inv => [inv.invited_user_id, inv])
      );

      const invitationBase =
        process.env.INVITATION_BASE_URL ??
        "https://lambsbookcoop.com";

      // APP-MEX-001D + D7: return business fields and invitation metadata
      return res.json({
        invitor: invitor
          ? {
              member_type:      invitor.member_type ?? null,
              email:            (invitor as any).email ?? null,
              join_date:        (invitor as any).join_date ?? null,
              // D7: invitation metadata for the relationship that connected this member
              invited_email:    receivedInvitation?.invited_email ?? null,
              invitation_created_at: receivedInvitation?.created_at ?? null,
              invitation_expires_at: receivedInvitation?.expires_at ?? null,
              invitation_status: receivedInvitation?.status ?? null,
              invitation_url: receivedInvitation?.token
                ? `${invitationBase}/invitation-link/${receivedInvitation.token}`
                : null,
            }
          : null,

        invitees: invitees.map(invitee => {
          const inviteeUserId = (invitee as any).user_id;
          const inv = inviteeUserId ? inviteeInvitationMap.get(inviteeUserId) : undefined;
          return {
            member_type:      invitee.member_type ?? null,
            email:            (invitee as any).email ?? null,
            join_date:        (invitee as any).join_date ?? null,
            activity_status:  invitee.activity_status ?? null,
            // D7: invitation metadata for this invitee relationship
            invited_email:    inv?.invited_email ?? null,
            invitation_created_at: inv?.created_at ?? null,
            invitation_expires_at: inv?.expires_at ?? null,
            invitation_status: inv?.status ?? null,
            invitation_url: inv?.token
              ? `${invitationBase}/invitation-link/${inv.token}`
              : null,
          };
        }),

        second_level_invitees: secondLevelInvitees.map(invitee => ({
          member_type:     invitee.member_type ?? null,
          join_date:       (invitee as any).join_date ?? null,
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

      try {
        const prefs = await supabaseDAL.getMemberProfilePreferences(member.id);
        return res.json(prefs);
      } catch (prefErr: any) {
        // D6: If the migration hasn't run yet (columns missing), return safe defaults
        // rather than a 500, to prevent blocking the UI before the migration is applied.
        const isColumnError =
          prefErr?.message?.includes("column") ||
          prefErr?.message?.includes("does not exist") ||
          prefErr?.code === "42703";
        if (isColumnError) {
          return res.json({
            avatar_reference:   null,
            profile_visibility: "private",
            contact_methods:    [],
          });
        }
        throw prefErr;
      }
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
    } catch (err: any) {
      // D6: Gracefully handle missing columns (migration not yet applied)
      const isColumnError =
        err?.message?.includes("column") ||
        err?.message?.includes("does not exist") ||
        err?.code === "42703";
      if (isColumnError) {
        // Return success to prevent UI error loops; migration must be applied to persist.
        console.warn("PUT_PROFILE_PREFERENCES_MIGRATION_PENDING", err?.message);
        return res.json({ success: true, migration_pending: true });
      }
      console.error("PUT_PROFILE_PREFERENCES_ERROR", err);
      return res.status(500).json({ error: "Failed to update profile preferences" });
    }
  }
);

export default router;
