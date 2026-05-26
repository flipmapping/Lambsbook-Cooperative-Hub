import { useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Award, 
  Users, 
  Globe, 
  GraduationCap,
  Cake,
  Building2,
  Heart,
  ArrowRight,
  MapPin,
  Star,
  Quote,
  Plane
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { HubConsultationForm } from '@/components/HubConsultationForm';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

const trainingPrograms = [
  {
    id: 'culinary',
    titleKey: 'trop_program_culinary',
    descKey: 'trop_program_culinary_desc',
    icon: ChefHat,
    color: 'bg-orange-500/10 text-orange-600',
    features: ['SKM Certification', 'Hands-on Kitchen Training', 'Industry Placements'],
  },
  {
    id: 'patisserie',
    titleKey: 'trop_program_patisserie',
    descKey: 'trop_program_patisserie_desc',
    icon: Cake,
    color: 'bg-pink-500/10 text-pink-600',
    features: ['Baking & Pastry Arts', 'Confectionery Skills', 'Creative Design'],
  },
  {
    id: 'hospitality',
    titleKey: 'trop_program_hospitality',
    descKey: 'trop_program_hospitality_desc',
    icon: Building2,
    color: 'bg-blue-500/10 text-blue-600',
    features: ['Hotel Management', 'Front Office Operations', 'Event Management'],
  },
  {
    id: 'healthcare',
    titleKey: 'trop_program_healthcare',
    descKey: 'trop_program_healthcare_desc',
    icon: Heart,
    color: 'bg-red-500/10 text-red-600',
    features: ['Mental Health', 'Aged Care', 'Disability Studies'],
  },
];

const partnerCountries = [
  { name: 'Australia', cities: ['Sydney', 'Melbourne', 'Adelaide', 'Perth', 'Canberra'] },
  { name: 'USA', cities: ['New York'] },
  { name: 'Malaysia', cities: ['Kuala Lumpur'] },
  { name: 'China', cities: ['Multiple cities'] },
];

const inquiryOptions = [
  { value: 'admission', labelKey: 'trop_inquiry_admission' },
  { value: 'scholarship', labelKey: 'trop_inquiry_scholarship' },
  { value: 'pathway', labelKey: 'trop_inquiry_pathway' },
  { value: 'general', labelKey: 'trop_inquiry_general' },
];

export default function TropicanaProgram() {
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
        brandName="Tropicana Academy"
        brandSubtitle="Culinary & Hospitality Excellence"
        homeLink="/hub/programs/tropicana"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4" data-testid="badge-program">
            <ChefHat className="h-3 w-3 mr-1" />
            TVET Programs
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">
            {t('trop_hero_title')}
          </h1>
          <p className="text-2xl text-orange-100 mb-2" data-testid="text-hero-subtitle">
            {t('trop_hero_subtitle')}
          </p>
          <p className="text-lg text-orange-200 mb-8" data-testid="text-hero-desc">
            {t('trop_hero_desc')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={scrollToContact}
              className="bg-white text-orange-700 hover:bg-orange-50"
              data-testid="button-hero-apply"
            >
              {t('hub_apply_now')}
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
          <div className="mt-8 flex items-center justify-center gap-2 text-orange-200">
            <MapPin className="h-4 w-4" />
            <span>Kuala Lumpur, Malaysia</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={sectionRefs.about} className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-6" data-testid="text-about-title">
            {t('trop_about_title')}
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground text-center mb-8">
            <p>{t('trop_about_text')}</p>
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t('trop_vision')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('trop_vision_text')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Programs Section */}
      <section ref={sectionRefs.programs} className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" data-testid="text-programs-title">
            {t('trop_programs_title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {trainingPrograms.map((program) => (
              <Card key={program.id} className="hover-elevate" data-testid={`card-program-${program.id}`}>
                <CardHeader>
                  <div className={`h-12 w-12 rounded-md ${program.color} flex items-center justify-center mb-3`}>
                    <program.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{t(program.titleKey)}</CardTitle>
                  <CardDescription>{t(program.descKey)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {program.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* International Pathways */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Plane className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-center" data-testid="text-pathway-title">
              {t('trop_pathway_title')}
            </h2>
          </div>
          <p className="text-center text-muted-foreground mb-10" data-testid="text-pathway-desc">
            {t('trop_pathway_text')}
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {partnerCountries.map((country, index) => (
              <Card key={index} data-testid={`card-partner-${index}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    {country.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {country.cities.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-8" data-testid="text-testimonial-title">
            {t('trop_testimonial_title')}
          </h2>
          <Card className="bg-background">
            <CardContent className="pt-8">
              <Quote className="h-10 w-10 text-primary/30 mx-auto mb-4" />
              <blockquote className="text-lg italic text-muted-foreground mb-4" data-testid="text-testimonial">
                {t('trop_testimonial_text')}
              </blockquote>
              <p className="font-medium" data-testid="text-testimonial-author">
                — {t('trop_testimonial_author')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4" data-testid="text-partners-title">
            {t('trop_partners_title')}
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            {t('trop_partners_subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {['Universities in Australia', 'Colleges in New York', 'MCAHA Malaysia', 'Industry Partners'].map((partner, index) => (
              <div key={index} className="p-4 border rounded-lg" data-testid={`text-partner-${index}`}>
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="container mx-auto text-center max-w-2xl">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4" data-testid="text-cta-title">
            {t('trop_cta_title')}
          </h2>
          <p className="mb-8 opacity-90" data-testid="text-cta-desc">
            {t('trop_cta_text')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={scrollToContact}
              className="bg-white text-orange-700 hover:bg-orange-50"
              data-testid="button-cta-apply"
            >
              {t('hub_apply_now')}
            </Button>
            <Link href="/hub/signup">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                data-testid="button-cta-partner"
              >
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={sectionRefs.contact} className="py-16 px-4 bg-muted/30" id="contact">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-4">{t('hub_free_consultation')}</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Interested in our culinary and hospitality programs? Get in touch with us for more information.
          </p>
          <HubConsultationForm 
            inquiryOptions={inquiryOptions}
            source="hub-tropicana"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Tropicana Academy via Lambsbook Hub. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub" className="text-muted-foreground hover:text-primary">
                Lambsbook Hub
              </Link>
              <Link href="/hub/sbu/education" className="text-muted-foreground hover:text-primary">
                Education SBU
              </Link>
              <a 
                href="https://www.tropicanaacademy.edu.my" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                Official Website
              </a>
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
