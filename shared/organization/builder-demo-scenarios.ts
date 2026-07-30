export interface BuilderDemoScenario {
  id: string;
  title: string;
  founderPrompt: string;
  expectedCapabilities: string[];
  expectedWorkspaces: string[];
}

export const BuilderDemoScenarios: BuilderDemoScenario[] = [
  {
    id: "ctbc-recruitment-hub",
    title: "CTBC Recruitment Hub",
    founderPrompt:
      "Create a recruitment organization for CTBC University to recruit Vietnamese students.",

    expectedCapabilities: [
      "prospects",
      "journeys",
      "members",
      "notifications"
    ],

    expectedWorkspaces: [
      "growth",
      "membership",
      "operations"
    ]
  }
];
