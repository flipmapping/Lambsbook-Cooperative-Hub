router.get('/pending-invitation', attachUserContext, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (!isSupabaseMemberConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const user = authReq.user;

  if (!user?.id) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    const supabaseUser = createAuthenticatedClient(user.token);
    const { data: userEmail, error: emailError } = await supabaseUser.rpc('get_my_auth_email');

    if (emailError || !userEmail) {
      console.error('[GET /pending-invitation] email resolution error:', emailError);
      return res.status(500).json({ error: 'Failed to resolve user email' });
    }

    const supabase = createAuthenticatedClient(user.token);

    const { data: invitation, error } = await supabase
      .from('member_invitations')
      .select('id')
      .eq('invited_email', userEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      console.error('[GET /pending-invitation] query error:', error);
      return res.status(500).json({ error: 'Failed to check pending invitation' });
    }

    if (!invitation) {
      return res.status(200).json({ invitation: null });
    }

    return res.status(200).json({ invitation: { id: invitation.id } });
  } catch (err) {
    console.error('[GET /pending-invitation] internal error:', err);
    return res.status(500).json({ error: 'Failed to check pending invitation' });
  }
});
