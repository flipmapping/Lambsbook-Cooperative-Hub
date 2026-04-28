import { useEffect, useRef, useState } from "react"
import { getMemberContext, type MemberContext } from "@/lib/memberClient"

interface UseMemberContextState {
  loading: boolean
  data: MemberContext
}

const DEFAULT_STATE: UseMemberContextState = {
  loading: true,
  data: {
    id: null,
    sbu_id: null,
    role: null,
    isAuthenticated: false
  }
}

export function useMemberContext(): UseMemberContextState {
  const [state, setState] = useState<UseMemberContextState>(DEFAULT_STATE)

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    async function load() {
      try {
        const result = await getMemberContext()

        if (!isMountedRef.current) return

        setState({
          loading: false,
          data: result
        })
      } catch {
        if (!isMountedRef.current) return

        setState({
          loading: false,
          data: {
            id: null,
            sbu_id: null,
            role: null,
            isAuthenticated: false
          }
        })
      }
    }

    load()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return state
}
