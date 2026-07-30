# Notification Implementation Blueprint


## Certified Mutation Responsibilities

The following responsibilities are assigned from the inspected runtime.
These assignments are implementation guidance and should be verified
during the code mutation sprint before changes are committed.

## client/src/components/AIChatWidget.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L46: const response = await apiRequest('POST', '/api/ai/chat', {

## client/src/components/ContactSection.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L61: return apiRequest('POST', '/api/enquiries', {

## client/src/components/HubConsultationForm.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L82: return apiRequest('POST', '/api/enquiries', {

## client/src/components/admin/CommissionRulesManagement.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L101: return apiRequest('POST', '/api/hub/commission-rule-sets', data);
- L116: return apiRequest('POST', '/api/hub/commission-rules', data);
- L131: return apiRequest('DELETE', `/api/hub/commission-rules/${id}`, {});

## client/src/components/admin/EnrollmentWorkflow.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L58: const res = await apiRequest("POST", "/api/admin/program-eligibility", {
- L86: const res = await apiRequest("POST", "/api/admin/enrollment-payment", {

## client/src/components/admin/ProgramsManagement.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L86: return apiRequest('POST', '/api/hub/programs', data);
- L101: return apiRequest('PATCH', `/api/hub/programs/${id}`, data);

## client/src/components/admin/SBUManagement.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L59: return apiRequest('PATCH', `/api/hub/sbus/${id}`, data);

## client/src/components/admissions/ProspectActivityWorkspace.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L47: const res = await apiRequest(

## client/src/components/admissions/ProspectAdmissionDecisionWorkspace.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L96: const res = await apiRequest(
- L109: const res = await apiRequest(

## client/src/components/admissions/ProspectAppointmentWorkspace.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L84: const res = await apiRequest(
- L102: const res = await apiRequest(
- L130: const res = await apiRequest(
- L157: const res = await apiRequest(
- L177: const res = await apiRequest(

## client/src/components/admissions/ProspectDocumentWorkspace.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L75: const res = await apiRequest(
- L89: const res = await apiRequest(
- L117: const res = await apiRequest(
- L144: const res = await apiRequest(

## client/src/components/admissions/ProspectFollowupTaskWorkspace.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L58: const res = await apiRequest(
- L71: const res = await apiRequest(
- L101: const res = await apiRequest(
- L128: const res = await apiRequest(

## client/src/components/admissions/ProspectTimeline.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L52: const res = await apiRequest(

## client/src/components/dashboard/InvitationAcceptanceSection.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L50: const res = await apiRequest(

## client/src/components/dashboard/stubs.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L14: export function NotificationPreferencesPanel(_: any) { return null; }
- L16: export function NotificationBell(_: any) { return null; }

## client/src/components/notifications/ChannelSelector.tsx

**Primary Responsibility**: Notification runtime component

Relevant inspection findings:

- L21: <div role="group" aria-label="Notification channel" className="inline-flex rounded-md border border-gray-200 overflow-hidden">

## client/src/components/notifications/NotificationPreferencesPanel.tsx

**Primary Responsibility**: Notification runtime component

Relevant inspection findings:

- L7: export default function NotificationPreferencesPanel() {
- L78: Notification Preferences

## client/src/lib/queryClient.ts

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L23: export async function apiRequest(

## client/src/pages/AdminGovernance.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L79: const res = await apiRequest('POST', '/api/member/admin/close-period');
- L109: const res = await apiRequest('POST', '/api/member/admin/toggle-override', {
- L143: const res = await apiRequest('POST', '/api/member/admin/set-minimum-capital', {

## client/src/pages/AdminRevenueConsole.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L70: return await apiRequest("PUT", `/api/hub/products/${productId}/allocations`, { allocations });
- L91: return await apiRequest("PATCH", `/api/hub/partners/${id}`, { status });

## client/src/pages/AdmissionsWorkspace.tsx

**Primary Responsibility**: Publish AdmissionsStageTransitionEvent

Relevant inspection findings:

- L20: current_stage: string | null;
- L62: const res = await apiRequest("GET", "/api/admissions/prospects");
- L69: const stageMutation = useMutation({
- L71: const res = await apiRequest("PATCH", `/api/admissions/prospects/${id}/stage`, {
- L72: current_stage: stage,
- L93: stageMutation.mutate({ id: selectedId, stage: stageInput });
- L156: <Badge variant={stageBadgeVariant(p.current_stage)} className="text-xs">
- L157: {p.current_stage ?? "untracked"}
- L214: disabled={!stageInput || stageMutation.isPending}
- L220: {stageMutation.isPending ? "Saving…" : "Save"}

## client/src/pages/ApplicantActivityCenter.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L41: const res = await apiRequest(

## client/src/pages/ApplicantAdmissionDecisionCenter.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L70: const res = await apiRequest(

## client/src/pages/ApplicantAppointmentCenter.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L51: const res = await apiRequest(

## client/src/pages/ApplicantDocumentCenter.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L39: const res = await apiRequest("GET", `/api/admissions/prospects/${id}/documents`);

## client/src/pages/ApplicantFollowupTaskCenter.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L37: const res = await apiRequest(

## client/src/pages/ApplicantJourneyStatus.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L14: current_stage: string | null;
- L48: const res = await apiRequest("GET", `/api/admissions/prospects/${id}`);
- L55: const currentIdx = stageIndex(applicant?.current_stage ?? null);
- L112: applicant.current_stage === "enrolled" ? "default" :
- L113: applicant.current_stage === "offer_accepted" ? "default" :
- L114: applicant.current_stage === "withdrawn" ? "destructive" :
- L117: {applicant.current_stage?.replace(/_/g, " ") ?? "registered"}

## client/src/pages/ApplicantLifecycleTimeline.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L41: const res = await apiRequest(

## client/src/pages/ApplicantStatusLookup.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L24: const res = await apiRequest("GET", "/api/admissions/prospects");

## client/src/pages/Dashboard.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L43: import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferencesPanel";
- L116: return apiRequest('PATCH', `/api/enquiries/${id}`, data);
- L127: return apiRequest('POST', '/api/members', data);
- L138: return apiRequest('POST', '/api/partners', data);
- L313: <NotificationPreferencesPanel />
- L883: <CardTitle>Notification Channels</CardTitle>

## client/src/pages/EducationFeedback.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L90: const response = await apiRequest("POST", `/api/education/documents/${docId}/feedback`);
- L120: const response = await apiRequest("POST", "/api/education/process-all");

## client/src/pages/HubAdminDashboard.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L103: const res = await apiRequest("PATCH", `/api/admin/members/${id}/membership`, { membership_status: status });
- L115: const res = await apiRequest("PATCH", `/api/admin/members/${id}/activity`, { activity_status: status });
- L128: const res = await apiRequest("PATCH", `/api/admin/programs/${id}/${activate ? "activate" : "deactivate"}`);
- L140: const res = await apiRequest("PATCH", `/api/admin/earnings/${id}/pause`);
- L152: const res = await apiRequest("PATCH", `/api/admin/earnings/${id}/resume`);
- L164: const res = await apiRequest("PATCH", `/api/admin/tutors/${id}/status`, { tutor_status: status });
- L176: const res = await apiRequest("POST", "/api/admin/activity-decay/check");
- L191: const res = await apiRequest("POST", "/api/admin/tutors/check-free-class-requirement");

## client/src/pages/HubAuth.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L237: const res = await apiRequest("POST", `/api/hub/auth/${mode}`, data);
- L379: const res = await apiRequest("POST", "/api/hub/auth/forgot-password", {

## client/src/pages/HubDashboard.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L12: NotificationPreferencesPanel,
- L19: NotificationBell,
- L377: <NotificationBell />
- L411: <NotificationBell />
- L459: <NotificationPreferencesPanel />

## client/src/pages/Login.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L25: const result = await apiRequest("POST", "/api/auth/magic-link", { email });

## client/src/pages/MemberDashboard.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L25: meRes = await apiRequest("GET", "/api/member/me");
- L40: invRes = await apiRequest("GET", "/api/member/pending-invitation");
- L84: await apiRequest("POST", "/api/member/accept-invitation", {

## client/src/pages/PartnerOnboarding.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L70: return await apiRequest("POST", "/api/hub/partners", data);

## client/src/pages/ProspectDetailWorkspace.tsx

**Primary Responsibility**: Consume Notification Queue / Communications

Relevant inspection findings:

- L28: current_stage: string | null;
- L81: const res = await apiRequest("GET", `/api/admissions/prospects/${id}`);
- L90: const stageMutation = useMutation({
- L92: const res = await apiRequest("PATCH", `/api/admissions/prospects/${id}/stage`, {
- L93: current_stage: stage,
- L154: variant={stageBadgeVariant(prospect.current_stage)}
- L157: {prospect.current_stage ?? "untracked"}
- L177: <FieldRow label="Current Stage"      value={prospect.current_stage} />
- L207: disabled={!stageInput || stageMutation.isPending}
- L208: onClick={() => stageMutation.mutate(stageInput)}
- L210: {stageMutation.isPending ? "Saving…" : "Update Stage"}
- L214: Current stage: <span className="font-medium">{prospect.current_stage ?? "untracked"}</span>

## client/src/pages/ResetPassword.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L69: const res = await apiRequest("POST", "/api/hub/auth/reset-password", {

## client/src/pages/TranscriptSubmission.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L92: const response = await apiRequest("POST", "/api/education/generate-feedback", payload);

## client/src/pages/dashboard/InvitationAcceptancePage.tsx

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L15: await apiRequest(

## server/lib/supabase-dal.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L107: current_stage: data.current_stage ?? 'registered',
- L125: current_stage: string | null;
- L140: prospect_journeys ( current_stage, funnels ( code ) )
- L155: current_stage:       row.prospect_journeys?.[0]?.current_stage ?? null,
- L168: current_stage: string | null;
- L183: prospect_journeys ( current_stage, funnels ( code ) )
- L200: current_stage:       data.prospect_journeys?.[0]?.current_stage ?? null,
- L213: .update({ current_stage: stage })

## server/lib/supabase-types.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L277: current_stage: string;
- L284: current_stage?: string;

## server/routes.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L130: }).catch((err) => console.error("Notification error:", err));
- L316: app.patch("/api/admissions/prospects/:id/stage", async (req: Request, res: Response) => {
- L318: const { current_stage } = req.body;
- L319: if (!current_stage || typeof current_stage !== "string") {
- L320: return res.status(400).json({ error: "current_stage is required" });
- L323: const fromStage = existingProspect?.current_stage ?? null;
- L324: const journey = await updateProspectStage(req.params.id, current_stage);
- L331: current_stage,
- L654: const notificationsList = await storage.getNotifications(

## server/routes/notification-preferences.route.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L6: res.json({ success: true, message: "Notification preferences endpoint live" });

## server/services/admissions.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L6: import { sendNotification } from "./notifications";
- L40: current_stage: 'registered',
- L65: await sendNotification({

## server/services/notifications.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L6: // Public contracts preserved: sendNotification(), sendEmail(), NotificationPayload
- L27: export interface NotificationPayload {
- L39: export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
- L41: const notification = await storage.createNotification({
- L54: await storage.updateNotification(notification.id, {
- L59: await storage.updateNotification(notification.id, {
- L75: console.error("Notification error:", error);
- L80: async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
- L143: await sendNotification({
- L164: await sendNotification({
- L184: await sendNotification({
- L197: // Invoked only when NotificationPayload.zaloPhone is present.
- L201: payload: NotificationPayload

## server/storage.ts

**Primary Responsibility**: Persist NotificationIntent and orchestrate pipeline

Relevant inspection findings:

- L9: type Notification, type InsertNotification, notifications,
- L15: import { notificationPreferences, InsertNotificationPreferences } from "@shared/schema";
- L51: getNotifications(recipientId?: string): Promise<Notification[]>;
- L52: createNotification(notification: InsertNotification): Promise<Notification>;
- L53: updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification | undefined>;
- L213: async getNotificationPreferences(recipientId: string, recipientType: string) {
- L225: async upsertNotificationPreferences(data: InsertNotificationPreferences) {
- L226: const existing = await this.getNotificationPreferences(data.recipientId, data.recipientType);
- L249: async getNotifications(recipientId?: string): Promise<Notification[]> {
- L256: async createNotification(notification: InsertNotification): Promise<Notification> {
- L261: async updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification | undefined> {

## shared/organization/capability-registry.ts

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L42: authority: "Notifications",

## shared/schema.ts

**Primary Responsibility**: Supporting surface

Relevant inspection findings:

- L146: // === Notification Preferences ===
- L163: export const insertNotificationPreferencesSchema =
- L166: export type InsertNotificationPreferences =
- L167: z.infer<typeof insertNotificationPreferencesSchema>;
- L169: export type NotificationPreferences =
- L172: export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
- L173: export type InsertNotification = z.infer<typeof insertNotificationSchema>;
- L174: export type Notification = typeof notifications.$inferSelect;


## Certified Runtime Pipeline

AdmissionsStageTransitionEvent
        │
        ▼
NotificationTemplateResolver
        │
        ▼
CommunicationIntent
        │
        ▼
NotificationIntentStore
        │
        ▼
NotificationQueue
        │
  ┌─────┴─────┐
  ▼           ▼
Resend      Zalo

Repository mutation SHALL begin only after this blueprint has been
reviewed against the inspected implementation surfaces.
