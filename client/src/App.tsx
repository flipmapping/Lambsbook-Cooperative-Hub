import { useRef, lazy, Suspense } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/lib/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { EB3Categories } from '@/components/EB3Categories';
import { ServicesSection } from '@/components/ServicesSection';
import { ProcessSection } from '@/components/ProcessSection';
import { JobCategoriesSection } from '@/components/JobCategoriesSection';
import { CountriesSection } from '@/components/CountriesSection';
import { StudyAbroadSection } from '@/components/StudyAbroadSection';
import { AdvantagesSection } from '@/components/AdvantagesSection';
import { SuccessStories } from '@/components/SuccessStories';
import { FAQSection } from '@/components/FAQSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { AIChatWidget } from '@/components/AIChatWidget';

import AuthCallback from '@/pages/AuthCallback';
import Login from '@/pages/Login';
import HubLanding from '@/pages/HubLanding';
import { LandingPage as GrowthLandingPage } from "../../web/src/growth";
import {
  initializeGrowthRuntime,
  defaultGrowthRuntimeProvider,
} from "../../web/src/growth";
import HubAuth from '@/pages/HubAuth';
import HubAuthCallback from '@/pages/HubAuthCallback';
import MemberDashboard from '@/pages/MemberDashboard';
import InvitationAcceptancePage from '@/pages/dashboard/InvitationAcceptancePage';
import SBUEducation from '@/pages/SBUEducation';
import TropicanaProgram from '@/pages/TropicanaProgram';

import AdminRevenueConsole from '@/pages/AdminRevenueConsole';
import EducationFeedback from '@/pages/EducationFeedback';
import HubDashboard from "@/pages/HubDashboard";


import LambsbookTutoring from '@/pages/LambsbookTutoring';
import FarmstayVision from '@/pages/FarmstayVision';
import AdminGovernance from '@/pages/AdminGovernance';
import ResetPassword from '@/pages/ResetPassword';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const HubAdminDashboard = lazy(() => import('@/pages/HubAdminDashboard'));
const MemberHub = lazy(() => import('@/pages/MemberHub'));
const PartnerOnboarding = lazy(() => import('@/pages/PartnerOnboarding'));
const TranscriptSubmission = lazy(() => import('@/pages/TranscriptSubmission'));
const ProspectRegistration = lazy(() => import('@/pages/ProspectRegistration'));
console.log("[TRACE-P1] App.tsx: module evaluated");

function ImmigrationWebsite() {
  const sectionRefs = {
    home: useRef<HTMLDivElement>(null),
    eb3: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    countries: useRef<HTMLDivElement>(null),
    success: useRef<HTMLDivElement>(null),
    faq: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    sectionRefs.contact.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} />
      
      <main>
        <div ref={sectionRefs.home}>
          <HeroSection onNavigate={handleNavigate} />
        </div>
        
        <div ref={sectionRefs.eb3}>
          <EB3Categories onLearnMore={scrollToContact} />
        </div>
        
        <ProcessSection />
        
        <div ref={sectionRefs.services}>
          <ServicesSection />
        </div>
        
        <JobCategoriesSection />
        
        <StudyAbroadSection onContact={scrollToContact} />
        
        <div ref={sectionRefs.countries}>
          <CountriesSection onContact={scrollToContact} />
        </div>
        
        <AdvantagesSection />
        
        <div ref={sectionRefs.success}>
          <SuccessStories />
        </div>
        
        <div ref={sectionRefs.faq}>
          <FAQSection />
        </div>
        
        <div ref={sectionRefs.contact}>
          <ContactSection />
        </div>
      </main>
      
      <Footer />
      <AIChatWidget />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Main landing - Education Hub (primary) */}
      <Route path="/" component={HubLanding} />
      <Route path="/hub" component={HubLanding} />
      
      {/* Admin routes */}
      <Route path="/admin" component={Dashboard} />
      <Route path="/dashboard" component={HubDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Hub authentication */}
      <Route path="/hub/login">{() => <HubAuth mode="login" />}</Route>
      <Route path="/hub/signup">{() => <HubAuth mode="signup" />}</Route>
      <Route path="/hub/auth/callback" component={HubAuthCallback} />
      <Route path="/auth/reset" component={ResetPassword} />
      <Route path="/hub/dashboard" component={MemberHub} />
      <Route
        path="/dashboard/invitations/:invitationId"
        component={InvitationAcceptancePage}
      />
      <Route path="/hub/accept-invitation" component={HubDashboard} />
      <Route path="/hub/member" component={HubDashboard} />
      
      {/* Education programs */}
      <Route path="/hub/sbu/education" component={SBUEducation} />
      <Route path="/hub/sbu/education/lambsbook-tutoring" component={LambsbookTutoring} />
      <Route path="/hub/programs/tropicana" component={TropicanaProgram} />
      <Route path="/hub/vision/farmstay" component={FarmstayVision} />
      <Route path="/hub/partner-onboarding" component={PartnerOnboarding} />
      <Route path="/hub/prospect-registration" component={ProspectRegistration} />
      <Route path="/hub/admin/revenue" component={AdminRevenueConsole} />
      <Route path="/hub/admin" component={HubAdminDashboard} />
      <Route path="/hub/admin/governance" component={AdminGovernance} />
      <Route path="/hub/education/feedback" component={EducationFeedback} />
      <Route path="/hub/education/submit" component={TranscriptSubmission} />
      
      {/* Legacy immigration page (accessible but not primary) */}
      <Route path="/growth" component={GrowthLandingPage} />
      <Route path="/immigration" component={ImmigrationWebsite} />
    </Switch>
  );
}


function App() {
console.log("[TRACE-P1] App.tsx: component rendered");
  initializeGrowthRuntime(
    defaultGrowthRuntimeProvider
  );

  useRef(null);

  //
  // SUPABASE_SESSION_BRIDGE
  //
  try {
    const raw = localStorage.getItem('supabase.auth.token');

    if (raw) {
      const parsed = JSON.parse(raw);

      if (parsed?.access_token && parsed?.refresh_token) {
        const supabase = createClient();

        supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        }).catch(() => {});
      }
    }
  } catch {}

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Router />
        </Suspense>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
