=== POST-RECOVERY AUTH CONTINUITY MILESTONE ===
Timestamp: Wed May 13 11:16:07 PM UTC 2026

=== VERIFIED RUNTIME SURFACES ===
/hub/dashboard
/hub/member
/api/member/*
client/src/pages/MemberDashboard.tsx
client/src/pages/MemberHub.tsx
client/src/lib/queryClient.ts
server/middleware/attachUserContext.ts

=== VERIFIED AUTH CONTINUITY CONTRACT ===
localStorage.getItem("supabase.auth.token")
parsed.access_token
Authorization: Bearer <token>

=== VERIFIED EXECUTION OWNERSHIP SPLIT ===
MemberDashboard -> centralized apiRequest()
MemberHub -> localized fetchWithAuth()/postWithAuth()

=== VERIFIED QUERY OWNERSHIP ===
TanStack Query
retry: false
refetchOnWindowFocus: false
staleTime: Infinity

=== PROTECTED EXECUTION SURFACES ===
client/src/lib/queryClient.ts
client/src/pages/MemberHub.tsx

=== EXECUTION LAW ===
NO AUTH-CONTINUITY MUTATION WITHOUT SINGLE-FILE BLAST-RADIUS CONTAINMENT

=== VERIFIED RUNTIME DEPENDENCY CHAINS ===
MemberDashboard -> apiRequest() -> getAuthToken() -> Authorization header -> /api/member/*
MemberHub -> fetchWithAuth()/postWithAuth() -> getAuthToken() -> Authorization header -> /api/member/*

