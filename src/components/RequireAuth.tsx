import React from "react"
import { useMemberContext } from "@/hooks/useMemberContext"

interface RequireAuthProps {
  children: React.ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { loading, data } = useMemberContext()

  // Loading state
  if (loading) {
    return <div>Loading...</div>
  }

  // Not authenticated → block (no redirect yet)
  if (!data.isAuthenticated) {
    return <div>Unauthorized</div>
  }

  // Authenticated → render children
  return <>{children}</>
}
