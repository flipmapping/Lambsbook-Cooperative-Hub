import { CapabilityRegistry } from "./capability-registry";
import type { OrganizationManifest } from "./organization-manifest";
import type { ExecutionPlan } from "./execution-plan";

export function createExecutionPlan(
  manifest: OrganizationManifest
): ExecutionPlan {
  return manifest.capabilities.map((id) => {
    const capability = CapabilityRegistry.find(c => c.id === id);

    if (!capability) {
      throw new Error(`Unknown capability: ${id}`);
    }

    return {
      capability: capability.id,
      authority: capability.authority,
      runtimeSurface: capability.runtimeSurface,
      workspace: capability.workspace,
    };
  });
}
