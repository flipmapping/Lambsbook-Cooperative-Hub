import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Handshake, 
  Heart, 
  GraduationCap, 
  Sprout, 
  Home, 
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Globe,
  Shield,
  Clock
} from "lucide-react";
import { HubHeader } from "@/components/HubHeader";
import { HubConsultationForm } from "@/components/HubConsultationForm";
import { useLanguage } from "@/lib/LanguageContext";
import { useHubTranslation } from "@/lib/hubTranslations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const getSbus = (t: (key: string) => string) => [
  {
    id: 2,
    name: t('hub_sbu_education'),
    icon: GraduationCap,
    description: t('hub_sbu_education_desc'),
    color: "bg-blue-500/10 text-blue-600",
    href: "/hub/sbu/education",
    active: true,
  },
  {
    id: 4,
    name: t('hub_sbu_food'),
    icon: Sprout,
    description: t('hub_sbu_food_desc'),
    color: "bg-green-500/10 text-green-600",
    href: "/hub/partner-onboarding",
    active: true,
  },
  {
    id: 5,
    name: t('hub_sbu_farmstay'),
    icon: Home,
    description: t('hub_sbu_farmstay_desc'),
    color: "bg-teal-500/10 text-teal-600",
    href: "/hub/vision/farmstay",
    active: true,
    hasVisionLink: true,
  },
];

const getCollaborationPrinciples = (t: (key: string) => string) => [
  {
    icon: Handshake,
    title: t('hub_collab_principle1_title'),
    description: t('hub_collab_principle1_desc'),
  },
  {
    icon: Shield,
    title: t('hub_collab_principle2_title'),
    description: t('hub_collab_principle2_desc'),
  },
  {
    icon: Heart,
    title: t('hub_collab_principle3_title'),
    description: t('hub_collab_principle3_desc'),
  },
  {
    icon: Clock,
    title: t('hub_collab_principle4_title'),
    description: t('hub_collab_principle4_desc'),
  },
];

const getFaqItems = (t: (key: string) => string) => [
  {
    question: t('hub_faq1_q'),
    answer: t('hub_faq1_a'),
  },
  {
    question: t('hub_faq2_q'),
    answer: t('hub_faq2_a'),
  },
  {
    question: t('hub_faq3_q'),
    answer: t('hub_faq3_a'),
  },
  {
    question: t('hub_faq4_q'),
    answer: t('hub_faq4_a'),
  },
  {
    question: t('hub_faq5_q'),
    answer: t('hub_faq5_a'),
  },
];

const getCommitments = (t: (key: string) => string) => [
  t('hub_commitment1'),
  t('hub_commitment2'),
  t('hub_commitment3'),
  t('hub_commitment4'),
];

const inquiryOptions = [
  { value: "general", labelKey: "hub_inquiry_general" },
  { value: "partnership", labelKey: "hub_inquiry_partnership" },
  { value: "collaboration", labelKey: "hub_inquiry_collaboration" },
  { value: "support", labelKey: "hub_inquiry_support" },
];

