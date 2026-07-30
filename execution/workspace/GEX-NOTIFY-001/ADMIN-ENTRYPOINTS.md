# Admin Entrypoint Inspection

Generated: 2026-07-29 14:12:10 UTC

Candidate Matches: 59


## client/src/App.tsx

- L51: const HubAdminDashboard = lazy(() => import('@/pages/HubAdminDashboard'));
- L51: const HubAdminDashboard = lazy(() => import('@/pages/HubAdminDashboard'));
- L142: <Route path="/" component={HubLanding} />
- L143: <Route path="/hub" component={HubLanding} />
- L144: <Route path="/journeys/contribute" component={JourneyContribute} />
- L145: <Route path="/journeys/learn" component={JourneyLearn} />
- L148: <Route path="/admin" component={Dashboard} />
- L149: <Route path="/dashboard" component={HubDashboard} />
- L150: <Route path="/login" component={Login} />
- L151: <Route path="/auth/callback" component={AuthCallback} />
- L154: <Route path="/hub/login">{() => <HubAuth mode="login" />}</Route>
- L155: <Route path="/hub/signup">{() => <HubAuth mode="signup" />}</Route>
- L156: <Route path="/hub/auth/callback" component={HubAuthCallback} />
- L157: <Route path="/auth/reset" component={ResetPassword} />
- L158: <Route path="/hub/dashboard" component={MemberHub} />
- L159: <Route
- L163: <Route path="/hub/accept-invitation" component={HubDashboard} />
- L164: <Route path="/hub/member" component={HubDashboard} />
- L167: <Route path="/hub/sbu/education" component={SBUEducation} />
- L168: <Route path="/hub/sbu/education/lambsbook-tutoring" component={LambsbookTutoring} />
- L169: <Route path="/hub/programs/tropicana" component={TropicanaProgram} />
- L170: <Route path="/hub/vision/farmstay" component={FarmstayVision} />
- L171: <Route path="/hub/partner-onboarding" component={PartnerOnboarding} />
- L172: <Route path="/hub/prospect-registration" component={ProspectRegistration} />
- L173: <Route path="/hub/scholarships" component={ScholarshipsPage} />
- L174: <Route path="/hub/admin/prospects/:id" component={ProspectDetailWorkspace} />
- L174: <Route path="/hub/admin/prospects/:id" component={ProspectDetailWorkspace} />
- L175: <Route path="/hub/applicant/status/:id" component={ApplicantJourneyStatus} />
- L176: <Route path="/hub/applicant/status" component={ApplicantStatusLookup} />
- L177: <Route path="/hub/applicant/documents/:id" component={ApplicantDocumentCenter} />
- L178: <Route path="/hub/applicant/appointments/:id" component={ApplicantAppointmentCenter} />
- L179: <Route path="/hub/applicant/decisions/:id" component={ApplicantAdmissionDecisionCenter} />
- L180: <Route path="/hub/applicant/timeline/:id" component={ApplicantLifecycleTimeline} />
- L181: <Route path="/hub/applicant/activity/:id" component={ApplicantActivityCenter} />
- L182: <Route path="/hub/applicant/tasks/:id" component={ApplicantFollowupTaskCenter} />
- L183: <Route path="/hub/admin/revenue" component={AdminRevenueConsole} />
- L183: <Route path="/hub/admin/revenue" component={AdminRevenueConsole} />
- L184: <Route path="/hub/admin" component={HubAdminDashboard} />
- L184: <Route path="/hub/admin" component={HubAdminDashboard} />
- L184: <Route path="/hub/admin" component={HubAdminDashboard} />
- L184: <Route path="/hub/admin" component={HubAdminDashboard} />
- L184: <Route path="/hub/admin" component={HubAdminDashboard} />
- L185: <Route path="/hub/admin/governance" component={AdminGovernance} />
- L185: <Route path="/hub/admin/governance" component={AdminGovernance} />
- L186: <Route path="/hub/education/feedback" component={EducationFeedback} />
- L187: <Route path="/hub/education/submit" component={TranscriptSubmission} />
- L190: <Route path="/growth" component={GrowthLandingPage} />
- L191: <Route path="/immigration" component={ImmigrationWebsite} />
- L231: <Router />

## client/src/pages/AdmissionsWorkspace.tsx

- L159: <Link href={`/hub/admin/prospects/${p.id}`}>

## client/src/pages/HubAdminDashboard.tsx

- L74: export default function HubAdminDashboard() {
- L74: export default function HubAdminDashboard() {

## client/src/pages/MemberHub.tsx

- L19: import HubAdminDashboard from "@/pages/HubAdminDashboard";
- L19: import HubAdminDashboard from "@/pages/HubAdminDashboard";
- L385: return <HubAdminDashboard />;
- L385: return <HubAdminDashboard />;

## client/src/pages/ProspectDetailWorkspace.tsx

- L73: const [, params] = useRoute("/hub/admin/prospects/:id");
- L116: <Link href="/hub/admin">
- L136: <Link href="/hub/admin">
