# APP-REC-007M-20

## RPC Authorization Corridor Inspection


================================================================================
server/routes/member.ts
================================================================================

Lines 69-81
     69:     });
     70:   }
     71: });
     72: 
     73: /**
>>   74:  * GET /api/member/pending-invitation
     75:  */
     76: router.get("/pending-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
     77:   try {
     78:     const authReq = req as AuthenticatedRequest;
     79: const user = authReq.user;
     80: 
     81:     if (!user?.id || !user?.token) {

Lines 71-83
     71: });
     72: 
     73: /**
     74:  * GET /api/member/pending-invitation
     75:  */
>>   76: router.get("/pending-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
     77:   try {
     78:     const authReq = req as AuthenticatedRequest;
     79: const user = authReq.user;
     80: 
     81:     if (!user?.id || !user?.token) {
     82:       return res.status(401).json({
     83:         error: "Unauthorized"

Lines 97-109
     97:     }
     98: 
     99:     const supabaseAdmin = getServiceClient();
    100: 
    101:     await supabaseAdmin
>>  102:       .from("member_invitations")
    103:       .update({ invited_user_id: user.id })
    104:       .eq("status", "pending")
    105:       .is("invited_user_id", null)
    106:       .eq("invited_email", userEmail);
    107: 
    108:     const { data, error } = await supabaseAdmin
    109:       .from("member_invitations")

Lines 104-116
    104:       .eq("status", "pending")
    105:       .is("invited_user_id", null)
    106:       .eq("invited_email", userEmail);
    107: 
    108:     const { data, error } = await supabaseAdmin
>>  109:       .from("member_invitations")
    110:       .select("id, inviter_member_id, status, created_at")
    111:       .eq("invited_user_id", user.id)
    112:       .eq("status", "pending")
    113:       .order("created_at", { ascending: false })
    114:       .limit(1)
    115:       .maybeSingle();
    116: 

Lines 117-129
    117: 
    118:     if (error) {
    119:       console.error(error);
    120: 
    121:       return res.status(500).json({
>>  122:         error: "Failed to fetch invitation"
    123:       });
    124:     }
    125: 
    126:     return res.json({
    127:       has_pending_invitation: !!data,
    128:       invitation: data || null
    129:     });

Lines 122-134
    122:         error: "Failed to fetch invitation"
    123:       });
    124:     }
    125: 
    126:     return res.json({
>>  127:       has_pending_invitation: !!data,
    128:       invitation: data || null
    129:     });
    130:   } catch (err) {
    131:     console.error("========================================");
    132:     console.error("ACCEPT_INVITATION_EXCEPTION");
    133:     console.error("invitationId:", req.body?.invitationId);
    134:     console.error("userId:", (req as AuthenticatedRequest).user?.id ?? null);

Lines 123-135
    123:       });
    124:     }
    125: 
    126:     return res.json({
    127:       has_pending_invitation: !!data,
>>  128:       invitation: data || null
    129:     });
    130:   } catch (err) {
    131:     console.error("========================================");
    132:     console.error("ACCEPT_INVITATION_EXCEPTION");
    133:     console.error("invitationId:", req.body?.invitationId);
    134:     console.error("userId:", (req as AuthenticatedRequest).user?.id ?? null);
    135:     console.error("tokenPresent:", !!(req as AuthenticatedRequest).user?.token);

Lines 127-139
    127:       has_pending_invitation: !!data,
    128:       invitation: data || null
    129:     });
    130:   } catch (err) {
    131:     console.error("========================================");
>>  132:     console.error("ACCEPT_INVITATION_EXCEPTION");
    133:     console.error("invitationId:", req.body?.invitationId);
    134:     console.error("userId:", (req as AuthenticatedRequest).user?.id ?? null);
    135:     console.error("tokenPresent:", !!(req as AuthenticatedRequest).user?.token);
    136: 
    137:     if (err instanceof Error) {
    138:       console.error("name:", err.name);
    139:       console.error("message:", err.message);

Lines 128-140
    128:       invitation: data || null
    129:     });
    130:   } catch (err) {
    131:     console.error("========================================");
    132:     console.error("ACCEPT_INVITATION_EXCEPTION");
>>  133:     console.error("invitationId:", req.body?.invitationId);
    134:     console.error("userId:", (req as AuthenticatedRequest).user?.id ?? null);
    135:     console.error("tokenPresent:", !!(req as AuthenticatedRequest).user?.token);
    136: 
    137:     if (err instanceof Error) {
    138:       console.error("name:", err.name);
    139:       console.error("message:", err.message);
    140:       console.error("stack:");

Lines 150-162
    150:     });
    151:   }
    152: });
    153: 
    154: /**
>>  155:  * POST /api/member/invitations
    156:  */
    157: router.post("/invitations", attachUserContextSafe, async (req: Request, res: Response) => {
    158:   try {
    159:     const authReq = req as AuthenticatedRequest;
    160: const user = authReq.user;
    161: 
    162:     if (!user?.token || !user?.id) {

Lines 152-164
    152: });
    153: 
    154: /**
    155:  * POST /api/member/invitations
    156:  */
>>  157: router.post("/invitations", attachUserContextSafe, async (req: Request, res: Response) => {
    158:   try {
    159:     const authReq = req as AuthenticatedRequest;
    160: const user = authReq.user;
    161: 
    162:     if (!user?.token || !user?.id) {
    163:       return res.status(401).json({
    164:         error: {

Lines 232-244
    232:         }
    233:       });
    234:     }
    235: 
    236:     const data =
>>  237:       await supabaseDAL.createGatewayInvitation({
    238:         token,
    239:         inviter_user_id: user.id,
    240:         inviter_email: userEmail,
    241:         invited_email: invitedEmail ?? null,
    242:         phone_number: phoneNumber ?? null,
    243:         note: note ?? null
    244:       });

Lines 242-254
    242:         phone_number: phoneNumber ?? null,
    243:         note: note ?? null
    244:       });
    245: 
    246:     return res.status(201).json({
>>  247:       invitation: {
    248:         id: data.id,
    249:         status: data.status,
    250:         token: data.token
    251:       },
    252:       invitationUrl: `/hub/signup?invite=${data.token}`
    253:     });
    254: 

Lines 247-259
    247:       invitation: {
    248:         id: data.id,
    249:         status: data.status,
    250:         token: data.token
    251:       },
>>  252:       invitationUrl: `/hub/signup?invite=${data.token}`
    253:     });
    254: 
    255:   } catch (err) {
    256:     console.error(
    257:       "POST_INVITATIONS_RUNTIME",
    258:       err
    259:     );

Lines 252-264
    252:       invitationUrl: `/hub/signup?invite=${data.token}`
    253:     });
    254: 
    255:   } catch (err) {
    256:     console.error(
>>  257:       "POST_INVITATIONS_RUNTIME",
    258:       err
    259:     );
    260: 
    261:     return res.status(500).json({
    262:       error: {
    263:         code: "SERVER_ERROR",
    264:         message: "Server error"

Lines 267-279
    267:   }
    268: });
    269: 
    270: 
    271: /**
>>  272:  * POST /api/member/onboarding/materialize-invitation
    273:  */
    274: router.post(
    275:   "/onboarding/materialize-invitation",
    276:   attachUserContext,
    277:   async (req: Request, res: Response) => {
    278:     try {
    279:       const authReq = req as AuthenticatedRequest;

Lines 270-282
    270: 
    271: /**
    272:  * POST /api/member/onboarding/materialize-invitation
    273:  */
    274: router.post(
>>  275:   "/onboarding/materialize-invitation",
    276:   attachUserContext,
    277:   async (req: Request, res: Response) => {
    278:     try {
    279:       const authReq = req as AuthenticatedRequest;
    280:       const user = authReq.user;
    281: 
    282:       if (!user?.token || !user?.id) {

Lines 299-311
    299:         });
    300:       }
    301: 
    302:       const supabase = getUserClient(user.token);
    303: 
>>  304:       const { data: invitationId, error } =
    305:         await supabase.rpc(
    306:           "materialize_member_invitation_from_link",
    307:           {
    308:             p_token: inviteToken,
    309:           }
    310:         );
    311: 

Lines 301-313
    301: 
    302:       const supabase = getUserClient(user.token);
    303: 
    304:       const { data: invitationId, error } =
    305:         await supabase.rpc(
>>  306:           "materialize_member_invitation_from_link",
    307:           {
    308:             p_token: inviteToken,
    309:           }
    310:         );
    311: 
    312:       if (error) {
    313:         const msg =

Lines 315-327
    315: 
    316:         if (
    317:           msg.includes("not pending") ||
    318:           msg.includes("not found") ||
    319:           msg.includes("expired") ||
>>  320:           msg.includes("self-invitation") ||
    321:           msg.includes("not a canonical member")
    322:         ) {
    323:           console.error(
    324:             "MATERIALIZE_INVITATION_STATE_CONFLICT",
    325:             error.code,
    326:             error.message
    327:           );

Lines 319-331
    319:           msg.includes("expired") ||
    320:           msg.includes("self-invitation") ||
    321:           msg.includes("not a canonical member")
    322:         ) {
    323:           console.error(
>>  324:             "MATERIALIZE_INVITATION_STATE_CONFLICT",
    325:             error.code,
    326:             error.message
    327:           );
    328: 
    329:           return res.status(422).json({
    330:             error: {
    331:               code: "TOKEN_UNAVAILABLE",

Lines 328-340
    328: 
    329:           return res.status(422).json({
    330:             error: {
    331:               code: "TOKEN_UNAVAILABLE",
    332:               message:
>>  333:                 "This invitation token is unavailable.",
    334:             },
    335:           });
    336:         }
    337: 
    338:         if (
    339:           msg.includes("already a canonical member")
    340:         ) {

Lines 342-354
    342:             status: "already_member",
    343:           });
    344:         }
    345: 
    346:         console.error(
>>  347:           "MATERIALIZE_INVITATION_RPC_ERROR",
    348:           error.code,
    349:           error.message
    350:         );
    351: 
    352:         return res.status(500).json({
    353:           error: {
    354:             code: "INTERNAL_ERROR",

Lines 351-363
    351: 
    352:         return res.status(500).json({
    353:           error: {
    354:             code: "INTERNAL_ERROR",
    355:             message:
>>  356:               "Failed to materialize invitation.",
    357:           },
    358:         });
    359:       }
    360: 
    361:       return res.status(200).json({
    362:         status: "materialized",
    363:         invitationId,

Lines 358-370
    358:         });
    359:       }
    360: 
    361:       return res.status(200).json({
    362:         status: "materialized",
>>  363:         invitationId,
    364:       });
    365: 
    366:     } catch (err) {
    367:       console.error(
    368:         "MATERIALIZE_INVITATION_RUNTIME",
    369:         err
    370:       );

Lines 363-375
    363:         invitationId,
    364:       });
    365: 
    366:     } catch (err) {
    367:       console.error(
>>  368:         "MATERIALIZE_INVITATION_RUNTIME",
    369:         err
    370:       );
    371: 
    372:       return res.status(500).json({
    373:         error: "Server error",
    374:       });
    375:     }

Lines 375-387
    375:     }
    376:   }
    377: );
    378: 
    379: /**
>>  380:  * POST /api/member/accept-invitation
    381:  */
    382: router.post("/accept-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
    383:   try {
    384:     const authReq = req as AuthenticatedRequest;
    385: const user = authReq.user;
    386: 
    387:     if (!user?.token || !user?.id) {

Lines 377-389
    377: );
    378: 
    379: /**
    380:  * POST /api/member/accept-invitation
    381:  */
>>  382: router.post("/accept-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
    383:   try {
    384:     const authReq = req as AuthenticatedRequest;
    385: const user = authReq.user;
    386: 
    387:     if (!user?.token || !user?.id) {
    388:       return res.status(401).json({
    389:         error: "Unauthorized"

Lines 388-400
    388:       return res.status(401).json({
    389:         error: "Unauthorized"
    390:       });
    391:     }
    392: 
>>  393:     const invitationId =
    394:       req.body?.invitationId;
    395: 
    396:     if (!invitationId) {
    397:       return res.status(400).json({
    398:         error: "Missing invitationId"
    399:       });
    400:     }

Lines 389-401
    389:         error: "Unauthorized"
    390:       });
    391:     }
    392: 
    393:     const invitationId =
>>  394:       req.body?.invitationId;
    395: 
    396:     if (!invitationId) {
    397:       return res.status(400).json({
    398:         error: "Missing invitationId"
    399:       });
    400:     }
    401: 

Lines 391-403
    391:     }
    392: 
    393:     const invitationId =
    394:       req.body?.invitationId;
    395: 
>>  396:     if (!invitationId) {
    397:       return res.status(400).json({
    398:         error: "Missing invitationId"
    399:       });
    400:     }
    401: 
    402:     const supabase =
    403:       getUserClient(user.token);

Lines 393-405
    393:     const invitationId =
    394:       req.body?.invitationId;
    395: 
    396:     if (!invitationId) {
    397:       return res.status(400).json({
>>  398:         error: "Missing invitationId"
    399:       });
    400:     }
    401: 
    402:     const supabase =
    403:       getUserClient(user.token);
    404: 
    405:     const { data: memberId, error } =

Lines 402-414
    402:     const supabase =
    403:       getUserClient(user.token);
    404: 
    405:     const { data: memberId, error } =
    406:       await supabase.rpc(
>>  407:         "accept_member_invitation",
    408:         {
    409:           p_invitation_id: invitationId
    410:         }
    411:       );
    412: 
    413:     console.log(
    414:       "ACCEPT_INVITATION_RPC_RESULT",

Lines 404-416
    404: 
    405:     const { data: memberId, error } =
    406:       await supabase.rpc(
    407:         "accept_member_invitation",
    408:         {
>>  409:           p_invitation_id: invitationId
    410:         }
    411:       );
    412: 
    413:     console.log(
    414:       "ACCEPT_INVITATION_RPC_RESULT",
    415:       JSON.stringify({
    416:         invitationId,

Lines 409-421
    409:           p_invitation_id: invitationId
    410:         }
    411:       );
    412: 
    413:     console.log(
>>  414:       "ACCEPT_INVITATION_RPC_RESULT",
    415:       JSON.stringify({
    416:         invitationId,
    417:         memberId,
    418:         hasMemberId: memberId !== null && memberId !== undefined,
    419:         error: error?.message ?? null
    420:       }, null, 2)
    421:     );

Lines 411-423
    411:       );
    412: 
    413:     console.log(
    414:       "ACCEPT_INVITATION_RPC_RESULT",
    415:       JSON.stringify({
>>  416:         invitationId,
    417:         memberId,
    418:         hasMemberId: memberId !== null && memberId !== undefined,
    419:         error: error?.message ?? null
    420:       }, null, 2)
    421:     );
    422: 
    423:     if (!error && !memberId) {

Lines 422-434
    422: 
    423:     if (!error && !memberId) {
    424:       return res.status(500).json({
    425:         error: {
    426:           code: "RPC_RETURNED_NULL",
>>  427:           message: "accept_member_invitation completed without returning a member id."
    428:         }
    429:       });
    430:     }
    431: 
    432:     if (error) {
    433:       console.error(
    434:         "ACCEPT_INVITATION_RPC_ERROR",

Lines 429-441
    429:       });
    430:     }
    431: 
    432:     if (error) {
    433:       console.error(
>>  434:         "ACCEPT_INVITATION_RPC_ERROR",
    435:         error.code,
    436:         error.message
    437:       );
    438: 
    439:       const msg =
    440:         (error.message || "").toLowerCase();
    441: 

Lines 440-452
    440:         (error.message || "").toLowerCase();
    441: 
    442:       if (
    443:         error.code === "42501" ||
    444:         msg.includes("not authorized") ||
>>  445:         msg.includes("not your invitation") ||
    446:         msg.includes("permission denied")
    447:       ) {
    448:         return res.status(403).json({
    449:           error: {
    450:             code: "NOT_ALLOWED",
    451:             message:
    452:               "You are not authorized to accept this invitation."

Lines 445-457
    445:         msg.includes("not your invitation") ||
    446:         msg.includes("permission denied")
    447:       ) {
    448:         return res.status(403).json({
    449:           error: {
>>  450:             code: "NOT_ALLOWED",
    451:             message:
    452:               "You are not authorized to accept this invitation."
    453:           }
    454:         });
    455:       }
    456: 
    457:       if (

Lines 447-459
    447:       ) {
    448:         return res.status(403).json({
    449:           error: {
    450:             code: "NOT_ALLOWED",
    451:             message:
>>  452:               "You are not authorized to accept this invitation."
    453:           }
    454:         });
    455:       }
    456: 
    457:       if (
    458:         msg.includes("not found") ||
    459:         msg.includes("does not exist") ||

Lines 455-467
    455:       }
    456: 
    457:       if (
    458:         msg.includes("not found") ||
    459:         msg.includes("does not exist") ||
>>  460:         msg.includes("no invitation")
    461:       ) {
    462:         return res.status(404).json({
    463:           error: {
    464:             code: "INVITATION_NOT_FOUND",
    465:             message:
    466:               "Invitation not found."
    467:           }

Lines 459-471
    459:         msg.includes("does not exist") ||
    460:         msg.includes("no invitation")
    461:       ) {
    462:         return res.status(404).json({
    463:           error: {
>>  464:             code: "INVITATION_NOT_FOUND",
    465:             message:
    466:               "Invitation not found."
    467:           }
    468:         });
    469:       }
    470: 
    471:       if (

Lines 461-473
    461:       ) {
    462:         return res.status(404).json({
    463:           error: {
    464:             code: "INVITATION_NOT_FOUND",
    465:             message:
>>  466:               "Invitation not found."
    467:           }
    468:         });
    469:       }
    470: 
    471:       if (
    472:         error.code === "23514" ||
    473:         msg.includes("already accepted") ||

Lines 475-487
    475:         msg.includes("not pending") ||
    476:         msg.includes("expired")
    477:       ) {
    478:         return res.status(409).json({
    479:           error: {
>>  480:             code: "INVITATION_ALREADY_PROCESSED",
    481:             message:
    482:               "This invitation has already been accepted or is no longer valid."
    483:           }
    484:         });
    485:       }
    486: 
    487:       return res.status(500).json({

Lines 477-489
    477:       ) {
    478:         return res.status(409).json({
    479:           error: {
    480:             code: "INVITATION_ALREADY_PROCESSED",
    481:             message:
>>  482:               "This invitation has already been accepted or is no longer valid."
    483:           }
    484:         });
    485:       }
    486: 
    487:       return res.status(500).json({
    488:         error: {
    489:           code: "INTERNAL_ERROR",

Lines 486-498
    486: 
    487:       return res.status(500).json({
    488:         error: {
    489:           code: "INTERNAL_ERROR",
    490:           message:
>>  491:             "Failed to accept invitation."
    492:         }
    493:       });
    494:     }
    495: 
    496:     return res.json({
    497:       success: true
    498:     });

Lines 496-508
    496:     return res.json({
    497:       success: true
    498:     });
    499: 
    500:   } catch (err) {
>>  501:     console.error("ACCEPT_INVITATION_EXCEPTION", err);
    502:     console.error(err);
    503: 
    504:     return res.status(500).json({
    505:       error: "Server error"
    506:     });
    507:   }
    508: });


================================================================================
supabase/migrations/20260623022737_gateway_invitation_memorandum_metadata.sql
================================================================================

Lines 1-4
>>    1: ALTER TABLE public.gateway_invitations
      2: ADD COLUMN IF NOT EXISTS invited_email text,
      3: ADD COLUMN IF NOT EXISTS phone_number text,
      4: ADD COLUMN IF NOT EXISTS note text;

