import { Router, Request, Response } from 'express';
import { createAuthenticatedClient, isSupabaseMemberConfigured } from '../lib/supabase-member-client';
import { attachUserContext } from '../middleware/attachUserContext';
import { executeFinancialRpc } from '../services/financial-executor';

const router = Router();

function getAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

function requireAuth(req: Request, res: Response): ReturnType<typeof createAuthenticatedClient> | null {
  if (!isSupabaseMemberConfigured()) {
    res.status(503).json({ error: 'Supabase not configured' });
    return null;
  }
  
  const token = getAccessToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  
  return createAuthenticatedClient(token);
}

router.get('/debug-session', attachUserContext, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const token = (req as any).user.token;

  if (!isSupabaseMemberConfigured()) {
    return res.json({ error: 'Supabase not configured', tokenPresent: !!token });
  }

  try {
    const mehClient = createAuthenticatedClient(token, 'meh');
    const { data: rpcData, error: rpcError } = await mehClient.rpc('get_my_member_financial_summary');

    res.json({
      tokenPresent: true,
      user: {
        id: userId,
      },
      rpc: {
        data: rpcData,
        error: rpcError?.message || null,
      },
    });
  } catch (err) {
    console.error('[DEBUG] Exception:', err);
    res.json({ error: String(err), tokenPresent: true });
  }
});

router.post('/ensure', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: existing } = await supabase
      .from('members')
      .select('id, email, member_type, membership_status')
      .eq('id', userId)
      .single();

    if (existing) {
      return res.json({ member: existing, created: false });
    }

    const { data: newMember, error: insertError } = await supabase
      .from('members')
      .insert({
        id: userId,
        member_type: 'standard',
        membership_status: 'free',
        activity_status: 'active',
        join_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Ensure member insert error:', insertError);
      return res.status(500).json({ error: insertError.message });
    }

    res.json({ member: newMember, created: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to ensure member';
    res.status(500).json({ error: message });
  }
});

router.get('/profile', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ user: { id: userId }, member });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    res.status(500).json({ error: message });
  }
});

router.get('/subscription', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: member } = await supabase
      .from('members')
      .select('id, membership_status, subscription_price_at_signup, subscription_renewal_date')
      .eq('id', userId)
      .single();

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('member_id', userId)
      .order('renewal_date', { ascending: false });

    res.json({
      member,
      subscriptions: subscriptions || [],
      benefits: {
        free: {
          earning_programs: 2,
          description: 'Earn from up to 2 selected programs',
        },
        paid: {
          earning_programs: 'unlimited',
          description: 'Earn from all programs automatically',
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    res.status(500).json({ error: message });
  }
});

router.get('/collaboration', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: asInvitee } = await supabase
      .from('collaborations')
      .select('*, invitor:invitor_id(id, member_type)')
      .eq('invitee_id', userId)
      .single();

    const { data: asInvitor } = await supabase
      .from('collaborations')
      .select('*, invitee:invitee_id(id, member_type)')
      .eq('invitor_id', userId);

    res.json({
      invitor: asInvitee?.invitor || null,
      collaboration_status: asInvitee?.status || null,
      invitees: asInvitor || [],
      explanation: {
        how_it_works: 'When your direct invitees participate in programs, you earn a commission on their activity.',
        earning_flow: 'Earnings flow only from your direct invitees to you. Multi-level cascades are not supported.',
        status_meaning: {
          active: 'Collaboration is active and earning is enabled',
          paused: 'Collaboration is paused - no earnings during this period',
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch collaboration';
    res.status(500).json({ error: message });
  }
});

router.get('/programs', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: member } = await supabase
      .from('members')
      .select('membership_status')
      .eq('id', userId)
      .single();

    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    const { data: eligibility } = await supabase
      .from('program_eligibility')
      .select('*')
      .eq('member_id', userId);

    const eligibilityMap = new Map(
      (eligibility || []).map(e => [e.program_id, e])
    );

    const programsWithEligibility = (programs || []).map(p => ({
      ...p,
      eligibility: eligibilityMap.get(p.id) || null,
      can_earn: member?.membership_status === 'paid' || eligibilityMap.get(p.id)?.eligible === true,
    }));

    const selectedCount = (eligibility || []).filter(e => e.eligible).length;
    const maxSelectableFree = 2;

    res.json({
      programs: programsWithEligibility,
      membership_status: member?.membership_status || 'free',
      selected_count: selectedCount,
      max_selectable: member?.membership_status === 'paid' ? 'unlimited' : maxSelectableFree,
      can_select_more: member?.membership_status === 'paid' || selectedCount < maxSelectableFree,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch programs';
    res.status(500).json({ error: message });
  }
});

router.post('/programs/:id/select', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const { id: programId } = req.params;
    const userId = (req as any).user.id;

    const { data: member } = await supabase
      .from('members')
      .select('membership_status')
      .eq('id', userId)
      .single();

    if (member?.membership_status !== 'paid') {
      const { data: currentEligibility } = await supabase
        .from('program_eligibility')
        .select('*')
        .eq('member_id', userId)
        .eq('eligible', true);

      if ((currentEligibility || []).length >= 2) {
        return res.status(400).json({ 
          error: 'Free members can only select up to 2 programs. Upgrade to paid for unlimited access.' 
        });
      }
    }

    const { data: existing } = await supabase
      .from('program_eligibility')
      .select('*')
      .eq('member_id', userId)
      .eq('program_id', programId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('program_eligibility')
        .update({ eligible: true })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    const { data, error } = await supabase
      .from('program_eligibility')
      .insert({
        member_id: userId,
        program_id: programId,
        eligible: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to select program';
    res.status(500).json({ error: message });
  }
});

router.post('/programs/:id/deselect', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const { id: programId } = req.params;
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('program_eligibility')
      .update({ eligible: false })
      .eq('member_id', userId)
      .eq('program_id', programId)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to deselect program';
    res.status(500).json({ error: message });
  }
});

