# memberhub_invitations_realization_v1

## 1. Canonical invitation endpoint
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

## 2. Existing MemberHub insertion point

                        <div className="text-xs text-muted-foreground">
                          Period: {earning.period}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Membership invitations and invitation status
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!invitationData?.has_pending_invitation ? (
                <div className="text-sm text-muted-foreground">
                  No pending invitation.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">
                      Invitation Found
                    </div>

                    <div className="text-xs text-muted-foreground">
                      ID: {invitationData?.invitation?.id}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Status: {invitationData?.invitation?.status}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created: {invitationData?.invitation?.created_at}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trusted Relationships</CardTitle>
              <CardDescription>
                Invitor and direct invitee relationships
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">

              <div className="border rounded-lg p-3">
                <div className="font-medium">
                  Invitor
                </div>

                <div className="text-sm text-muted-foreground">
                  {relationshipsData?.invitor?.id || "No invitor recorded"}
                </div>

## 3. Invitation data source
206-
207-  const { data: invitationData, isLoading: invitationLoading } = useQuery<any>({
208:    queryKey: ["/api/member/pending-invitation"],
209:    queryFn: () => fetchWithAuth("/api/member/pending-invitation"),
210-    enabled: isAuthenticated,
211-  });
212-
213-  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery<any>({
214-    queryKey: ["/api/member/trusted-relationships"],

## 4. Patch scope candidates
133: * POST /api/member/invitations
241: * POST /api/member/accept-invitation
243:router.post("/accept-invitation", attachUserContextSafe, async (req: Request, res: Response) => {

## 5. Runtime verification plan inputs
389:          <TabsTrigger value="invitations" data-testid="tab-invitations">Invitations</TabsTrigger>
633:        <TabsContent value="invitations" className="space-y-4">


ARTIFACT_READY=YES
