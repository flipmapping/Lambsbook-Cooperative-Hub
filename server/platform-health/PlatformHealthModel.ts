export interface PlatformHealth {
  generatedAt: string;
  healthScore: number;
  platformStatus: "Healthy" | "Warning" | "ActionRequired";

  governanceAdoption: number;
  automationCoverage: number;

  buildGateStatus: string;
  runtimeVerification: string;

  executionStreams: Array<{
    name: string;
    status: string;
  }>;
}
