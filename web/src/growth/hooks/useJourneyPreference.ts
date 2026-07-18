import {
  useJourneyPreferenceContext,
  type JourneyId,
  type JourneyPreferenceContextValue,
} from "../context/JourneyPreferenceContext";

/**
 * Exposes the JourneyPreferenceContext to components.
 *
 * Must be used within JourneyPreferenceProvider (composed into GrowthProvider).
 */
export function useJourneyPreference(): JourneyPreferenceContextValue {

  return useJourneyPreferenceContext();

}

export type { JourneyId };
