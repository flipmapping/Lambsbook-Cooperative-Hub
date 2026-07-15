import type { RuntimeState } from "./PostAuthenticationContinuation";

/**
 * ============================================================================
 * Runtime Navigation Policy
 * ============================================================================
 *
 * Architectural Role:
 *   Canonical owner of RuntimeState → destination mapping.
 *
 * Governance:
 *   - Pure navigation policy.
 *   - No authentication.
 *   - No continuation orchestration.
 *   - No business mutation.
 */

export function resolveRuntimeDestination(
  runtimeState: RuntimeState,
): string {
  switch (runtimeState.outcome) {
    case "member":
      return "/hub/dashboard";

    case "pending_invitation":
      return "/hub/accept-invitation";

    case "non_member":
      return "/hub/signup";

    case "anonymous":
      return "/";

    default:
      return "/hub/dashboard";
  }
}
