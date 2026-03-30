import { Response, NextFunction } from 'express'
import { getUserClient } from '../lib/supabaseClients'
import type { AuthenticatedRequest } from '../types/requestContext'

export interface SBURequest extends AuthenticatedRequest {
  sbu_id?: string
}

export async function requireSBUAccess(
  req: SBURequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Resolve user identity from Bearer token when not pre-populated by middleware
    if (!req.user?.id || !req.user?.token) {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'User not authenticated' })
      }
      const bearerToken = authHeader.slice(7).trim()
      if (!bearerToken) {
        return res.status(401).json({ error: 'User not authenticated' })
      }
      let client
      try {
        client = getUserClient(bearerToken)
      } catch {
        return res.status(503).json({ error: 'Auth service not configured' })
      }
      const { data: userData, error: userError } = await client.auth.getUser()
      if (userError || !userData?.user) {
        return res.status(401).json({ error: 'User not authenticated' })
      }
      req.user = { id: userData.user.id, token: bearerToken } as any
    }

    const { sbu_id } = req.params

    if (!sbu_id) {
      return res.status(400).json({ error: 'Missing sbu_id in route parameters' })
    }

    const token = req.user!.token!.trim()

    if (!token) {
      return res.status(401).json({ error: 'Missing JWT token' })
    }

    let supabase
    try {
      supabase = getUserClient(token)
    } catch {
      return res.status(503).json({ error: 'Auth service not configured' })
    }

    const { data, error } = await supabase
      .from('core.sbu_members')
      .select('sbu_id')
      .eq('user_id', req.user!.id)
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
