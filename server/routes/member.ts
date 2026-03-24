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

router.post('/enrollment', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  const { program_id } = req.body;

  if (!program_id) {
    return res.status(400).json({ error: 'program_id is required' });
  }

  try {
    const member_id = (req as any).user.id;
    const client = createAuthenticatedClient((req as any).user.token, 'public');

    const { data, error } = await client.rpc(
      'create_program_enrollment_payment_event',
      {
        p_member_id: member_id,
        p_program_id: program_id,
        p_amount: 0,
        p_reference: null,
      }
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const enrollment_request_id = typeof data === 'string' ? data : (data as any)?.id ?? data;

    return res.status(201).json({
      enrollment_request_id,
      status: 'draft',
      message: 'Enrollment request created. You are now part of this program.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create enrollment request';
    return res.status(500).json({ error: message });
  }
});

router.get('/enrollment/eligibility', attachUserContext, async (req: Request, res: Response) => {
  const supabase = requireAuth(req, res);
  if (!supabase) return;

  try {
    const member_id = (req as any).user.id;

    const { data, error } = await supabase
      .from('program_eligibility')
      .select('program_id, programs!inner ( id, name, is_active )')
      .eq('member_id', member_id)
      .eq('eligible', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const programs = (data ?? [])
      .filter((row: any) => row.programs?.is_active === true)
      .map((row: any) => ({
        program_id: row.program_id,
        program_name: row.programs.name,
        eligibility_state: 'eligible',
        can_start_enrollment: true,
      }));

    return res.json({ programs });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch eligibility';
    return res.status(500).json({ error: message });
  }
});

router.post('/invitations', async (req: Request, res: Response) => {
  if (!isSupabaseMemberConfigured()) {
    return res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Service is not configured.' } });
  }

  const token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } });
  }

  const authClient = createAuthenticatedClient(token);
  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData?.user) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } });
  }

  const { invitedEmail } = req.body;

  if (!invitedEmail || typeof invitedEmail !== 'string' || invitedEmail.trim() === '') {
    return res.status(400).json({
      error: {
        code: 'INVALID_EMAIL',
        message: 'invitedEmail is required and must be a non-empty string',
        field: 'invitedEmail',
      },
    });
  }

  try {
    const client = createAuthenticatedClient(token, 'public');

    const { data, error } = await client.rpc('issue_member_invitation', {
      p_invited_user_id: null,
      p_invited_email: invitedEmail.trim(),
    });

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_INVITATION',
            message: 'An invitation to this email already exists or the user is already a member',
          },
        });
      }
      if (error.code === '42501' || error.code === 'P0001' || error.message?.toLowerCase().includes('not a member')) {
        return res.status(403).json({
          error: {
            code: 'NOT_ALLOWED',
            message: 'You must be a member to issue invitations',
          },
        });
      }
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to issue invitation',
        },
      });
    }

    const row = typeof data === 'object' && data !== null ? data : {};

    return res.status(201).json({
      invitation: {
        id: (row as any).id ?? null,
        invitedUserId: (row as any).invited_user_id ?? null,
        invitedEmail: (row as any).invited_email ?? invitedEmail.trim(),
        status: (row as any).status ?? 'pending',
        createdAt: (row as any).created_at ?? null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

export default router;
