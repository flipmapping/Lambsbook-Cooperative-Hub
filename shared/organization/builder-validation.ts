import { getDefaultBuilderDemo } from "./builder-demo";
import { createExecutionPlan } from "./builder-planner";
import type { OrganizationManifest } from "./organization-manifest";

export function validateBuilderPlanning() {
  const demo = getDefaultBuilderDemo();

  const manifest: OrganizationManifest = {
    organization: {
      name: demo.title,
      type: "demo",
    },
    capabilities: demo.expectedCapabilities,
    channels: [],
    workspaces: demo.expectedWorkspaces,
  };

  const plan = createExecutionPlan(manifest);

  return {
    scenario: demo.title,
    organization: manifest.organization.name,
    steps: plan.map(step => ({
      capability: step.capability,
      authority: step.authority,
      workspace: step.workspace,
      runtimeSurface: step.runtimeSurface,
    })),
  };
}
