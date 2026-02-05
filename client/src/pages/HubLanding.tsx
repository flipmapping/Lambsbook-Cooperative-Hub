import { useRef } from "react";
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

const sbus = [
  {
    id: 2,
    name: "Education Programs",
    icon: GraduationCap,
    description: "Online tutoring, vocational training, and overseas study pathways",
    color: "bg-blue-500/10 text-blue-600",
    href: "/hub/sbu/education",
    active: true,
  },
  {
    id: 4,
    name: "Healthy Food from Nature",
    icon: Sprout,
    description: "Organic fruits, vegetables and noodles",
    color: "bg-green-500/10 text-green-600",
    href: "/hub/partner-onboarding",
    active: true,
  },
  {
    id: 5,
    name: "Farmstay Communities",
    icon: Home,
    description: "Partner with us to build farmstay communities for ecotourism, elderly care centers, and co-create education and farming cooperatives.",
    color: "bg-teal-500/10 text-teal-600",
    href: "/hub/vision/farmstay",
    active: true,
    hasVisionLink: true,
  },
];

const collaborationPrinciples = [
  {
    icon: Handshake,
    title: "Long-term Relationships",
    description: "Collaboration relationships are established once and cannot be bypassed or replaced. This creates lasting bonds of trust and mutual support.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "Every relationship and contribution is recorded and respected. There are no hidden structures or unexpected changes.",
  },
  {
    icon: Heart,
    title: "Shared Value Creation",
    description: "When value is created through education, commerce, or community programs, it flows naturally to those who contributed — fairly and consistently.",
  },
  {
    icon: Clock,
    title: "Grow Together Over Time",
    description: "Unlike one-time transactions, collaboration compounds over time as your network and contributions grow alongside the platform.",
  },
];

const faqItems = [
  {
    question: "What is a collaboration relationship?",
    answer: "A collaboration relationship is a permanent connection between two members. When you invite someone to join Lambsbook, that relationship is established for life. Both parties benefit when either contributes to or participates in platform activities.",
  },
  {
    question: "How is this different from affiliate or referral marketing?",
    answer: "Traditional referral programs focus on one-time rewards for bringing customers. Lambsbook's collaboration model creates lasting partnerships where members work together, share knowledge, and benefit from each other's growth over time — not just from a single transaction.",
  },
  {
    question: "Can collaboration relationships be changed or bypassed?",
    answer: "No. Once established, collaboration relationships are permanent and cannot be altered. This ensures trust and fairness — your collaborators will always remain connected to you.",
  },
  {
    question: "How do I participate and create value?",
    answer: "You can participate by joining education programs, connecting others to valuable opportunities, partnering in business units, or contributing your skills and knowledge. Every genuine contribution creates shared value.",
  },
  {
    question: "Is there a cost to join?",
    answer: "Joining Lambsbook as a member is free. You can explore programs, build relationships, and participate in the community at no cost. Paid subscriptions unlock additional benefits and services.",
  },
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
              How Collaboration Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Lambsbook is built on a simple principle: when people collaborate authentically, everyone benefits. 
              We're not an affiliate network or a marketing platform — we're a cooperative ecosystem.
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
                  <h3 className="text-xl font-semibold mb-3">A Platform Built on Trust</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you invite someone to collaborate on Lambsbook, you're not just sharing a link — you're 
                    forming a lasting partnership. This relationship remains throughout your journey on the platform, 
                    creating a network of mutual support and shared success.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe in real programs, genuine education, and authentic community building. There are no 
                    quick schemes or empty promises — just honest collaboration that creates real value for everyone involved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
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
            Our Strategic Business Units
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
            Lambsbook operates through focused business units, each creating value in education, agriculture, and community development.
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
                        Learn more
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
          <h2 className="text-2xl font-bold mb-8">Our Commitment</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Trust & Transparency",
              "Long-term Relationships",
              "Real Education Programs",
              "Shared Success",
            ].map((value, index) => (
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
            Join the Collaboration Economy
          </h2>
          <p className="mb-8 opacity-90 text-lg" data-testid="text-cta-desc">
            Be part of a global community that believes in cooperation, shared growth, and creating value together.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" variant="secondary" data-testid="button-cta-signup">
                Join as a Free Member
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
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={sectionRefs.contact} className="py-16 px-4 bg-muted/30" id="contact">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-4">Get in Touch</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Have questions about collaboration or our programs? We're here to help you get started.
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
                Education Programs
              </Link>
              <Link href="/hub/vision/farmstay" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-farmstay">
                Farmstay Vision
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
