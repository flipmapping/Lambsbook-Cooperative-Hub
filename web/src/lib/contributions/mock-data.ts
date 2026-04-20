import type { Contribution } from "@/types/contribution";

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    id: "contrib_001",
    title: "Prepare local welcome notes for visiting educators",
    description:
      "Draft and coordinate a short welcome note and orientation help for an upcoming visit.",
    contributionType: "hospitality",

    createdAt: "2026-04-20T08:30:00.000Z",
    createdByMemberId: "member_010",
    createdByDisplayName: "Member D",

    partners: [],
    seconders: [],
    evidence: [],
    stageHistory: [],

    programLink: {
      linked: false,
      linkType: "placeholder",
      note: "No program link established",
    },
  },
  {
    id: "contrib_002",
    title: "Host visiting educators for one afternoon",
    description:
      "Coordinate a local welcome, venue support, and basic hospitality for a scheduled visit.",
    contributionType: "hospitality",

    pipelineStage: "expressed",

    createdAt: "2026-04-20T09:00:00.000Z",
    createdByMemberId: "member_001",
    createdByDisplayName: "Member A",

    initiator: {
      memberId: "member_001",
      displayName: "Member A",
      initiatedAt: "2026-04-20T09:05:00.000Z",
    },

    partners: [],
    seconders: [
      {
        memberId: "member_002",
        displayName: "Member B",
        secondedAt: "2026-04-20T09:10:00.000Z",
      },
      {
        memberId: "member_003",
        displayName: "Member C",
        secondedAt: "2026-04-20T09:12:00.000Z",
      },
    ],

    evidence: [
      {
        id: "evidence_001",
        kind: "note",
        label: "Initial contribution note",
        value: "Local support is available and timing has been discussed.",
        addedAt: "2026-04-20T09:15:00.000Z",
        addedByMemberId: "member_001",
      },
    ],

    stageHistory: [
      {
        id: "hist_001",
        stage: "expressed",
        changedAt: "2026-04-20T09:12:00.000Z",
        changedByMemberId: "member_001",
        actorLabel: "Member A",
        note: "Entered pipeline after initiation and 2 seconders",
      },
    ],

    programLink: {
      linked: false,
      linkType: "placeholder",
      note: "No program link established",
    },
  },
];