router.get('/financial-summary', attachUserContext, async (req: Request, res: Response) => {
  if (!isSupabaseMemberConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  try {
    const data = await executeFinancialRpc(
      (req as any).user,
      "export_financial_system_state",
      {}
    );

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.json({ summary: null });
    }

    const row = Array.isArray(data) ? data[0] : data;
    res.json({
      summary: {
        net_balance: Number(row.net_balance ?? 0),
        total_credits: Number(row.total_credits ?? 0),
        total_debits: Number(row.total_debits ?? 0),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch financial summary';
    res.status(500).json({ error: message });
  }
});

router.get('/earnings', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: member } = await supabase
      .from('members')
      .select('activity_status')
      .eq('id', userId)
      .single();

    if (member?.activity_status === 'inactive') {
      return res.json({
        earnings: [],
        hidden: true,
        message: 'Your earnings are hidden because your account is inactive. Complete an activity to reactivate.',
      });
    }

    const { data: earnings } = await supabase
      .from('earnings')
      .select('*, program:program_id(name, sbu)')
      .eq('member_id', userId)
      .order('created_at', { ascending: false });

    const summary = {
      pending: 0,
      paid: 0,
      paused: 0,
      total: 0,
    };

    (earnings || []).forEach(e => {
      const amount = Number(e.amount);
      summary.total += amount;
      if (e.earning_status === 'pending') summary.pending += amount;
      if (e.earning_status === 'paid') summary.paid += amount;
      if (e.earning_status === 'paused') summary.paused += amount;
    });

    res.json({
      earnings: earnings || [],
      summary,
      hidden: false,
      status_explanation: {
        pending: 'Awaiting payout processing',
        paid: 'Successfully paid out',
        paused: 'Temporarily paused due to inactivity or admin action',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch earnings';
    res.status(500).json({ error: message });
  }
});

router.get('/tutor-profile', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: tutor } = await supabase
      .from('tutors')
      .select('*')
      .eq('member_id', userId)
      .single();

    const isVisible = tutor && ['verified', 'partner_educator'].includes(tutor.tutor_status);

    res.json({
      tutor,
      is_visible: isVisible,
      visibility_explanation: {
        requirement: 'Only tutors with verified or partner_educator status appear in search results.',
        free_class: 'Maintain at least 30 minutes of free classes per month to keep verified status.',
        status_levels: {
          unverified: 'Not visible in search. Complete verification requirements to become visible.',
          verified: 'Visible in search. Must maintain free class requirement.',
          partner_educator: 'Highest visibility. Featured in search results.',
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tutor profile';
    res.status(500).json({ error: message });
  }
});

router.get('/activity', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const userId = (req as any).user.id;

    const { data: member } = await supabase
      .from('members')
      .select('activity_status, last_activity_at, join_date')
      .eq('id', userId)
      .single();

    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const inactivityThresholdMonths = 3;
    const lastActivity = member?.last_activity_at 
      ? new Date(member.last_activity_at) 
      : new Date(member?.join_date || Date.now());
    
    const warningThreshold = new Date();
    warningThreshold.setMonth(warningThreshold.getMonth() - (inactivityThresholdMonths - 1));
    
    const isNearInactive = lastActivity < warningThreshold && member?.activity_status === 'active';

    res.json({
      activity_status: member?.activity_status || 'active',
      last_activity_at: member?.last_activity_at,
      recent_logs: logs || [],
      warning: isNearInactive ? {
        message: 'Your account will become inactive soon if no activity is recorded.',
        consequence: 'Inactive accounts have their pending earnings paused.',
        action: 'Complete any program activity to stay active.',
      } : null,
      reactivation: member?.activity_status === 'inactive' ? {
        message: 'Your account is currently inactive.',
        consequence: 'Your pending earnings are paused.',
        action: 'Complete any program activity to reactivate your account and resume earnings.',
      } : null,
      inactivity_threshold: `${inactivityThresholdMonths} months`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity';
    res.status(500).json({ error: message });
  }
});

router.post('/activity/log', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const { activity_type } = req.body;
    const userId = (req as any).user.id;

    const { data: log, error } = await supabase
      .from('activity_logs')
      .insert({
        member_id: userId,
        activity_type: activity_type || 'general',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('members')
      .update({
        last_activity_at: new Date().toISOString(),
        activity_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    res.json({ success: true, log });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log activity';
    res.status(500).json({ error: message });
  }
});

export default router;
