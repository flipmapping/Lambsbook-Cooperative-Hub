# Stage-2 Query Structural Capture Report

Timestamp: 2026-07-19T15:57:39.951844+00:00

Target: `client/src/pages/MemberHub.tsx`

## Observed Repository Facts

### /api/member/me

- Lines: 194–198
- queryKey: `"/api/member/me"`

#### queryFn
```ts
() => fetchWithAuth("/api/member/me")
```

- enabled: `isAuthenticated`

#### Structural Characteristics
- arrow function

#### Complete Query Block
```ts
useQuery({
    queryKey: ["/api/member/me"],
    queryFn: () => fetchWithAuth("/api/member/me"),
    enabled: isAuthenticated,
  }
```

#### Implementation Implications
- Deterministic mutation shall operate only within this block.
- No repository mutation performed during this capture.

### /api/member/recent-participation

- Lines: 200–204
- queryKey: `"/api/member/recent-participation"`

#### queryFn
```ts
() => fetchWithAuth("/api/member/recent-participation")
```

- enabled: `isAuthenticated && !profileLoading && !!profile`

#### Structural Characteristics
- generic typing
- arrow function

#### Complete Query Block
```ts
useQuery<ActivityData>({
    queryKey: ["/api/member/recent-participation"],
    queryFn: () => fetchWithAuth("/api/member/recent-participation"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  }
```

#### Implementation Implications
- Deterministic mutation shall operate only within this block.
- No repository mutation performed during this capture.

### /api/member/earnings

- Lines: 206–210
- queryKey: `"/api/member/earnings"`

#### queryFn
```ts
() => fetchWithAuth("/api/member/earnings")
```

- enabled: `isAuthenticated && !profileLoading && !!profile`

#### Structural Characteristics
- generic typing
- arrow function

#### Complete Query Block
```ts
useQuery<any>({
    queryKey: ["/api/member/earnings"],
    queryFn: () => fetchWithAuth("/api/member/earnings"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  }
```

#### Implementation Implications
- Deterministic mutation shall operate only within this block.
- No repository mutation performed during this capture.

### /api/member/pending-invitation

- Lines: 212–216
- queryKey: `"/api/member/pending-invitation"`

#### queryFn
```ts
() => fetchWithAuth("/api/member/pending-invitation")
```

- enabled: `isAuthenticated && !profileLoading && !!profile`

#### Structural Characteristics
- generic typing
- arrow function

#### Complete Query Block
```ts
useQuery<any>({
    queryKey: ["/api/member/pending-invitation"],
    queryFn: () => fetchWithAuth("/api/member/pending-invitation"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  }
```

#### Implementation Implications
- Deterministic mutation shall operate only within this block.
- No repository mutation performed during this capture.

### /api/member/trusted-relationships

- Lines: 218–222
- queryKey: `"/api/member/trusted-relationships"`

#### queryFn
```ts
() => fetchWithAuth("/api/member/trusted-relationships")
```

- enabled: `isAuthenticated && !profileLoading && !!profile`

#### Structural Characteristics
- generic typing
- arrow function

#### Complete Query Block
```ts
useQuery<any>({
    queryKey: ["/api/member/trusted-relationships"],
    queryFn: () => fetchWithAuth("/api/member/trusted-relationships"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  }
```

#### Implementation Implications
- Deterministic mutation shall operate only within this block.
- No repository mutation performed during this capture.
