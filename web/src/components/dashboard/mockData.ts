import type { DashboardMockData } from "@/components/dashboard/types";

export const dashboardMockData: DashboardMockData = {
  heroTitle: "Build trusted ideas into formalized programs",
  heroDescription:
    "Follow the cooperative workflow from idea through discussion, refinement, support, adoption, and formalized program.",
  pipelineItems: [
    {
      id: "idea-1",
      title: "Community language exchange circle",
      summary: "Early idea exploring weekly multilingual exchange sessions.",
      stage: "idea",
      authorLabel: "Shared by community member",
      supportCount: 4,
      discussionCount: 2,
      isMemberActionable: false,
    },
    {
      id: "discussion-1",
      title: "Volunteer-led reading circle",
      summary: "Open discussion on format, schedule, and facilitation roles.",
      stage: "discussion",
      authorLabel: "Discussed by cooperative members",
      supportCount: 7,
      discussionCount: 8,
      isMemberActionable: true,
    },
    {
      id: "candidate-1",
      title: "Chinese learning support pathway",
      summary: "Emerging candidate with clearer scope and participant demand.",
      stage: "candidate",
      authorLabel: "Candidate under review",
      supportCount: 11,
      discussionCount: 9,
      isMemberActionable: true,
    },
    {
      id: "refinement-1",
      title: "Youth speaking workshop",
      summary: "Refinement underway on curriculum, hosting rhythm, and outcomes.",
      stage: "refinement",
      authorLabel: "Refinement group active",
      supportCount: 9,
      discussionCount: 6,
      isMemberActionable: true,
    },
    {
      id: "support-1",
      title: "Son La study support collective",
      summary: "Support is gathering around a concrete cooperative offer.",
      stage: "support",
      authorLabel: "Community support building",
      supportCount: 15,
      discussionCount: 5,
      isMemberActionable: true,
    },
    {
      id: "adoption-1",
      title: "Mentored English practice stream",
      summary: "Adoption stage reached with a shared cooperative commitment.",
      stage: "adoption",
      authorLabel: "Adoption in progress",
      supportCount: 18,
      discussionCount: 7,
      isMemberActionable: true,
    },
    {
      id: "formalized-1",
      title: "Son La Organic Food Gift Pack",
      summary: "Formalized program surfaced from the workflow and now lives in the programs layer.",
      stage: "formalized",
      authorLabel: "Formalized as program",
      supportCount: 24,
      discussionCount: 12,
      isMemberActionable: false,
    },
  ],
  contributions: {
    ideasSubmitted: 3,
    discussionsJoined: 8,
    refinementsMade: 2,
    supportsGiven: 6,
  },
  cooperativeActivity: [
    {
      id: "activity-1",
      type: "discussion",
      title: "New discussion opened on local study circles",
      summary: "Members are clarifying format, audience, and hosting structure.",
      timestampLabel: "Today",
    },
    {
      id: "activity-2",
      type: "candidate",
      title: "Chinese learning support moved into candidate stage",
      summary: "The idea now has stronger shape, contributor interest, and next-step clarity.",
      timestampLabel: "Yesterday",
    },
    {
      id: "activity-3",
      type: "adoption",
      title: "Mentored English practice reached adoption",
      summary: "The cooperative has aligned around a clear direction for delivery.",
      timestampLabel: "This week",
    },
  ],
  programs: [
    {
      id: "program-1",
      name: "Son La Organic Food Gift Pack",
      summary: "A formalized program with recurring subscription context.",
      statusLabel: "Formalized Program",
      subscriptionContextLabel: "Monthly subscription available",
      creditContextLabel: "Credits apply only within program/subscription context",
    },
    {
      id: "program-2",
      name: "Mentored English Practice Stream",
      summary: "A structured learning program surfaced from the cooperative workflow.",
      statusLabel: "Formalized Program",
      subscriptionContextLabel: "Program participation context only",
    },
  ],
  relationshipContext: {
    membershipLabel: "Trust grows through participation, contribution, and governed invitation acceptance.",
    invitationContextLabel: "Invitation acceptance remains the sole membership activation surface.",
    trustMessage:
      "This dashboard presents the cooperative workflow without referral, reward, or incentive framing.",
  },
};


export function groupPipelineByStage(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.stage]) acc[item.stage] = [];
    acc[item.stage].push(item);
    return acc;
  }, {});
}
