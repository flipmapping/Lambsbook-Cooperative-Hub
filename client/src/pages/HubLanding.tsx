import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Gift, Building2, GraduationCap, Sprout, Home, Coffee } from "lucide-react";

const sbus = [
  {
    id: 1,
    name: "Coffee Shop & Community",
    icon: Coffee,
    description: "Lady Jane's community gathering space",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: 2,
    name: "Education Programs",
    icon: GraduationCap,
    description: "Tropicana, CTBC, Lambsbook.net tutoring",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: 3,
    name: "Migration & HR",
    icon: Building2,
    description: "Glory International partnership - EB-3 visas",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: 4,
    name: "Agricultural Products",
    icon: Sprout,
    description: "Gac Puree, Rocket Stoves by Carl",
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: 5,
    name: "Farmstay Community",
    icon: Home,
    description: "Future community living experience",
    color: "bg-teal-500/10 text-teal-600",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Earn Commissions",
    description: "Earn up to 15% on tier 1 referrals and 15% on tier 2 referrals across all programs.",
  },
  {
    icon: Users,
    title: "Build Your Network",
    description: "Connect with partners and collaborators across 5 strategic business units.",
  },
  {
    icon: Gift,
    title: "Exclusive Benefits",
    description: "Access special programs, early opportunities, and community support.",
  },
];

export default function HubLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LB</span>
            </div>
            <span className="font-semibold text-lg">Lambsbook Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/hub/login">
              <Button variant="ghost" data-testid="button-hub-login">
                Log In
              </Button>
            </Link>
            <Link href="/hub/signup">
              <Button data-testid="button-hub-signup">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Gateway to Global Opportunities
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join the Lambsbook Agentic Hub and unlock earning potential across education, 
            migration services, agriculture, and community projects worldwide.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/signup">
              <Button size="lg" data-testid="button-hero-signup">
                Start Earning Today
              </Button>
            </Link>
            <Link href="#programs">
              <Button size="lg" variant="outline" data-testid="button-explore-programs">
                Explore Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Why Join Lambsbook Hub?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center" data-testid={`card-benefit-${index}`}>
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SBUs Section */}
      <section id="programs" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Our Business Units</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Five strategic business units offering diverse opportunities for partners and collaborators.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sbus.map((sbu) => (
              <Card key={sbu.id} className="hover-elevate cursor-pointer" data-testid={`card-sbu-${sbu.id}`}>
                <CardHeader>
                  <div className={`h-10 w-10 rounded-md ${sbu.color} flex items-center justify-center mb-2`}>
                    <sbu.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{sbu.name}</CardTitle>
                  <CardDescription>{sbu.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">Commission Structure</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <Card data-testid="card-commission-tier1">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">15%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Tier 1 Referral</p>
                <p className="text-sm text-muted-foreground">Direct referrals</p>
              </CardContent>
            </Card>
            <Card data-testid="card-commission-tier2">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">15%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Tier 2 Referral</p>
                <p className="text-sm text-muted-foreground">Second-level referrals</p>
              </CardContent>
            </Card>
            <Card data-testid="card-commission-partner">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">10%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Partner Fee</p>
                <p className="text-sm text-muted-foreground">School/Program partners</p>
              </CardContent>
            </Card>
            <Card data-testid="card-commission-charity">
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl text-primary">10%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Charity Reserve</p>
                <p className="text-sm text-muted-foreground">Community giving</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of members earning across our programs. Sign up takes less than a minute.
          </p>
          <Link href="/hub/signup">
            <Button size="lg" data-testid="button-cta-signup">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Lambsbook Agentic Hub. All rights reserved.</p>
          <p className="mt-2">Contact: support@lambsbook.net</p>
        </div>
      </footer>
    </div>
  );
}
