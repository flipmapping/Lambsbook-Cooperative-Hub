import { Router, Request, Response } from 'express';
import { createAuthenticatedClient, isSupabaseMemberConfigured } from '../lib/supabase-member-client';
import { attachUserContext } from '../middleware/attachUserContext';

const router = Router();

function getAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

router.get('/test-auth', attachUserContext, async (req: Request, res: Response) => {
  if (!isSupabaseMemberConfigured()) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const supabase = createAuthenticatedClient(accessToken, 'meh');

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
