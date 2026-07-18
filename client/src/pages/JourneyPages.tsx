import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Handshake,
  Sprout,
  Users,
  Globe,
  BookOpen,
  Award,
} from "lucide-react";
import { HubHeader } from "@/components/HubHeader";

interface InitiativeItem {
  icon: typeof Users;
  title: string;
  description: string;
}

interface JourneyPageContent {
  id: string;
  heroImage: string;
  heroImageAlt: string;
  heroCaption: string;
  title: string;
  subtitle: string;
  whyTitle: string;
  whyParagraphs: string[];
  listTitle: string;
  listItems: string[];
  actionTitle: string;
  actionSubtitle: string;
  initiatives: InitiativeItem[];
  ctaLine: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

const contributeContent: JourneyPageContent = {
  id: "contribute",
  heroImage: "/assets/journey-contribute.jpg",
  heroImageAlt:
    "A diverse group of people collaborating together around a shared workspace, reviewing plans and ideas",
  heroCaption: "Great communities are built by people who choose to contribute.",
  title: "Contribute & Connect",
  subtitle:
    "Build stronger communities by sharing your knowledge, experience, resources and relationships.",
  whyTitle: "Why Contribute?",
  whyParagraphs: [
    "Every thriving community is built by people who choose to contribute.",
    "The Lambsbook Cooperative helps members transform their ideas, skills and relationships into opportunities that benefit both themselves and the wider community.",
    "Whether you are a mentor, entrepreneur, university, business, farmer, volunteer or investor, your contribution becomes part of a network that creates value together.",
  ],
  listTitle: "Ways You Can Contribute",
  listItems: [
    "Mentor students",
    "Partner with universities",
    "Support scholarships",
    "Develop community programs",
    "Offer internships",
    "Build strategic business units",
    "Create products and services",
    "Invest in cooperative initiatives",
    "Share expertise",
  ],
  actionTitle: "Cooperative in Action",
  actionSubtitle:
    "Contribution is already shaping real programs across the cooperative today.",
  initiatives: [
    {
      icon: GraduationCap,
      title: "CTBC University",
      description:
        "A university partnership opening scholarship pathways and international education for members.",
    },
    {
      icon: Award,
      title: "Scholarship Programs",
      description:
        "Member-supported scholarships that help students access life-changing opportunities.",
    },
    {
      icon: Sprout,
      title: "Agricultural Development",
      description:
        "Farmers and producers building healthy food products together, from Gac fruit to community farms.",
    },
    {
      icon: Handshake,
      title: "Community Partnerships",
      description:
        "Businesses, mentors and community leaders forming partnerships that strengthen everyone involved.",
    },
  ],
  ctaLine: "Together we create opportunities that none of us could create alone.",
  primaryCta: { label: "Explore Programs", href: "/hub/scholarships" },
  secondaryCta: { label: "Become a Member", href: "/hub/signup" },
};

const learnContent: JourneyPageContent = {
  id: "learn",
  heroImage: "/assets/journey-learn.jpg",
  heroImageAlt:
    "A joyful group of graduating students celebrating together on a sunny university campus",
  heroCaption: "Every opportunity begins with a willingness to learn.",
  title: "Learn, Grow & Flourish",
  subtitle:
    "Discover opportunities that help you build knowledge, relationships and a meaningful future.",
  whyTitle: "Why Learn?",
  whyParagraphs: [
    "Learning is more than gaining knowledge.",
    "It is about discovering opportunities, connecting with mentors, serving others and growing into someone who helps others flourish as well.",
    "The Cooperative supports lifelong learning through education, scholarships, mentoring, international opportunities and community.",
  ],
  listTitle: "What You Can Explore",
  listItems: [
    "Scholarships",
    "University pathways",
    "Mentoring",
    "Career development",
    "Language learning",
    "International education",
    "Community leadership",
    "Lifelong learning",
  ],
  actionTitle: "Learning in Action",
  actionSubtitle:
    "These are real learning pathways members are exploring right now.",
  initiatives: [
    {
      icon: GraduationCap,
      title: "CTBC University",
      description:
        "University pathways with scholarship support and international study opportunities.",
    },
    {
      icon: Award,
      title: "Scholarships",
      description:
        "Scholarship programs that open doors for students ready to grow.",
    },
    {
      icon: Users,
      title: "Student Mentoring",
      description:
        "Mentors who walk alongside students through study, career and life decisions.",
    },
    {
      icon: Globe,
      title: "International Opportunities",
      description:
        "Education partnerships and study-abroad pathways connecting members across countries.",
    },
  ],
  ctaLine: "Every journey begins with one opportunity.",
  primaryCta: { label: "Explore Programs", href: "/hub/scholarships" },
  secondaryCta: { label: "Join the Cooperative", href: "/hub/signup" },
};

function JourneyPage({ content }: { content: JourneyPageContent }) {
  return (
    <div className="min-h-screen bg-background">
      <HubHeader
        brandName="Lambsbook Cooperative Hub"
        brandSubtitle="Open Collaboration Economy"
        homeLink="/hub"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b1533]">
        <img
          src={content.heroImage}
          alt={content.heroImageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b1533] via-[#0b1533]/70 to-[#0b1533]/30"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 pt-40 pb-16 md:pt-56 md:pb-20 max-w-5xl">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            data-testid={`text-journey-${content.id}-title`}
          >
            {content.title}
          </h1>
          <p
            className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed mb-4"
            data-testid={`text-journey-${content.id}-subtitle`}
          >
            {content.subtitle}
          </p>
          <p className="text-sm text-slate-300/90 italic" data-testid={`text-journey-${content.id}-caption`}>
            "{content.heroCaption}"
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-6" data-testid={`text-journey-${content.id}-why-title`}>
            {content.whyTitle}
          </h2>
          <div className="space-y-4">
            {content.whyParagraphs.map((p, i) => (
              <p key={i} className="text-lg text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* List */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-8" data-testid={`text-journey-${content.id}-list-title`}>
            {content.listTitle}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {content.listItems.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* In Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" data-testid={`text-journey-${content.id}-action-title`}>
              {content.actionTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {content.actionSubtitle}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {content.initiatives.map((initiative) => (
              <Card key={initiative.title} data-testid={`card-initiative-${initiative.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                <CardHeader>
                  <div className="h-11 w-11 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <initiative.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{initiative.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {initiative.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-5 text-primary" />
          <p className="text-2xl md:text-3xl font-semibold mb-8 leading-snug" data-testid={`text-journey-${content.id}-cta`}>
            {content.ctaLine}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={content.primaryCta.href}>
              <Button size="lg" data-testid={`button-journey-${content.id}-primary-cta`}>
                {content.primaryCta.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={content.secondaryCta.href}>
              <Button size="lg" variant="outline" data-testid={`button-journey-${content.id}-secondary-cta`}>
                {content.secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2025 Lambsbook Cooperative Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export function JourneyContribute() {
  return <JourneyPage content={contributeContent} />;
}

export function JourneyLearn() {
  return <JourneyPage content={learnContent} />;
}
