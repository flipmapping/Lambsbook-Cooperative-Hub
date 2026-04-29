import React from "react"
import { useMemberContext } from "@/hooks/useMemberContext"

interface RequireAuthProps {
  children: React.ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { loading, data } = useMemberContext()

  // Loading state
  if (loading) {
    return <div>Checking access...</div>
  }

  // Not authenticated → block (no redirect yet)
  if (!data.isAuthenticated) {
    return (<div>Access not available<div><button onClick={() => window.location.reload()}>Retry</button></div></div>)
  }

  // Authenticated → render children
  return <>{children}</>
}
