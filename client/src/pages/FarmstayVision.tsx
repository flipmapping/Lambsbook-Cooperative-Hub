import { useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  TreePine,
  Heart,
  Users,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Sun,
  Building,
  GraduationCap
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

const visionPillars = [
  {
    icon: TreePine,
    title: "Ecotourism Destinations",
    description: "Create sustainable farmstay experiences that connect visitors with nature, local culture, and agricultural traditions.",
  },
  {
    icon: Heart,
    title: "Elderly Care Communities",
    description: "Develop peaceful, nature-based communities where seniors can enjoy healthy living, companionship, and purposeful activities.",
  },
  {
    icon: GraduationCap,
    title: "Education Cooperatives",
    description: "Partner with educators to offer experiential learning programs — from environmental education to agricultural training.",
  },
  {
    icon: Leaf,
    title: "Farming Cooperatives",
    description: "Build networks of farmers who share knowledge, resources, and market access to create sustainable agricultural businesses.",
  },
];

const partnerOpportunities = [
  "Land owners with suitable properties",
  "Investors interested in sustainable projects",
  "Educators and training organizations",
  "Healthcare and elderly care professionals",
  "Local community leaders and governments",
  "Sustainable agriculture experts",
];

export default function FarmstayVision() {
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

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
        brandName="Farmstay Communities"
        brandSubtitle="Vision & Partnership"
        homeLink="/hub"
      />

      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4" data-testid="badge-farmstay">
            <Home className="h-3 w-3 mr-1" />
            SBU 5 - Farmstay Communities
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
            Building Farmstay Communities Together
          </h1>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
            Partner with Lambsbook to create sustainable farmstay communities for ecotourism, 
            elderly care, and cooperative education and farming ventures.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button 
                size="lg" 
                variant="secondary"
                data-testid="button-hero-partner"
              >
                Become a Partner
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/hub">
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-white/10"
                data-testid="button-hero-hub"
              >
                Back to Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vision Introduction */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Sun className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4" data-testid="text-vision-title">
              Our Vision
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We envision a network of farmstay communities across the globe — places where people can 
              reconnect with nature, learn sustainable practices, and build meaningful connections.
            </p>
          </div>

          <Card className="mb-8" data-testid="card-vision-statement">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Building className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Co-Creating the Future</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Farmstay Communities is not just a real estate project — it's a collaborative vision 
                    for sustainable living. We're seeking partners who share our values and want to 
                    co-create spaces that benefit communities, the environment, and future generations.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you have land, expertise, capital, or simply passion for sustainable 
                    community development, there's a place for you in this vision.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-pillars-title">
            Four Pillars of Farmstay Communities
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Each farmstay community can integrate one or more of these elements, 
            creating unique experiences tailored to local contexts and partner capabilities.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {visionPillars.map((pillar, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-pillar-${index}`}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <pillar.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pillar.title}</CardTitle>
                    <CardDescription className="mt-2">{pillar.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-partners-title">
            Who We're Looking For
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We believe the best communities are built through genuine partnerships. 
            We're seeking collaborators who bring diverse skills and perspectives.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {partnerOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center gap-3" data-testid={`text-opportunity-${index}`}>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>{opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-how-title">
            How Partnership Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center" data-testid="card-step-1">
              <CardHeader>
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <CardTitle className="text-lg">Connect & Explore</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join Lambsbook and express your interest in farmstay partnerships. 
                  Share your vision, resources, or expertise.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-step-2">
              <CardHeader>
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <CardTitle className="text-lg">Collaborate & Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Work with our team and other partners to develop a shared vision 
                  for your farmstay community project.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-step-3">
              <CardHeader>
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <CardTitle className="text-lg">Build & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Co-create the community together, sharing responsibilities, 
                  resources, and the value generated over time.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">
            Ready to Build Something Meaningful?
          </h2>
          <p className="mb-8 opacity-90 text-lg">
            Join our network of partners who are creating sustainable farmstay communities around the world.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button 
                size="lg" 
                variant="secondary"
                data-testid="button-cta-partner"
              >
                Become a Partner
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/hub">
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-primary-foreground/10"
                data-testid="button-cta-hub"
              >
                Explore the Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Lambsbook Collaborative Hub. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-hub">
                Lambsbook Hub
              </Link>
              <Link href="/hub/sbu/education" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-education">
                Education Programs
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
