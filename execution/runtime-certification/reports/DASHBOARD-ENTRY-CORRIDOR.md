# Dashboard Entry Corridor Truth Inspection

## client/src/pages/HubAuthCallback.tsx

   72:           window.location.hash.substring(1),
  136:             await fetch("/api/hub/auth/link-referrer", {
  152:             await fetch("/api/member/onboarding/materialize-invitation", {
  168:           setLocation(destination);
  222:               onClick={() => setLocation("/hub/signup")}
  229:               onClick={() => setLocation("/hub")}

## client/src/lib/auth/RuntimeNavigationPolicy.ts

No corridor markers found.

## client/src/pages/MemberHub.tsx

    2: import { useQuery, useMutation } from "@tanstack/react-query";
  146: async function fetchWithAuth(url: string) {
  150:   const res = await fetch(url, {
  165:   const res = await fetch(url, {
  194:   const { data: profile, isLoading: profileLoading } = useQuery({
  195:     queryKey: ["/api/member/me"],
  196:     queryFn: () => fetchWithAuth("/api/member/me"),
  196:     queryFn: () => fetchWithAuth("/api/member/me"),
  200:   const { data: activity, isLoading: activityLoading } = useQuery<ActivityData>({
  202:     queryFn: () => fetchWithAuth("/api/member/recent-participation"),
  206:   const { data: earnings, isLoading: earningsLoading } = useQuery<any>({
  208:     queryFn: () => fetchWithAuth("/api/member/earnings"),
  212:   const { data: invitationData, isLoading: invitationLoading } = useQuery<any>({
  213:     queryKey: ["/api/member/pending-invitation"],
  214:     queryFn: () => fetchWithAuth("/api/member/pending-invitation"),
  214:     queryFn: () => fetchWithAuth("/api/member/pending-invitation"),
  218:   const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery<any>({
  220:     queryFn: () => fetchWithAuth("/api/member/trusted-relationships"),
  235:       queryClient.invalidateQueries({ queryKey: ["/api/member/programs"] });
  246:       queryClient.invalidateQueries({ queryKey: ["/api/member/programs"] });
  261:       queryClient.invalidateQueries({ queryKey: ["/api/member/activity"] });
  262:       queryClient.invalidateQueries({ queryKey: ["/api/member/earnings"] });
  307:       queryClient.invalidateQueries({ queryKey: ["/api/member/pending-invitation"] });
  307:       queryClient.invalidateQueries({ queryKey: ["/api/member/pending-invitation"] });
  308:       queryClient.invalidateQueries({ queryKey: ["/api/member/me"] });
  308:       queryClient.invalidateQueries({ queryKey: ["/api/member/me"] });

## server/routes/member.ts

    3: import { attachUserContext } from "../middleware/attachUserContext";
   16: const attachUserContextSafe = (req: Request, res: Response, next: NextFunction) => {
   23:   return attachUserContext(req as any, res as any, next);
   27:  * GET /api/member/me
   29: router.get("/me", attachUserContextSafe, async (req: Request, res: Response) => {
   74:  * GET /api/member/pending-invitation
   76: router.get("/pending-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
   76: router.get("/pending-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
  142: router.post("/invitations", attachUserContextSafe, async (req: Request, res: Response) => {
  259:   attachUserContext,
  365: router.post("/accept-invitation", attachUserContextSafe, async (req: Request, res: Response) => {
  475:   attachUserContextSafe,
  528:   attachUserContextSafe,
  573:   attachUserContextSafe,

## server/middleware/attachUserContext.ts

    5: export async function attachUserContext(req: Request, res: Response, next: NextFunction) {
   25:       console.error("[attachUserContext] auth.getUser failed", {