export default function HubLanding() {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);
  
  const sbus = getSbus(t);
  const collaborationPrinciples = getCollaborationPrinciples(t);
  const faqItems = getFaqItems(t);
  const commitments = getCommitments(t);

  const [debugUser, setDebugUser] = useState<{ id: string; email: string } | null>(null);
  const [debugLoading, setDebugLoading] = useState(true);
  const [debugMessage, setDebugMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const keys = ['supabase.auth.token', 'hub_access_token', 'supabase_access_token'];
      let token: string | null = null;
      for (const k of keys) {
        const v = localStorage.getItem(k);
        if (!v) continue;
        try {
          const p = JSON.parse(v);
          const t = p?.currentSession?.access_token || p?.access_token || p;
          if (typeof t === 'string' && t.length > 20) { token = t; break; }
        } catch {
          if (typeof v === 'string' && v.length > 20) { token = v; break; }
        }
      }
      if (!token) {
        setDebugMessage('No user logged in');
        setDebugLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/debug-auth-user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.user) {
          setDebugUser(data.user);
        } else {
          setDebugMessage(data.message || 'No user logged in');
        }
      } catch {
        setDebugMessage('Error checking auth');
      }
      setDebugLoading(false);
    };
    checkUser();
  }, []);

  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
    collaboration: useRef<HTMLDivElement>(null),
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

  const scrollToCollaboration = () => {
    sectionRefs.collaboration.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
        brandName="Lambsbook Collaborative Hub"
        brandSubtitle="Open Collaboration Economy"
        homeLink="/hub"
      />

      {/* DEBUG BANNER - TEMPORARY */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-700 px-4 py-2 text-center text-sm font-mono" data-testid="debug-auth-banner">
        {debugLoading ? (
          <span className="text-yellow-700 dark:text-yellow-300">Checking auth...</span>
        ) : debugUser ? (
          <span className="text-green-700 dark:text-green-300">
            Logged in — user.id: <strong>{debugUser.id}</strong> | email: <strong>{debugUser.email}</strong>
          </span>
        ) : (
          <span className="text-red-700 dark:text-red-300">{debugMessage}</span>
        )}
      </div>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
            {t('hub_hero_main_title')}
            <span className="block text-primary mt-2">{t('hub_hero_main_subtitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
            {t('hub_hero_description')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" data-testid="button-hero-signup">
                {t('hub_join_free')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToCollaboration}
              data-testid="button-learn-collaboration"
            >
              {t('hub_learn_collaboration')}
            </Button>
          </div>
        </div>
      </section>

      {/* How Collaboration Works Section */}
      <section ref={sectionRefs.collaboration} className="py-20 px-4 bg-muted/30" id="collaboration">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4" data-testid="text-collaboration-title">
              {t('hub_collab_title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('hub_collab_subtitle')}
            </p>
          </div>

          {/* Collaboration Principles */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {collaborationPrinciples.map((principle, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-principle-${index}`}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <principle.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{principle.title}</CardTitle>
                    <CardDescription className="mt-2">{principle.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Collaboration Explanation */}
          <Card className="mb-12" data-testid="card-collaboration-explanation">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Users className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">{t('hub_trust_title')}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t('hub_trust_desc1')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('hub_trust_desc2')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">{t('hub_faq_title')}</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`accordion-faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* SBUs Section */}
      <section ref={sectionRefs.programs} id="programs" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-sbu-title">
            {t('hub_sbu_title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
            {t('hub_sbu_desc')}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {sbus.map((sbu) => {
              const cardContent = (
                <Card 
                  className={`h-full ${sbu.active ? 'hover-elevate cursor-pointer' : 'opacity-70'}`} 
                  data-testid={`card-sbu-${sbu.id}`}
                >
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-md ${sbu.color} flex items-center justify-center mb-3`}>
                      <sbu.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{sbu.name}</CardTitle>
                    <CardDescription className="min-h-[60px]">{sbu.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sbu.hasVisionLink && (
                      <div className="flex items-center gap-1 text-sm text-primary">
                        {t('hub_sbu_learn_more')}
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
              
              if (sbu.href) {
                return (
                  <Link key={sbu.id} href={sbu.href}>
                    {cardContent}
                  </Link>
                );
              }
              return <div key={sbu.id}>{cardContent}</div>;
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-8">{t('hub_commitment_title')}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {commitments.map((value, index) => (
              <div key={index} className="flex items-center gap-2 justify-center" data-testid={`text-value-${index}`}>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
            {t('hub_cta_join_title')}
          </h2>
          <p className="mb-8 opacity-90 text-lg" data-testid="text-cta-desc">
            {t('hub_cta_join_desc')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" variant="secondary" data-testid="button-cta-signup">
                {t('hub_cta_join_button')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-sm bg-primary-foreground/10"
              onClick={scrollToContact}
              data-testid="button-cta-contact"
            >
              {t('hub_cta_contact_button')}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={sectionRefs.contact} className="py-16 px-4 bg-muted/30" id="contact">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_contact_title')}</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('hub_contact_desc')}
          </p>
          <HubConsultationForm 
            inquiryOptions={inquiryOptions}
            source="hub-landing"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
              © 2025 Lambsbook Collaborative Hub. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub/sbu/education" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-education">
                {t('hub_footer_education')}
              </Link>
              <Link href="/hub/vision/farmstay" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-farmstay">
                {t('hub_footer_farmstay')}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('hub_footer_contact')}: support@lambsbook.net
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
