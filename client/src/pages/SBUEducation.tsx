import { useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Award, 
  Users, 
  Globe, 
  BookOpen, 
  ChefHat,
  Building2,
  Heart,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { HubConsultationForm } from '@/components/HubConsultationForm';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

const programs = [
  {
    id: 'tropicana',
    name: 'Tropicana Academy',
    icon: ChefHat,
    description: 'Culinary arts, patisserie & hospitality training in Malaysia with pathways to Australia & USA',
    location: 'Kuala Lumpur, Malaysia',
    href: '/hub/programs/tropicana',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    id: 'ctbc',
    name: 'CTBC Programs',
    icon: Building2,
    description: 'Business and financial education programs with industry partnerships',
    location: 'Taiwan',
    href: '#',
    color: 'bg-blue-500/10 text-blue-600',
    comingSoon: true,
  },
  {
    id: 'lambsbook',
    name: 'Lambsbook.net Tutoring',
    icon: BookOpen,
    description: 'Online tutoring and academic support for students worldwide',
    location: 'Online',
    href: '#',
    color: 'bg-purple-500/10 text-purple-600',
    comingSoon: true,
  },
];

const benefits = [
  {
    icon: Award,
    titleKey: 'edu_benefit_certification',
    descKey: 'edu_benefit_certification_desc',
  },
  {
    icon: Users,
    titleKey: 'edu_benefit_placement',
    descKey: 'edu_benefit_placement_desc',
  },
  {
    icon: Globe,
    titleKey: 'edu_benefit_pathway',
    descKey: 'edu_benefit_pathway_desc',
  },
  {
    icon: BookOpen,
    titleKey: 'edu_benefit_flexible',
    descKey: 'edu_benefit_flexible_desc',
  },
];

const inquiryOptions = [
  { value: 'general', labelKey: 'edu_inquiry_general' },
  { value: 'admission', labelKey: 'edu_inquiry_admission' },
  { value: 'scholarship', labelKey: 'edu_inquiry_scholarship' },
  { value: 'career', labelKey: 'edu_inquiry_career' },
];

export default function SBUEducation() {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);

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

  const scrollToContact = () => {
    sectionRefs.contact.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
        brandName="Lambsbook Education"
        brandSubtitle="SBU 2 - Education Programs"
        homeLink="/hub/sbu/education"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4" data-testid="badge-sbu">
            <GraduationCap className="h-3 w-3 mr-1" />
            SBU 2 - Education
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
            {t('edu_hero_title')}
          </h1>
          <p className="text-xl text-blue-100 mb-8" data-testid="text-hero-subtitle">
            {t('edu_hero_subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={scrollToContact}
              className="bg-white text-blue-700 hover:bg-blue-50"
              data-testid="button-hero-consultation"
            >
              {t('hub_free_consultation')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => handleNavigate('programs')}
              data-testid="button-hero-programs"
            >
              {t('hub_programs')}
            </Button>
          </div>
          <p className="mt-8 text-sm text-blue-200" data-testid="text-trusted">
            {t('edu_trusted')}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section ref={sectionRefs.about} className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4" data-testid="text-about-title">
            {t('edu_about_title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12" data-testid="text-about-desc">
            {t('edu_about_text')}
          </p>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} data-testid={`card-benefit-${index}`}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t(benefit.titleKey)}</CardTitle>
                    <CardDescription className="mt-1">{t(benefit.descKey)}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section ref={sectionRefs.programs} className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4" data-testid="text-programs-title">
            {t('edu_programs_title')}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('edu_programs_subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {programs.map((program) => (
              <Card 
                key={program.id} 
                className={`hover-elevate ${program.comingSoon ? 'opacity-70' : 'cursor-pointer'}`}
                data-testid={`card-program-${program.id}`}
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-md ${program.color} flex items-center justify-center mb-3`}>
                    <program.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    {program.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                  </div>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Globe className="h-4 w-4" />
                    {program.location}
                  </div>
                  {!program.comingSoon && (
                    <Link href={program.href}>
                      <Button className="w-full" data-testid={`button-program-${program.id}`}>
                        {t('hub_learn_more')}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feedback Tool Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="overflow-hidden" data-testid="card-ai-feedback-tool">
            <div className="md:flex">
              <div className="md:w-2/3 p-6">
                <Badge className="mb-3" data-testid="badge-free-trial">
                  <Sparkles className="h-3 w-3 mr-1" />
                  3 Free Uses
                </Badge>
                <h3 className="text-2xl font-bold mb-3" data-testid="text-ai-tool-title">
                  AI-Powered Feedback Engine
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get instant, detailed feedback on IELTS speaking and writing. Our AI analyzes transcripts and provides band scores, improvement suggestions, and personalized study tips.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    IELTS Academic & General Training
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Speaking Parts 1, 2 & 3 analysis
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    YouTube transcript extraction
                  </li>
                </ul>
                <Link href="/hub/education/submit">
                  <Button size="lg" data-testid="button-try-feedback">
                    Try Feedback Engine
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <p className="font-semibold">Instant AI Analysis</p>
                  <p className="text-sm text-blue-100">Powered by GPT-4</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10" data-testid="text-why-title">
            {t('edu_why_title')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Internationally recognized certifications',
              'Hands-on practical training',
              'Direct pathways to universities worldwide',
              'Job placement support',
              'Flexible learning options',
              'Multi-language support',
              'Industry partnerships',
              'Career counseling',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3" data-testid={`text-feature-${index}`}>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">Partner with Lambsbook Education</h2>
          <p className="mb-8 opacity-90">
            Join as a collaborator or partner and earn commissions while helping students achieve their dreams.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" variant="secondary" data-testid="button-cta-join">
                {t('hub_join_now')}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              onClick={scrollToContact}
              data-testid="button-cta-contact"
            >
              {t('hub_contact')}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={sectionRefs.contact} className="py-16 px-4 bg-muted/30" id="contact">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_free_consultation')}</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Get expert guidance on our education programs. We're here to help you find the perfect pathway.
          </p>
          <HubConsultationForm 
            inquiryOptions={inquiryOptions}
            source="hub-education"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Lambsbook Education. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub" className="text-muted-foreground hover:text-primary">
                Lambsbook Hub
              </Link>
              <Link href="/hub/programs/tropicana" className="text-muted-foreground hover:text-primary">
                Tropicana Academy
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
