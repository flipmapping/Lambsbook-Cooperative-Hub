import { Router, Request, Response } from 'express';
import { createAuthenticatedClient, isSupabaseMemberConfigured } from '../lib/supabase-member-client';
import { attachUserContext } from '../middleware/attachUserContext';
import { executeFinancialRpc } from '../services/financial-executor';
import { requireSuperAdmin } from '../middleware/requireSuperAdmin';
import { blockSbuInjection } from '../middleware/blockSbuInjection';
import { executeGovernanceRpc } from '../services/governance-executor';
import { governanceRateLimit } from '../middleware/governanceRateLimit';

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

    res.json({ user: { id: userId, is_super_admin: (req as any).user.is_super_admin }, member });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    res.status(500).json({ error: message });
  }
});

router.get('/subscription', attachUserContext, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const result = await executeFinancialRpc(
      user,
      "get_member_subscription",
      {}
    );

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    res.status(500).json({ error: message });
  }
});
