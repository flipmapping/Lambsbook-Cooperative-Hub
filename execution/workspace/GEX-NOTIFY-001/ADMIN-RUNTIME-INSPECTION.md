# ADMIN RUNTIME INSPECTION

================================================================================
client/src/App.tsx
================================================================================

0001: import { useRef, lazy, Suspense } from 'react';
0002: import { Switch, Route } from 'wouter';
0003: import { queryClient } from './lib/queryClient';
0004: import { QueryClientProvider } from '@tanstack/react-query';
0005: import { Toaster } from '@/components/ui/toaster';
0006: import { TooltipProvider } from '@/components/ui/tooltip';
0007: import { LanguageProvider } from '@/lib/LanguageContext';
0008: import { createClient } from '@/lib/supabase/client';
0009: import { Header } from '@/components/Header';
0010: import { HeroSection } from '@/components/HeroSection';
0011: import { EB3Categories } from '@/components/EB3Categories';
0012: import { ServicesSection } from '@/components/ServicesSection';
0013: import { ProcessSection } from '@/components/ProcessSection';
0014: import { JobCategoriesSection } from '@/components/JobCategoriesSection';
0015: import { CountriesSection } from '@/components/CountriesSection';
0016: import { StudyAbroadSection } from '@/components/StudyAbroadSection';
0017: import { AdvantagesSection } from '@/components/AdvantagesSection';
0018: import { SuccessStories } from '@/components/SuccessStories';
0019: import { FAQSection } from '@/components/FAQSection';
0020: import { ContactSection } from '@/components/ContactSection';
0021: import { Footer } from '@/components/Footer';
0022: import { AIChatWidget } from '@/components/AIChatWidget';
0023: 
0024: import AuthCallback from '@/pages/AuthCallback';
0025: import Login from '@/pages/Login';
0026: import HubLanding from '@/pages/HubLanding';
0027: import { LandingPage as GrowthLandingPage } from "../../web/src/growth";
0028: import {
0029:   initializeGrowthRuntime,
0030:   defaultGrowthRuntimeProvider,
0031: } from "../../web/src/growth";
0032: import HubAuth from '@/pages/HubAuth';
0033: import HubAuthCallback from '@/pages/HubAuthCallback';
0034: import MemberDashboard from '@/pages/MemberDashboard';
0035: import InvitationAcceptancePage from '@/pages/dashboard/InvitationAcceptancePage';
0036: import SBUEducation from '@/pages/SBUEducation';
0037: import TropicanaProgram from '@/pages/TropicanaProgram';
0038: 
0039: import AdminRevenueConsole from '@/pages/AdminRevenueConsole';
0040: import EducationFeedback from '@/pages/EducationFeedback';
0041: import HubDashboard from "@/pages/HubDashboard";
0042: 
0043: 
0044: import LambsbookTutoring from '@/pages/LambsbookTutoring';
0045: import FarmstayVision from '@/pages/FarmstayVision';
0046: import AdminGovernance from '@/pages/AdminGovernance';
0047: import ResetPassword from '@/pages/ResetPassword';
0048: import { JourneyContribute, JourneyLearn } from '@/pages/JourneyPages';
0049: 
0050: const Dashboard = lazy(() => import('@/pages/Dashboard'));
0051: const HubAdminDashboard = lazy(() => import('@/pages/HubAdminDashboard'));
0052: const MemberHub = lazy(() => import('@/pages/MemberHub'));
0053: const PartnerOnboarding = lazy(() => import('@/pages/PartnerOnboarding'));
0054: const TranscriptSubmission = lazy(() => import('@/pages/TranscriptSubmission'));
0055: const ProspectRegistration = lazy(() => import('@/pages/ProspectRegistration'));
0056: const ScholarshipsPage = lazy(() => import('@/pages/ScholarshipsPage'));
0057: const ProspectDetailWorkspace = lazy(() => import('@/pages/ProspectDetailWorkspace'));
0058: const ApplicantJourneyStatus = lazy(() => import('@/pages/ApplicantJourneyStatus'));
0059: const ApplicantStatusLookup = lazy(() => import('@/pages/ApplicantStatusLookup'));
0060: const ApplicantDocumentCenter = lazy(() => import('@/pages/ApplicantDocumentCenter'));
0061: const ApplicantAppointmentCenter = lazy(() => import('@/pages/ApplicantAppointmentCenter'));
0062: const ApplicantAdmissionDecisionCenter = lazy(() => import('@/pages/ApplicantAdmissionDecisionCenter'));
0063: const ApplicantLifecycleTimeline = lazy(() => import('@/pages/ApplicantLifecycleTimeline'));
0064: const ApplicantActivityCenter = lazy(() => import('@/pages/ApplicantActivityCenter'));
0065: const ApplicantFollowupTaskCenter = lazy(() => import('@/pages/ApplicantFollowupTaskCenter'));
0066: console.log("[TRACE-P1] App.tsx: module evaluated");
0067: 
0068: function ImmigrationWebsite() {
0069:   const sectionRefs = {
0070:     home: useRef<HTMLDivElement>(null),
0071:     eb3: useRef<HTMLDivElement>(null),
0072:     services: useRef<HTMLDivElement>(null),
0073:     countries: useRef<HTMLDivElement>(null),
0074:     success: useRef<HTMLDivElement>(null),
0075:     faq: useRef<HTMLDivElement>(null),
0076:     contact: useRef<HTMLDivElement>(null),
0077:   };
0078: 
0079:   const handleNavigate = (section: string) => {
0080:     const ref = sectionRefs[section as keyof typeof sectionRefs];
0081:     if (ref?.current) {
0082:       ref.current.scrollIntoView({ behavior: 'smooth' });
0083:     }
0084:   };
0085: 
0086:   const scrollToContact = () => {
0087:     sectionRefs.contact.current?.scrollIntoView({ behavior: 'smooth' });
0088:   };
0089: 
0090:   return (
0091:     <div className="min-h-screen bg-background">
0092:       <Header onNavigate={handleNavigate} />
0093:       
0094:       <main>
0095:         <div ref={sectionRefs.home}>
0096:           <HeroSection onNavigate={handleNavigate} />
0097:         </div>
0098:         
0099:         <div ref={sectionRefs.eb3}>
0100:           <EB3Categories onLearnMore={scrollToContact} />
0101:         </div>
0102:         
0103:         <ProcessSection />
0104:         
0105:         <div ref={sectionRefs.services}>
0106:           <ServicesSection />
0107:         </div>
0108:         
0109:         <JobCategoriesSection />
0110:         
0111:         <StudyAbroadSection onContact={scrollToContact} />
0112:         
0113:         <div ref={sectionRefs.countries}>
0114:           <CountriesSection onContact={scrollToContact} />
0115:         </div>
0116:         
0117:         <AdvantagesSection />
0118:         
0119:         <div ref={sectionRefs.success}>
0120:           <SuccessStories />
0121:         </div>
0122:         
0123:         <div ref={sectionRefs.faq}>
0124:           <FAQSection />
0125:         </div>
0126:         
0127:         <div ref={sectionRefs.contact}>
0128:           <ContactSection />
0129:         </div>
0130:       </main>
0131:       
0132:       <Footer />
0133:       <AIChatWidget />
0134:     </div>
0135:   );
0136: }
0137: 
0138: function Router() {
0139:   return (
0140:     <Switch>
0141:       {/* Main landing - Education Hub (primary) */}
0142:       <Route path="/" component={HubLanding} />
0143:       <Route path="/hub" component={HubLanding} />
0144:       <Route path="/journeys/contribute" component={JourneyContribute} />
0145:       <Route path="/journeys/learn" component={JourneyLearn} />
0146:       
0147:       {/* Admin routes */}
0148:       <Route path="/admin" component={Dashboard} />
0149:       <Route path="/dashboard" component={HubDashboard} />
0150:       <Route path="/login" component={Login} />
0151:       <Route path="/auth/callback" component={AuthCallback} />
0152:       
0153:       {/* Hub authentication */}
0154:       <Route path="/hub/login">{() => <HubAuth mode="login" />}</Route>
0155:       <Route path="/hub/signup">{() => <HubAuth mode="signup" />}</Route>
0156:       <Route path="/hub/auth/callback" component={HubAuthCallback} />
0157:       <Route path="/auth/reset" component={ResetPassword} />
0158:       <Route path="/hub/dashboard" component={MemberHub} />
0159:       <Route
0160:         path="/dashboard/invitations/:invitationId"
0161:         component={InvitationAcceptancePage}
0162:       />
0163:       <Route path="/hub/accept-invitation" component={HubDashboard} />
0164:       <Route path="/hub/member" component={HubDashboard} />
0165:       
0166:       {/* Education programs */}
0167:       <Route path="/hub/sbu/education" component={SBUEducation} />
0168:       <Route path="/hub/sbu/education/lambsbook-tutoring" component={LambsbookTutoring} />
0169:       <Route path="/hub/programs/tropicana" component={TropicanaProgram} />
0170:       <Route path="/hub/vision/farmstay" component={FarmstayVision} />
0171:       <Route path="/hub/partner-onboarding" component={PartnerOnboarding} />
0172:       <Route path="/hub/prospect-registration" component={ProspectRegistration} />
0173:       <Route path="/hub/scholarships" component={ScholarshipsPage} />
0174:       <Route path="/hub/admin/prospects/:id" component={ProspectDetailWorkspace} />
0175:       <Route path="/hub/applicant/status/:id" component={ApplicantJourneyStatus} />
0176:       <Route path="/hub/applicant/status" component={ApplicantStatusLookup} />
0177:       <Route path="/hub/applicant/documents/:id" component={ApplicantDocumentCenter} />
0178:       <Route path="/hub/applicant/appointments/:id" component={ApplicantAppointmentCenter} />
0179:       <Route path="/hub/applicant/decisions/:id" component={ApplicantAdmissionDecisionCenter} />
0180:       <Route path="/hub/applicant/timeline/:id" component={ApplicantLifecycleTimeline} />
0181:       <Route path="/hub/applicant/activity/:id" component={ApplicantActivityCenter} />
0182:       <Route path="/hub/applicant/tasks/:id" component={ApplicantFollowupTaskCenter} />
0183:       <Route path="/hub/admin/revenue" component={AdminRevenueConsole} />
0184:       <Route path="/hub/admin" component={HubAdminDashboard} />
0185:       <Route path="/hub/admin/governance" component={AdminGovernance} />
0186:       <Route path="/hub/education/feedback" component={EducationFeedback} />
0187:       <Route path="/hub/education/submit" component={TranscriptSubmission} />
0188:       
0189:       {/* Legacy immigration page (accessible but not primary) */}
0190:       <Route path="/growth" component={GrowthLandingPage} />
0191:       <Route path="/immigration" component={ImmigrationWebsite} />
0192:     </Switch>
0193:   );
0194: }
0195: 
0196: 
0197: function App() {
0198: console.log("[TRACE-P1] App.tsx: component rendered");
0199:   initializeGrowthRuntime(
0200:     defaultGrowthRuntimeProvider
0201:   );
0202: 
0203:   useRef(null);
0204: 
0205:   //
0206:   // SUPABASE_SESSION_BRIDGE
0207:   //
0208:   try {
0209:     const raw = localStorage.getItem('supabase.auth.token');
0210: 
0211:     if (raw) {
0212:       const parsed = JSON.parse(raw);
0213: 
0214:       if (parsed?.access_token && parsed?.refresh_token) {
0215:         const supabase = createClient();
0216: 
0217:         supabase.auth.setSession({
0218:           access_token: parsed.access_token,
0219:           refresh_token: parsed.refresh_token,
0220:         }).catch(() => {});
0221:       }
0222:     }
0223:   } catch {}
0224: 
0225:   return (
0226:     <QueryClientProvider client={queryClient}>
0227:       <TooltipProvider>
0228:         <LanguageProvider>
0229:           <Toaster />
0230:           <Suspense fallback={<div className="p-6">Loading...</div>}>
0231:           <Router />
0232:         </Suspense>
0233:         </LanguageProvider>
0234:       </TooltipProvider>
0235:     </QueryClientProvider>
0236:   );
0237: }
0238: 
0239: export default App;


