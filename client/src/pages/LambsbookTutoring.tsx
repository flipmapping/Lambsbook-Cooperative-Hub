import { useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Sparkles,
  CheckCircle2,
  Users,
  ArrowRight,
  MessageSquare,
  GraduationCap,
  Zap
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';
import { lambsbookTutoringContent } from '@/lib/lambsbookTutoringContent';

export default function LambsbookTutoring() {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);
  const [, navigate] = useLocation();
  
  const content = lambsbookTutoringContent;

  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLoggedIn = () => {
    return localStorage.getItem('hub_member_id') || localStorage.getItem('hub_auth_token');
  };

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate('/hub/member');
    } else {
      navigate('/hub/signup');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
        brandName="Lambsbook Tutoring"
        brandSubtitle="Online Education Platform"
        homeLink="/hub/sbu/education"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4" data-testid="badge-tutoring">
            <BookOpen className="h-3 w-3 mr-1" />
            Lambsbook.net
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
            {content.header.title}
          </h1>
          <p className="text-xl text-purple-100 mb-8" data-testid="text-hero-subtitle">
            {content.header.subtitle}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              data-testid="button-hero-get-started"
            >
              {content.cta.buttonText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/hub/education/submit">
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-white/10"
                data-testid="button-hero-try-ai"
              >
                Try AI Feedback Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Feedback Engine Section */}
      <section ref={sectionRefs.about} className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4" data-testid="badge-ai-feature">
                <Sparkles className="h-3 w-3 mr-1" />
                Member Benefit
              </Badge>
              <h2 className="text-3xl font-bold mb-4" data-testid="text-ai-title">
                {content.aiFeedback.title}
              </h2>
              <p className="text-muted-foreground mb-6" data-testid="text-ai-description">
                {content.aiFeedback.description}
              </p>
              <ul className="space-y-3 mb-6">
                {content.aiFeedback.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3" data-testid={`text-ai-feature-${index}`}>
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Card className="bg-primary/5 border-primary/20" data-testid="card-ai-callout">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-primary">
                    {content.aiFeedback.callout}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-background flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-primary mx-auto mb-2" />
                      <p className="font-semibold">AI Feedback</p>
                      <p className="text-sm text-muted-foreground">Instant Analysis</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Zap className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-why-title">
            {content.whyJoin.title}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of learners who are improving their skills with Lambsbook's collaborative education platform.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {content.whyJoin.benefits.map((benefit, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-benefit-${index}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Onboarding Works */}
      <section ref={sectionRefs.programs} className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-onboarding-title">
            {content.onboarding.title}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to join our education community.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {content.onboarding.steps.map((step) => (
              <Card key={step.number} className="text-center" data-testid={`card-step-${step.number}`}>
                <CardHeader>
                  <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="mb-8 opacity-90">
            Join Lambsbook today and get access to verified tutors, free trial classes, and unlimited AI feedback.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleGetStarted}
              data-testid="button-cta-get-started"
            >
              {content.cta.buttonText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/hub/sbu/education">
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-primary-foreground/10"
                data-testid="button-cta-back"
              >
                Back to Education Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tutor Highlight Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4" data-testid="text-tutors-title">
            Verified Lambsbook Tutors
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            All our tutors are verified and trained to provide quality education. Whether you're learning English, 
            preparing for IELTS, or developing professional skills, we have the right tutor for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Badge variant="outline" className="px-4 py-2" data-testid="badge-verified">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Background Verified
            </Badge>
            <Badge variant="outline" className="px-4 py-2" data-testid="badge-certified">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Teaching Certified
            </Badge>
            <Badge variant="outline" className="px-4 py-2" data-testid="badge-speakers">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Native & Non-Native Speakers
            </Badge>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Lambsbook.net. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-hub">
                Lambsbook Hub
              </Link>
              <Link href="/hub/sbu/education" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-education">
                Education Hub
              </Link>
              <Link href="/hub/education/submit" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-ai">
                AI Feedback Tool
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
