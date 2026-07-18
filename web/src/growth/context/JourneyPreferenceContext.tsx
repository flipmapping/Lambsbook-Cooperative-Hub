import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

// ============================================================================
// Journey Preference — Canonical Types
// ============================================================================

export type JourneyId = "A" | "B";

export interface JourneyPreference {
  selectedJourney: JourneyId;
  selectedAt: string; // ISO 8601
}

// ============================================================================
// Context Contract
// ============================================================================

export interface JourneyPreferenceContextValue {
  selectedJourney: JourneyId | null;
  selectedAt: string | null;
  isJourneySelected(): boolean;
  setSelectedJourney(journey: JourneyId): void;
  clearJourneyPreference(): void;
}

const STORAGE_KEY = "journey_preference";

// ============================================================================
// Storage Helpers
// ============================================================================

function readPreference(): JourneyPreference | null {

  try {

    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).selectedJourney !== "string" ||
      typeof (parsed as Record<string, unknown>).selectedAt !== "string"
    ) {
      return null;
    }

    const journey =
      (parsed as Record<string, unknown>).selectedJourney as string;

    if (journey !== "A" && journey !== "B") return null;

    return {
      selectedJourney: journey as JourneyId,
      selectedAt: (parsed as Record<string, unknown>).selectedAt as string,
    };

  } catch {

    return null;

  }

}

function writePreference(preference: JourneyPreference): void {

  const serialized = JSON.stringify(preference);

  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // localStorage unavailable — continue
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // sessionStorage unavailable — continue
  }

}

function clearPreference(): void {

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // unavailable — continue
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // unavailable — continue
  }

}

// ============================================================================
// Provider
// ============================================================================

const JourneyPreferenceContext =
  createContext<JourneyPreferenceContextValue | null>(null);

export function JourneyPreferenceProvider(
  props: PropsWithChildren
) {

  const [preference, setPreference] =
    useState<JourneyPreference | null>(null);

  // Hydrate from storage on mount
  useEffect(() => {

    const stored = readPreference();

    if (stored) {
      setPreference(stored);
    }

  }, []);

  const setSelectedJourney =
    useCallback((journey: JourneyId): void => {

      const next: JourneyPreference = {
        selectedJourney: journey,
        selectedAt: new Date().toISOString(),
      };

      setPreference(next);
      writePreference(next);

    }, []);

  const clearJourneyPreference =
    useCallback((): void => {

      setPreference(null);
      clearPreference();

    }, []);

  const isJourneySelected =
    useCallback((): boolean => {

      return preference !== null;

    }, [preference]);

  const value =
    useMemo<JourneyPreferenceContextValue>(() => ({
      selectedJourney: preference?.selectedJourney ?? null,
      selectedAt: preference?.selectedAt ?? null,
      isJourneySelected,
      setSelectedJourney,
      clearJourneyPreference,
    }), [
      preference,
      isJourneySelected,
      setSelectedJourney,
      clearJourneyPreference,
    ]);

  return (
    <JourneyPreferenceContext.Provider value={value}>
      {props.children}
    </JourneyPreferenceContext.Provider>
  );

}

// ============================================================================
// Internal hook — consumed by useJourneyPreference
// ============================================================================

export function useJourneyPreferenceContext(): JourneyPreferenceContextValue {

  const context = useContext(JourneyPreferenceContext);

  if (!context) {
    throw new Error(
      "useJourneyPreferenceContext must be used within JourneyPreferenceProvider."
    );
  }

  return context;

}
