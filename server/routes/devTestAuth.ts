import { Router, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types/requestContext';
import { createAuthenticatedClient, isSupabaseMemberConfigured } from '../lib/supabase-member-client';
import { attachUserContext } from '../middleware/attachUserContext';

const router = Router();

router.get('/test-auth', attachUserContext, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!isSupabaseMemberConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const user = authReq.user;
  if (!user?.token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const supabase = createAuthenticatedClient(user.token, 'meh');

  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .limit(1);

  // --- MEMBERS PROBE ---
  const { data: membersData, error: membersError } = await supabase
    .from('members')
    .select('id')
    .limit(1);

  console.log("MEMBERS_CHECK", { membersData, membersError });
  // --- END PROBE ---


  if (error) {
    return res.json({ stage: 'rls_failed', error });
  }

  return res.json({ stage: 'auth_context_valid', sample: data });
});

export default router;
