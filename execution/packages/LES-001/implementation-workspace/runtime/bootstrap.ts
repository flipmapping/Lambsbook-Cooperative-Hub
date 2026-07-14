import {
  registerRuntimeProvider,
  type GrowthRuntimeProvider,
} from "./providers";

let initialized = false;

export function initializeGrowthRuntime(
  provider: GrowthRuntimeProvider
): void {

  if (initialized) {
    return;
  }

  registerRuntimeProvider(provider);

  initialized = true;

}

export function isGrowthRuntimeInitialized(): boolean {

  return initialized;

}