================================================================================
client/src/pages/HubAdminDashboard.tsx
================================================================================

0001: import { useState } from "react";
0002: import { useQuery, useMutation } from "@tanstack/react-query";
0003: import { queryClient, apiRequest } from "@/lib/queryClient";
0004: import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
0005: import { Button } from "@/components/ui/button";
0006: import { Badge } from "@/components/ui/badge";
0007: import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
0008: import { Input } from "@/components/ui/input";
0009: import { Label } from "@/components/ui/label";
0010: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
0011: import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
0012: import { useToast } from "@/hooks/use-toast";
0013: import { 
0014:   Users, BookOpen, DollarSign, GraduationCap, 
0015:   Activity, Settings, RefreshCw, Play, Pause,
0016:   UserCheck, UserX, ArrowUpCircle, ArrowDownCircle,
0017:   Plus, CheckCircle, XCircle, Clock
0018: } from "lucide-react";
0019: import { EnrollmentWorkflow } from "@/components/admin/EnrollmentWorkflow";
0020: import { ProgramsManagement } from "@/components/admin/ProgramsManagement";
0021: import { AdmissionsWorkspace } from "@/pages/AdmissionsWorkspace";
0022: 
0023: type MembershipStatus = "free" | "paid";
0024: type ActivityStatus = "active" | "inactive";
0025: type TutorStatus = "unverified" | "verified" | "partner_educator";
0026: type EarningStatus = "pending" | "paid" | "paused";
0027: type RevenueBase = "fee" | "sales" | "gross_margin";
0028: type TriggerCondition = "payment" | "attendance" | "completion" | "conversion";
0029: 
0030: interface Member {
0031:   id: string;
0032:   member_type: string;
0033:   membership_status: MembershipStatus;
0034:   activity_status: ActivityStatus;
0035:   invitor_id: string | null;
0036:   join_date: string;
0037:   last_activity_at: string | null;
0038: }
0039: 
0040: interface Program {
0041:   id: string;
0042:   name: string;
0043:   sbu: string;
0044:   revenue_base: RevenueBase;
0045:   trigger_condition: TriggerCondition;
0046:   is_active: boolean;
0047: }
0048: 
0049: interface Earning {
0050:   id: string;
0051:   member_id: string;
0052:   program_id: string;
0053:   amount: number;
0054:   earning_status: EarningStatus;
0055:   period: string;
0056: }
0057: 
0058: interface Tutor {
0059:   id: string;
0060:   member_id: string;
0061:   tutor_type: string;
0062:   tutor_status: TutorStatus;
0063:   free_class_minutes_last_30_days: number;
0064: }
0065: 
0066: interface Stats {
0067:   members: { total: number; free: number; paid: number; active: number; inactive: number };
0068:   programs: { total: number; active: number };
0069:   earnings: { total: number; pending: number; paid: number; paused: number; totalAmount: number };
0070:   tutors: { total: number; unverified: number; verified: number; partner_educator: number };
0071:   collaborations: { total: number; active: number };
0072: }
0073: 
0074: export default function HubAdminDashboard() {
0075:   const { toast } = useToast();
0076:   const [activeTab, setActiveTab] = useState("overview");
0077:   const [memberFilter, setMemberFilter] = useState<{ membership?: string; activity?: string }>({});
0078:   const [tutorFilter, setTutorFilter] = useState<string>("");
0079:   const [earningFilter, setEarningFilter] = useState<{ status?: string }>({});
0080: 
0081:   const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
0082:     queryKey: ["/api/admin/stats"],
0083:   });
0084: 
0085:   const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
0086:     queryKey: ["/api/admin/members", memberFilter],
0087:   });
0088: 
0089:   const { data: programs = [], isLoading: programsLoading } = useQuery<Program[]>({
0090:     queryKey: ["/api/admin/programs"],
0091:   });
0092: 
0093:   const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earning[]>({
0094:     queryKey: ["/api/admin/earnings", earningFilter],
0095:   });
0096: 
0097:   const { data: tutors = [], isLoading: tutorsLoading } = useQuery<Tutor[]>({
0098:     queryKey: ["/api/admin/tutors", tutorFilter],
0099:   });
0100: 
0101:   const updateMembershipMutation = useMutation({
0102:     mutationFn: async ({ id, status }: { id: string; status: MembershipStatus }) => {
0103:       const res = await apiRequest("PATCH", `/api/admin/members/${id}/membership`, { membership_status: status });
0104:       return res.json();
0105:     },
0106:     onSuccess: () => {
0107:       queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
0108:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0109:       toast({ title: "Membership updated" });
0110:     },
0111:   });
0112: 
0113:   const updateActivityMutation = useMutation({
0114:     mutationFn: async ({ id, status }: { id: string; status: ActivityStatus }) => {
0115:       const res = await apiRequest("PATCH", `/api/admin/members/${id}/activity`, { activity_status: status });
0116:       return res.json();
0117:     },
0118:     onSuccess: () => {
0119:       queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
0120:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0121:       queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
0122:       toast({ title: "Activity status updated" });
0123:     },
0124:   });
0125: 
0126:   const toggleProgramMutation = useMutation({
0127:     mutationFn: async ({ id, activate }: { id: string; activate: boolean }) => {
0128:       const res = await apiRequest("PATCH", `/api/admin/programs/${id}/${activate ? "activate" : "deactivate"}`);
0129:       return res.json();
0130:     },
0131:     onSuccess: () => {
0132:       queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
0133:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0134:       toast({ title: "Program status updated" });
0135:     },
0136:   });
0137: 
0138:   const pauseEarningMutation = useMutation({
0139:     mutationFn: async (id: string) => {
0140:       const res = await apiRequest("PATCH", `/api/admin/earnings/${id}/pause`);
0141:       return res.json();
0142:     },
0143:     onSuccess: () => {
0144:       queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
0145:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0146:       toast({ title: "Earning paused" });
0147:     },
0148:   });
0149: 
0150:   const resumeEarningMutation = useMutation({
0151:     mutationFn: async (id: string) => {
0152:       const res = await apiRequest("PATCH", `/api/admin/earnings/${id}/resume`);
0153:       return res.json();
0154:     },
0155:     onSuccess: () => {
0156:       queryClient.invalidateQueries({ queryKey: ["/api/admin/earnings"] });
0157:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0158:       toast({ title: "Earning resumed" });
0159:     },
0160:   });
0161: 
0162:   const updateTutorStatusMutation = useMutation({
0163:     mutationFn: async ({ id, status }: { id: string; status: TutorStatus }) => {
0164:       const res = await apiRequest("PATCH", `/api/admin/tutors/${id}/status`, { tutor_status: status });
0165:       return res.json();
0166:     },
0167:     onSuccess: () => {
0168:       queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
0169:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0170:       toast({ title: "Tutor status updated" });
0171:     },
0172:   });
0173: 
0174:   const runActivityDecayMutation = useMutation({
0175:     mutationFn: async () => {
0176:       const res = await apiRequest("POST", "/api/admin/activity-decay/check");
0177:       return res.json();
0178:     },
0179:     onSuccess: (data: any) => {
0180:       queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
0181:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0182:       toast({ 
0183:         title: "Activity decay check complete", 
0184:         description: `Checked ${data.checked} members, deactivated ${data.deactivated}` 
0185:       });
0186:     },
0187:   });
0188: 
0189:   const runTutorCheckMutation = useMutation({
0190:     mutationFn: async () => {
0191:       const res = await apiRequest("POST", "/api/admin/tutors/check-free-class-requirement");
0192:       return res.json();
0193:     },
0194:     onSuccess: (data: any) => {
0195:       queryClient.invalidateQueries({ queryKey: ["/api/admin/tutors"] });
0196:       queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
0197:       toast({ 
0198:         title: "Tutor check complete", 
0199:         description: `Checked ${data.checked} tutors, demoted ${data.demoted}` 
0200:       });
0201:     },
0202:   });
0203: 
0204:   const StatCard = ({ title, value, icon: Icon, subtitle }: { title: string; value: number | string; icon: any; subtitle?: string }) => (
0205:     <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
0206:       <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
0207:         <CardTitle className="text-sm font-medium">{title}</CardTitle>
0208:         <Icon className="h-4 w-4 text-muted-foreground" />
0209:       </CardHeader>
0210:       <CardContent>
0211:         <div className="text-2xl font-bold">{value}</div>
0212:         {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
0213:       </CardContent>
0214:     </Card>
0215:   );
0216: 
0217:   return (
0218:     <div className="container mx-auto p-6 max-w-7xl">
0219:       <div className="flex items-center justify-between mb-6">
0220:         <div>
0221:           <h1 className="text-3xl font-bold" data-testid="text-page-title">Hub Admin Dashboard</h1>
0222:           <p className="text-muted-foreground">Manage programs, members, earnings, and tutors</p>
0223:         </div>
0224:         <Badge variant="outline" className="text-sm">Admin Only</Badge>
0225:       </div>
0226: 
0227:       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
0228:         <TabsList className="flex flex-wrap w-full max-w-3xl gap-1" data-testid="tabs-admin">
0229:           <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
0230:           <TabsTrigger value="programs" data-testid="tab-programs">Programs</TabsTrigger>
0231:           <TabsTrigger value="members" data-testid="tab-members">Members</TabsTrigger>
0232:           <TabsTrigger value="collaborations" data-testid="tab-collaborations">Collaborations</TabsTrigger>
0233:           <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
0234:           <TabsTrigger value="tutors" data-testid="tab-tutors">Tutors</TabsTrigger>
0235:           <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
0236:           <TabsTrigger value="enrollment" data-testid="tab-enrollment">Enrollment</TabsTrigger>
0237:           <TabsTrigger value="admissions" data-testid="tab-admissions">Admissions</TabsTrigger>
0238:         </TabsList>
0239: 
0240:         <TabsContent value="overview" className="space-y-6">
0241:           {statsLoading ? (
0242:             <div className="text-center py-8">Loading stats...</div>
0243:           ) : stats ? (
0244:             <>
0245:               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
0246:                 <StatCard title="Total Members" value={stats.members.total} icon={Users} subtitle={`${stats.members.active} active`} />
0247:                 <StatCard title="Active Programs" value={stats.programs.active} icon={BookOpen} subtitle={`of ${stats.programs.total} total`} />
0248:                 <StatCard title="Total Earnings" value={`$${stats.earnings.totalAmount.toFixed(2)}`} icon={DollarSign} subtitle={`${stats.earnings.pending} pending`} />
0249:                 <StatCard title="Verified Tutors" value={stats.tutors.verified + stats.tutors.partner_educator} icon={GraduationCap} subtitle={`${stats.tutors.unverified} unverified`} />
0250:               </div>
0251:               <div className="grid gap-4 md:grid-cols-3">
0252:                 <Card>
0253:                   <CardHeader>
0254:                     <CardTitle className="text-lg">Member Breakdown</CardTitle>
0255:                   </CardHeader>
0256:                   <CardContent className="space-y-2">
0257:                     <div className="flex justify-between"><span>Free Members</span><Badge variant="secondary">{stats.members.free}</Badge></div>
0258:                     <div className="flex justify-between"><span>Paid Members</span><Badge variant="default">{stats.members.paid}</Badge></div>
0259:                     <div className="flex justify-between"><span>Active</span><Badge className="bg-green-500">{stats.members.active}</Badge></div>
0260:                     <div className="flex justify-between"><span>Inactive</span><Badge variant="destructive">{stats.members.inactive}</Badge></div>
0261:                   </CardContent>
0262:                 </Card>
0263:                 <Card>
0264:                   <CardHeader>
0265:                     <CardTitle className="text-lg">Referral Earnings</CardTitle>
0266:                     <CardDescription className="text-xs">Purchase-based earnings attribution</CardDescription>
0267:                   </CardHeader>
0268:                   <CardContent className="space-y-2">
0269:                     <div className="flex justify-between"><span>Pending</span><Badge variant="secondary">{stats.earnings.pending}</Badge></div>
0270:                     <div className="flex justify-between"><span>Paid</span><Badge className="bg-green-500">{stats.earnings.paid}</Badge></div>
0271:                     <div className="flex justify-between"><span>Paused</span><Badge variant="destructive">{stats.earnings.paused}</Badge></div>
0272:                   </CardContent>
0273:                 </Card>
0274:                 <Card>
0275:                   <CardHeader>
0276:                     <CardTitle className="text-lg">Collaboration Graph</CardTitle>
0277:                     <CardDescription className="text-xs">Invitor–Invitee relationships</CardDescription>
0278:                   </CardHeader>
0279:                   <CardContent className="space-y-2">
0280:                     <div className="flex justify-between"><span>Total Collaborations</span><Badge variant="outline">{stats.collaborations.total}</Badge></div>
0281:                     <div className="flex justify-between"><span>Active</span><Badge className="bg-green-500">{stats.collaborations.active}</Badge></div>
0282:                     <p className="text-xs text-muted-foreground mt-2">
0283:                       Collaborations are independent of referral earnings
0284:                     </p>
0285:                   </CardContent>
0286:                 </Card>
0287:               </div>
0288:             </>
0289:           ) : null}
0290:         </TabsContent>
0291: 
0292:         <TabsContent value="programs" className="space-y-4">
0293:           <ProgramsManagement />
0294:         </TabsContent>
0295: 
0296:         <TabsContent value="members" className="space-y-4">
0297:           <Card>
0298:             <CardHeader>
0299:               <CardTitle>Member Management</CardTitle>
0300:               <CardDescription>View and manage member status</CardDescription>
0301:             </CardHeader>
0302:             <CardContent>
0303:               <div className="flex gap-4 mb-4">
0304:                 <Select onValueChange={(v) => setMemberFilter(prev => ({ ...prev, membership: v === "all" ? undefined : v }))}>
0305:                   <SelectTrigger className="w-40" data-testid="select-membership-filter">
0306:                     <SelectValue placeholder="Membership" />
0307:                   </SelectTrigger>
0308:                   <SelectContent>
0309:                     <SelectItem value="all">All</SelectItem>
0310:                     <SelectItem value="free">Free</SelectItem>
0311:                     <SelectItem value="paid">Paid</SelectItem>
0312:                   </SelectContent>
0313:                 </Select>
0314:                 <Select onValueChange={(v) => setMemberFilter(prev => ({ ...prev, activity: v === "all" ? undefined : v }))}>
0315:                   <SelectTrigger className="w-40" data-testid="select-activity-filter">
0316:                     <SelectValue placeholder="Activity" />
0317:                   </SelectTrigger>
0318:                   <SelectContent>
0319:                     <SelectItem value="all">All</SelectItem>
0320:                     <SelectItem value="active">Active</SelectItem>
0321:                     <SelectItem value="inactive">Inactive</SelectItem>
0322:                   </SelectContent>
0323:                 </Select>
0324:               </div>
0325:               {membersLoading ? (
0326:                 <div className="text-center py-4">Loading members...</div>
0327:               ) : (
0328:                 <div className="space-y-3">
0329:                   {members.map((member) => (
0330:                     <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`member-row-${member.id}`}>
0331:                       <div>
0332:                         <div className="font-medium">{member.member_type}</div>
0333:                         <div className="text-sm text-muted-foreground">
0334:                           Joined: {new Date(member.join_date).toLocaleDateString()}
0335:                           {member.invitor_id && ` | Invitor: ${member.invitor_id.slice(0, 8)}...`}
0336:                         </div>
0337:                       </div>
0338:                       <div className="flex items-center gap-2">
0339:                         <Badge variant={member.membership_status === "paid" ? "default" : "secondary"}>
0340:                           {member.membership_status}
0341:                         </Badge>
0342:                         <Badge variant={member.activity_status === "active" ? "default" : "destructive"}>
0343:                           {member.activity_status}
0344:                         </Badge>
0345:                         <Button
0346:                           size="sm"
0347:                           variant="outline"
0348:                           onClick={() => updateMembershipMutation.mutate({ 
0349:                             id: member.id, 
0350:                             status: member.membership_status === "paid" ? "free" : "paid" 
0351:                           })}
0352:                           disabled={updateMembershipMutation.isPending}
0353:                           data-testid={`button-toggle-membership-${member.id}`}
0354:                         >
0355:                           {member.membership_status === "paid" ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
0356:                         </Button>
0357:                         <Button
0358:                           size="sm"
0359:                           variant="outline"
0360:                           onClick={() => updateActivityMutation.mutate({ 
0361:                             id: member.id, 
0362:                             status: member.activity_status === "active" ? "inactive" : "active" 
0363:                           })}
0364:                           disabled={updateActivityMutation.isPending}
0365:                           data-testid={`button-toggle-activity-${member.id}`}
0366:                         >
0367:                           {member.activity_status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
0368:                         </Button>
0369:                       </div>
0370:                     </div>
0371:                   ))}
0372:                   {members.length === 0 && (
0373:                     <div className="text-center py-4 text-muted-foreground">No members found</div>
0374:                   )}
0375:                 </div>
0376:               )}
0377:             </CardContent>
0378:           </Card>
0379:         </TabsContent>
0380: 
0381:         <TabsContent value="collaborations" className="space-y-4">
0382:           <div className="grid gap-4 md:grid-cols-2">
0383:             <Card>
0384:               <CardHeader>
0385:                 <CardTitle>Collaboration Graph (Invitor–Invitee)</CardTitle>
0386:                 <CardDescription>
0387:                   View permanent cooperative relationship lineage. Each member has one originating cooperative relationship, 
0388:                   but can invite multiple members.
0389:                 </CardDescription>
0390:               </CardHeader>
0391:               <CardContent>
0392:                 <div className="space-y-3">
0393:                   {members.filter(m => m.invitor_id).slice(0, 10).map((member) => (
0394:                     <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`collab-row-${member.id}`}>
0395:                       <div>
0396:                         <div className="font-medium text-sm">{member.member_type || 'Member'}</div>
0397:                         <div className="text-xs text-muted-foreground">
0398:                           ID: {member.id.slice(0, 8)}...
0399:                         </div>
0400:                       </div>
0401:                       <div className="text-right">
0402:                         <div className="text-xs text-muted-foreground">Invitor</div>
0403:                         <Badge variant="outline" className="text-xs">
0404:                           {member.invitor_id?.slice(0, 8)}...
0405:                         </Badge>
0406:                       </div>
0407:                     </div>
0408:                   ))}
0409:                   {members.filter(m => m.invitor_id).length === 0 && (
0410:                     <div className="text-center py-4 text-muted-foreground">
0411:                       No collaboration relationships found
0412:                     </div>
0413:                   )}
0414:                 </div>
0415:               </CardContent>
0416:             </Card>
0417: 
0418:             <Card>
0419:               <CardHeader>
0420:                 <CardTitle>About Collaborations</CardTitle>
0421:               </CardHeader>
0422:               <CardContent className="space-y-4">
0423:                 <div className="text-sm text-muted-foreground space-y-2">
0424:                   <p className="font-medium text-foreground">Key Concepts:</p>
0425:                   <ul className="list-disc pl-4 space-y-1">
0426:                     <li><strong>Collaboration</strong> = Invitor–Invitee relationship (permanent)</li>
0427:                     <li>Each member can have only ONE invitor</li>
0428:                     <li>A member can invite multiple invitees</li>
0429:                     <li>Creates long-term passive earning relationships</li>
0430:                   </ul>
0431:                   <p className="font-medium text-foreground mt-4">vs. Referrals:</p>
0432:                   <ul className="list-disc pl-4 space-y-1">
0433:                     <li><strong>Referral</strong> = Purchase attribution (transactional)</li>
0434:                     <li>Any member can share referral links</li>
0435:                     <li>Earnings triggered by purchases only</li>
0436:                     <li>Does NOT change collaboration relationships</li>
0437:                   </ul>
0438:                 </div>
0439:               </CardContent>
0440:             </Card>
0441:           </div>
0442:         </TabsContent>
0443: 
0444:         <TabsContent value="earnings" className="space-y-4">
0445:           <Card>
0446:             <CardHeader>
0447:               <CardTitle>Referral Earnings & Attribution</CardTitle>
0448:               <CardDescription>
0449:                 Earnings triggered by purchases through referral links. 
0450:                 <span className="block text-xs mt-1">Note: Referrals do not create collaboration relationships.</span>
0451:               </CardDescription>
0452:             </CardHeader>
0453:             <CardContent>
0454:               <div className="flex gap-4 mb-4">
0455:                 <Select onValueChange={(v) => setEarningFilter({ status: v === "all" ? undefined : v })}>
0456:                   <SelectTrigger className="w-40" data-testid="select-earning-status-filter">
0457:                     <SelectValue placeholder="Status" />
0458:                   </SelectTrigger>
0459:                   <SelectContent>
0460:                     <SelectItem value="all">All</SelectItem>
0461:                     <SelectItem value="pending">Pending</SelectItem>
0462:                     <SelectItem value="paid">Paid</SelectItem>
0463:                     <SelectItem value="paused">Paused</SelectItem>
0464:                   </SelectContent>
0465:                 </Select>
0466:               </div>
0467:               {earningsLoading ? (
0468:                 <div className="text-center py-4">Loading earnings...</div>
0469:               ) : (
0470:                 <div className="space-y-3">
0471:                   {earnings.map((earning) => (
0472:                     <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`earning-row-${earning.id}`}>
0473:                       <div>
0474:                         <div className="font-medium">${Number(earning.amount).toFixed(2)}</div>
0475:                         <div className="text-sm text-muted-foreground">
0476:                           Period: {earning.period} | Member: {earning.member_id.slice(0, 8)}...
0477:                         </div>
0478:                       </div>
0479:                       <div className="flex items-center gap-2">
0480:                         <Badge 
0481:                           variant={earning.earning_status === "paid" ? "default" : earning.earning_status === "paused" ? "destructive" : "secondary"}
0482:                         >
0483:                           {earning.earning_status}
0484:                         </Badge>
0485:                         {earning.earning_status === "pending" && (
0486:                           <Button
0487:                             size="sm"
0488:                             variant="destructive"
0489:                             onClick={() => pauseEarningMutation.mutate(earning.id)}
0490:                             disabled={pauseEarningMutation.isPending}
0491:                             data-testid={`button-pause-earning-${earning.id}`}
0492:                           >
0493:                             <Pause className="h-4 w-4" />
0494:                           </Button>
0495:                         )}
0496:                         {earning.earning_status === "paused" && (
0497:                           <Button
0498:                             size="sm"
0499:                             variant="default"
0500:                             onClick={() => resumeEarningMutation.mutate(earning.id)}

... OUTPUT TRUNCATED (657 lines total)


================================================================================
client/src/pages/AdmissionsWorkspace.tsx
================================================================================

0001: import { useState } from "react";
0002: import { useQuery, useMutation } from "@tanstack/react-query";
0003: import { queryClient, apiRequest } from "@/lib/queryClient";
0004: import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
0005: import { Button } from "@/components/ui/button";
0006: import { Badge } from "@/components/ui/badge";
0007: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
0008: import { useToast } from "@/hooks/use-toast";
0009: import { Link } from 'wouter';
0010: 
0011: interface Prospect {
0012:   id: string;
0013:   full_name: string;
0014:   email: string;
0015:   country: string;
0016:   program_of_interest: string;
0017:   phone: string | null;
0018:   created_at: string;
0019:   funnel_code: string | null;
0020:   current_stage: string | null;
0021: }
0022: 
0023: const LIFECYCLE_STAGES = [
0024:   "registered",
0025:   "screening",
0026:   "interview_scheduled",
0027:   "interview_completed",
0028:   "offer_pending",
0029:   "offer_accepted",
0030:   "enrolled",
0031:   "withdrawn",
0032: ] as const;
0033: 
0034: function stageBadgeVariant(stage: string | null): "default" | "secondary" | "destructive" | "outline" {
0035:   switch (stage) {
0036:     case "enrolled":      return "default";
0037:     case "offer_accepted":return "default";
0038:     case "withdrawn":     return "destructive";
0039:     case "registered":    return "secondary";
0040:     default:              return "outline";
0041:   }
0042: }
0043: 
0044: function formatDate(iso: string): string {
0045:   try {
0046:     return new Date(iso).toLocaleDateString("en-GB", {
0047:       day: "2-digit", month: "short", year: "numeric",
0048:     });
0049:   } catch {
0050:     return iso;
0051:   }
0052: }
0053: 
0054: export function AdmissionsWorkspace() {
0055:   const { toast } = useToast();
0056:   const [selectedId, setSelectedId] = useState<string | null>(null);
0057:   const [stageInput, setStageInput] = useState<string>("");
0058: 
0059:   const { data: prospects = [], isLoading, isError } = useQuery<Prospect[]>({
0060:     queryKey: ["/api/admissions/prospects"],
0061:     queryFn: async () => {
0062:       const res = await apiRequest("GET", "/api/admissions/prospects");
0063:       return res.json();
0064:     },
0065:   });
0066: 
0067:   const selectedProspect = prospects.find((p) => p.id === selectedId) ?? null;
0068: 
0069:   const stageMutation = useMutation({
0070:     mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
0071:       const res = await apiRequest("PATCH", `/api/admissions/prospects/${id}/stage`, {
0072:         current_stage: stage,
0073:       });
0074:       if (!res.ok) {
0075:         const body = await res.json().catch(() => ({}));
0076:         throw new Error((body as { error?: string }).error ?? "Stage update failed");
0077:       }
0078:       return res.json();
0079:     },
0080:     onSuccess: () => {
0081:       queryClient.invalidateQueries({ queryKey: ["/api/admissions/prospects"] });
0082:       toast({ title: "Stage updated", description: "Prospect lifecycle stage saved." });
0083:       setStageInput("");
0084:       setSelectedId(null);
0085:     },
0086:     onError: (err: Error) => {
0087:       toast({ title: "Update failed", description: err.message, variant: "destructive" });
0088:     },
0089:   });
0090: 
0091:   function handleStageUpdate() {
0092:     if (!selectedId || !stageInput) return;
0093:     stageMutation.mutate({ id: selectedId, stage: stageInput });
0094:   }
0095: 
0096:   return (
0097:     <div className="space-y-6">
0098:       <div className="flex items-center justify-between">
0099:         <div>
0100:           <h2 className="text-xl font-semibold">Admissions Workspace</h2>
0101:           <p className="text-sm text-muted-foreground mt-0.5">
0102:             View and manage prospect lifecycle progression.
0103:           </p>
0104:         </div>
0105:         <Badge variant="outline" className="text-xs">
0106:           {prospects.length} prospect{prospects.length !== 1 ? "s" : ""}
0107:         </Badge>
0108:       </div>
0109: 
0110:       {isLoading && (
0111:         <p className="text-sm text-muted-foreground">Loading prospects…</p>
0112:       )}
0113: 
0114:       {isError && (
0115:         <Card className="border-destructive">
0116:           <CardContent className="pt-4">
0117:             <p className="text-sm text-destructive">
0118:               Failed to load prospects. Please try again.
0119:             </p>
0120:           </CardContent>
0121:         </Card>
0122:       )}
0123: 
0124:       {!isLoading && !isError && prospects.length === 0 && (
0125:         <Card>
0126:           <CardContent className="pt-6 text-center text-sm text-muted-foreground">
0127:             No prospects registered yet.
0128:           </CardContent>
0129:         </Card>
0130:       )}
0131: 
0132:       {!isLoading && !isError && prospects.length > 0 && (
0133:         <div className="grid gap-3">
0134:           {prospects.map((p) => (
0135:             <Card
0136:               key={p.id}
0137:               className={`cursor-pointer transition-colors ${
0138:                 selectedId === p.id ? "ring-2 ring-primary" : "hover:bg-accent/30"
0139:               }`}
0140:               onClick={() => {
0141:                 setSelectedId(selectedId === p.id ? null : p.id);
0142:                 setStageInput("");
0143:               }}
0144:             >
0145:               <CardHeader className="pb-2 pt-4 px-4">
0146:                 <div className="flex items-start justify-between gap-2">
0147:                   <div className="min-w-0">
0148:                     <CardTitle className="text-sm font-semibold leading-tight truncate">
0149:                       {p.full_name}
0150:                     </CardTitle>
0151:                     <p className="text-xs text-muted-foreground truncate mt-0.5">
0152:                       {p.email}
0153:                     </p>
0154:                   </div>
0155:                   <div className="flex items-center gap-2 shrink-0">
0156:                     <Badge variant={stageBadgeVariant(p.current_stage)} className="text-xs">
0157:                       {p.current_stage ?? "untracked"}
0158:                     </Badge>
0159:                     <Link href={`/hub/admin/prospects/${p.id}`}>
0160:                       <Button
0161:                         size="sm"
0162:                         variant="outline"
0163:                         className="h-6 text-xs px-2"
0164:                         onClick={(e) => e.stopPropagation()}
0165:                       >
0166:                         View
0167:                       </Button>
0168:                     </Link>
0169:                   </div>
0170:                 </div>
0171:               </CardHeader>
0172:               <CardContent className="pb-4 px-4">
0173:                 <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
0174:                   <div>
0175:                     <dt className="text-muted-foreground">Country</dt>
0176:                     <dd className="font-medium">{p.country}</dd>
0177:                   </div>
0178:                   <div>
0179:                     <dt className="text-muted-foreground">Program</dt>
0180:                     <dd className="font-medium truncate">{p.program_of_interest}</dd>
0181:                   </div>
0182:                   <div>
0183:                     <dt className="text-muted-foreground">Funnel</dt>
0184:                     <dd className="font-medium">{p.funnel_code ?? "—"}</dd>
0185:                   </div>
0186:                   <div>
0187:                     <dt className="text-muted-foreground">Registered</dt>
0188:                     <dd className="font-medium">{formatDate(p.created_at)}</dd>
0189:                   </div>
0190:                 </dl>
0191: 
0192:                 {selectedId === p.id && (
0193:                   <div className="mt-4 pt-3 border-t space-y-2">
0194:                     <p className="text-xs font-medium text-foreground">Update lifecycle stage</p>
0195:                     <div className="flex gap-2 items-center">
0196:                       <Select
0197:                         value={stageInput}
0198:                         onValueChange={setStageInput}
0199:                       >
0200:                         <SelectTrigger className="h-8 text-xs flex-1">
0201:                           <SelectValue placeholder="Select stage…" />
0202:                         </SelectTrigger>
0203:                         <SelectContent>
0204:                           {LIFECYCLE_STAGES.map((s) => (
0205:                             <SelectItem key={s} value={s} className="text-xs">
0206:                               {s.replace(/_/g, " ")}
0207:                             </SelectItem>
0208:                           ))}
0209:                         </SelectContent>
0210:                       </Select>
0211:                       <Button
0212:                         size="sm"
0213:                         className="h-8 text-xs"
0214:                         disabled={!stageInput || stageMutation.isPending}
0215:                         onClick={(e) => {
0216:                           e.stopPropagation();
0217:                           handleStageUpdate();
0218:                         }}
0219:                       >
0220:                         {stageMutation.isPending ? "Saving…" : "Save"}
0221:                       </Button>
0222:                     </div>
0223:                   </div>
0224:                 )}
0225:               </CardContent>
0226:             </Card>
0227:           ))}
0228:         </div>
0229:       )}
0230:     </div>
0231:   );
0232: }


================================================================================
client/src/pages/ProspectDetailWorkspace.tsx
================================================================================

0001: import { useState } from "react";
0002: import { Link, useRoute } from "wouter";
0003: import { useQuery, useMutation } from "@tanstack/react-query";
0004: import { queryClient, apiRequest } from "@/lib/queryClient";
0005: import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
0006: import { Button } from "@/components/ui/button";
0007: import { Badge } from "@/components/ui/badge";
0008: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
0009: import { Separator } from "@/components/ui/separator";
0010: import { ArrowLeft } from "lucide-react";
0011: import { ProspectTimeline } from "@/components/admissions/ProspectTimeline";
0012: import { ProspectActivityWorkspace } from "@/components/admissions/ProspectActivityWorkspace";
0013: import { ProspectFollowupTaskWorkspace } from "@/components/admissions/ProspectFollowupTaskWorkspace";
0014: import { ProspectAppointmentWorkspace } from "@/components/admissions/ProspectAppointmentWorkspace";
0015: import { ProspectDocumentWorkspace } from "@/components/admissions/ProspectDocumentWorkspace";
0016: import { ProspectAdmissionDecisionWorkspace } from "@/components/admissions/ProspectAdmissionDecisionWorkspace";
0017: import { useToast } from "@/hooks/use-toast";
0018: 
0019: interface ProspectDetail {
0020:   id: string;
0021:   full_name: string;
0022:   email: string;
0023:   country: string;
0024:   program_of_interest: string;
0025:   phone: string | null;
0026:   created_at: string;
0027:   funnel_code: string | null;
0028:   current_stage: string | null;
0029: }
0030: 
0031: const LIFECYCLE_STAGES = [
0032:   "registered",
0033:   "screening",
0034:   "interview_scheduled",
0035:   "interview_completed",
0036:   "offer_pending",
0037:   "offer_accepted",
0038:   "enrolled",
0039:   "withdrawn",
0040: ] as const;
0041: 
0042: function stageBadgeVariant(stage: string | null): "default" | "secondary" | "destructive" | "outline" {
0043:   switch (stage) {
0044:     case "enrolled":       return "default";
0045:     case "offer_accepted": return "default";
0046:     case "withdrawn":      return "destructive";
0047:     case "registered":     return "secondary";
0048:     default:               return "outline";
0049:   }
0050: }
0051: 
0052: function formatDate(iso: string): string {
0053:   try {
0054:     return new Date(iso).toLocaleDateString("en-GB", {
0055:       day: "2-digit", month: "short", year: "numeric",
0056:       hour: "2-digit", minute: "2-digit",
0057:     });
0058:   } catch {
0059:     return iso;
0060:   }
0061: }
0062: 
0063: function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
0064:   return (
0065:     <div className="flex flex-col gap-0.5">
0066:       <dt className="text-xs text-muted-foreground">{label}</dt>
0067:       <dd className="text-sm font-medium">{value ?? "—"}</dd>
0068:     </div>
0069:   );
0070: }
0071: 
0072: export default function ProspectDetailWorkspace() {
0073:   const [, params] = useRoute("/hub/admin/prospects/:id");
0074:   const id = params?.id ?? "";
0075:   const { toast } = useToast();
0076:   const [stageInput, setStageInput] = useState<string>("");
0077: 
0078:   const { data: prospect, isLoading, isError } = useQuery<ProspectDetail>({
0079:     queryKey: [`/api/admissions/prospects/${id}`],
0080:     queryFn: async () => {
0081:       const res = await apiRequest("GET", `/api/admissions/prospects/${id}`);
0082:       if (!res.ok) {
0083:         throw new Error("Prospect not found");
0084:       }
0085:       return res.json();
0086:     },
0087:     enabled: !!id,
0088:   });
0089: 
0090:   const stageMutation = useMutation({
0091:     mutationFn: async (stage: string) => {
0092:       const res = await apiRequest("PATCH", `/api/admissions/prospects/${id}/stage`, {
0093:         current_stage: stage,
0094:       });
0095:       if (!res.ok) {
0096:         const body = await res.json().catch(() => ({}));
0097:         throw new Error((body as { error?: string }).error ?? "Stage update failed");
0098:       }
0099:       return res.json();
0100:     },
0101:     onSuccess: () => {
0102:       queryClient.invalidateQueries({ queryKey: [`/api/admissions/prospects/${id}`] });
0103:       queryClient.invalidateQueries({ queryKey: ["/api/admissions/prospects"] });
0104:       toast({ title: "Stage updated", description: "Prospect lifecycle stage saved." });
0105:       setStageInput("");
0106:     },
0107:     onError: (err: Error) => {
0108:       toast({ title: "Update failed", description: err.message, variant: "destructive" });
0109:     },
0110:   });
0111: 
0112:   return (
0113:     <div className="min-h-screen bg-background">
0114:       <div className="border-b bg-card">
0115:         <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center gap-3">
0116:           <Link href="/hub/admin">
0117:             <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
0118:               <ArrowLeft className="h-4 w-4" />
0119:               Admissions Workspace
0120:             </Button>
0121:           </Link>
0122:         </div>
0123:       </div>
0124: 
0125:       <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
0126:         {isLoading && (
0127:           <p className="text-sm text-muted-foreground">Loading prospect…</p>
0128:         )}
0129: 
0130:         {isError && (
0131:           <Card className="border-destructive">
0132:             <CardContent className="pt-6">
0133:               <p className="text-sm text-destructive">
0134:                 Prospect not found or failed to load.
0135:               </p>
0136:               <Link href="/hub/admin">
0137:                 <Button variant="outline" size="sm" className="mt-3">
0138:                   Return to Admissions Workspace
0139:                 </Button>
0140:               </Link>
0141:             </CardContent>
0142:           </Card>
0143:         )}
0144: 
0145:         {prospect && (
0146:           <>
0147:             {/* Header */}
0148:             <div className="flex items-start justify-between gap-4">
0149:               <div>
0150:                 <h1 className="text-2xl font-bold">{prospect.full_name}</h1>
0151:                 <p className="text-sm text-muted-foreground mt-1">{prospect.email}</p>
0152:               </div>
0153:               <Badge
0154:                 variant={stageBadgeVariant(prospect.current_stage)}
0155:                 className="text-sm px-3 py-1 shrink-0"
0156:               >
0157:                 {prospect.current_stage ?? "untracked"}
0158:               </Badge>
0159:             </div>
0160: 
0161:             {/* Prospect Details */}
0162:             <Card>
0163:               <CardHeader className="pb-3">
0164:                 <CardTitle className="text-base">Prospect Information</CardTitle>
0165:                 <CardDescription className="text-xs">
0166:                   Read-only admissions record.
0167:                 </CardDescription>
0168:               </CardHeader>
0169:               <CardContent>
0170:                 <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
0171:                   <FieldRow label="Full Name"          value={prospect.full_name} />
0172:                   <FieldRow label="Email"              value={prospect.email} />
0173:                   <FieldRow label="Country"            value={prospect.country} />
0174:                   <FieldRow label="Program of Interest" value={prospect.program_of_interest} />
0175:                   <FieldRow label="Phone"              value={prospect.phone} />
0176:                   <FieldRow label="Funnel Code"        value={prospect.funnel_code} />
0177:                   <FieldRow label="Current Stage"      value={prospect.current_stage} />
0178:                   <FieldRow label="Registered"         value={formatDate(prospect.created_at)} />
0179:                 </dl>
0180:               </CardContent>
0181:             </Card>
0182: 
0183:             {/* Stage Update */}
0184:             <Card>
0185:               <CardHeader className="pb-3">
0186:                 <CardTitle className="text-base">Lifecycle Progression</CardTitle>
0187:                 <CardDescription className="text-xs">
0188:                   Update the prospect's admissions stage.
0189:                 </CardDescription>
0190:               </CardHeader>
0191:               <CardContent className="space-y-4">
0192:                 <Separator />
0193:                 <div className="flex gap-3 items-center">
0194:                   <Select value={stageInput} onValueChange={setStageInput}>
0195:                     <SelectTrigger className="flex-1">
0196:                       <SelectValue placeholder="Select new stage…" />
0197:                     </SelectTrigger>
0198:                     <SelectContent>
0199:                       {LIFECYCLE_STAGES.map((s) => (
0200:                         <SelectItem key={s} value={s}>
0201:                           {s.replace(/_/g, " ")}
0202:                         </SelectItem>
0203:                       ))}
0204:                     </SelectContent>
0205:                   </Select>
0206:                   <Button
0207:                     disabled={!stageInput || stageMutation.isPending}
0208:                     onClick={() => stageMutation.mutate(stageInput)}
0209:                   >
0210:                     {stageMutation.isPending ? "Saving…" : "Update Stage"}
0211:                   </Button>
0212:                 </div>
0213:                 <p className="text-xs text-muted-foreground">
0214:                   Current stage: <span className="font-medium">{prospect.current_stage ?? "untracked"}</span>
0215:                 </p>
0216:               </CardContent>
0217:             </Card>
0218: 
0219:             {/* Lifecycle Timeline */}
0220:             <ProspectTimeline prospectId={id} />
0221: 
0222:             {/* Activity Log */}
0223:             <ProspectActivityWorkspace prospectId={id} />
0224: 
0225:             {/* Follow-up Tasks */}
0226:             <ProspectFollowupTaskWorkspace prospectId={id} />
0227: 
0228:             {/* Appointments & Interviews */}
0229:             <ProspectAppointmentWorkspace prospectId={id} />
0230: 
0231:             {/* Documents */}
0232:             <ProspectDocumentWorkspace prospectId={id} />
0233: 
0234:             {/* Admission Decisions */}
0235:             <ProspectAdmissionDecisionWorkspace prospectId={id} />
0236:           </>
0237:         )}
0238:       </div>
0239:     </div>
0240:   );
0241: }


