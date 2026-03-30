import { Router, Request, Response } from 'express';
import { createAuthenticatedClient, isSupabaseMemberConfigured } from '../lib/supabase-member-client';
import { attachUserContext } from '../middleware/attachUserContext';

const router = Router();

router.get('/test-auth', attachUserContext, async (req: Request, res: Response) => {
  if (!isSupabaseMemberConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const user = (req as any).user;
  if (!user?.token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const supabase = createAuthenticatedClient(user.token, 'meh');

  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .limit(1);

  if (error) {
    return res.json({ stage: 'rls_failed', error });
  }

  return res.json({ stage: 'auth_context_valid', sample: data });
});

export default router;
