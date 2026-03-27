import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from './requireAuth'
import { getUserClient } from '../lib/supabaseClients'

export interface SBURequest extends AuthenticatedRequest {
  sbu_id?: string
}

export async function requireSBUAccess(
  req: SBURequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { sbu_id } = req.params

    if (!sbu_id) {
      return res.status(400).json({ error: 'Missing sbu_id in route parameters' })
    }

    const jwt = req.headers.authorization?.replace('Bearer ', '').trim()

    if (!jwt) {
      return res.status(401).json({ error: 'Missing JWT token' })
    }

    const supabase = getUserClient(jwt)

    // This query respects RLS automatically
    const { data, error } = await supabase
      .from('core.sbu_members')
      .select('sbu_id')
      .eq('user_id', req.user.id)
      .eq('sbu_id', sbu_id)
      .maybeSingle()

    if (error || !data) {
      return res.status(403).json({ error: 'Access denied to this SBU' })
    }

    req.sbu_id = sbu_id

    next()
  } catch (err) {
    return res.status(500).json({ error: 'SBU access validation failed' })
  }
}
