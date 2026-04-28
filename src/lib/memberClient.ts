// =========================================
// MEMBER ADAPTER — CANONICAL FRONTEND BOUNDARY
// =========================================

export interface MemberContext {
  id: string | null
  sbu_id: string | null
  role: string | null
  isAuthenticated: boolean
}

export interface PendingInvitation {
  has_pending_invitation: boolean
  invitation: any | null
}

const API_BASE = "/api/member"

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem("access_token")
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    return { __unauthorized: true }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    return { __invalid: true }
  }

  return data
}

export async function getMemberContext(): Promise<MemberContext> {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      }
    })

    const data = await handleResponse(res)

    if ((data as any)?.__unauthorized || (data as any)?.__invalid) {
      return {
        id: null,
        sbu_id: null,
        role: null,
        isAuthenticated: false
      }
    }

    return {
      id: data?.id ?? null,
      sbu_id: data?.sbu_id ?? null,
      role: data?.role ?? null,
      isAuthenticated: !!data?.id
    }
  } catch {
    return {
      id: null,
      sbu_id: null,
      role: null,
      isAuthenticated: false
    }
  }
}

export async function getPendingInvitation(): Promise<PendingInvitation> {
  try {
    const res = await fetch(`${API_BASE}/pending-invitation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      }
    })

    const data = await handleResponse(res)

    if ((data as any)?.__unauthorized || (data as any)?.__invalid) {
      return {
        has_pending_invitation: false,
        invitation: null
      }
    }

    return {
      has_pending_invitation: data?.has_pending_invitation ?? false,
      invitation: data?.invitation ?? null
    }
  } catch {
    return {
      has_pending_invitation: false,
      invitation: null
    }
  }
}

export async function acceptInvitation(): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/accept-invitation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      }
    })

    const data = await handleResponse(res)

    if ((data as any)?.__unauthorized || (data as any)?.__invalid) {
      return { success: false }
    }

    return {
      success: data?.success ?? false
    }
  } catch {
    return { success: false }
  }
}
