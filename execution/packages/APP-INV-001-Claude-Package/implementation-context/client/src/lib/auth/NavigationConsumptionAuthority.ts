import type { RuntimeState } from "./PostAuthenticationContinuation";
import { resolveRuntimeDestination } from "./RuntimeNavigationPolicy";

/**
 * ============================================================================
 * Navigation Consumption Authority
 * ============================================================================
 *
 * Architectural Role:
 *   Sole consumer of RuntimeState for authentication completion.
 *
 * Governance:
 *   - Consumes RuntimeState only.
 *   - Performs no business resolution.
 *   - Performs no membership resolution.
 *   - Performs no invitation resolution.
 *   - Preserves current observable navigation behaviour.
 */

export function resolvePostAuthenticationDestination(
  runtimeState: RuntimeState,
): string {
  return resolveRuntimeDestination(runtimeState);
}
