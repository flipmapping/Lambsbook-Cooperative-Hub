import { useState } from "react";

import { useJourneyPreference } from "../../hooks/useJourneyPreference";
import type { JourneyId } from "../../context/JourneyPreferenceContext";

// ============================================================================
// Journey Definitions
// ============================================================================

interface JourneyOption {
  id: JourneyId;
  label: string;
  description: string;
}

const JOURNEY_OPTIONS: JourneyOption[] = [
  {
    id: "A",
    label: "Journey A",
    description:
      "Begin your cooperative education pathway through scholarships and admissions.",
  },
  {
    id: "B",
    label: "Journey B",
    description:
      "Explore cooperative membership and contribute to a shared future.",
  },
];

// ============================================================================
// JourneyCard
// ============================================================================

interface JourneyCardProps {
  option: JourneyOption;
  isSelected: boolean;
  onSelect(id: JourneyId): void;
}

function JourneyCard(props: JourneyCardProps) {

  const { option, isSelected, onSelect } = props;

  const [animate, setAnimate] =
    useState(false);

  function handleClick() {

    if (isSelected) return;

    setAnimate(true);
    onSelect(option.id);

    setTimeout(() => {
      setAnimate(false);
    }, 500);

  }

  const baseStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "1.5rem",
    borderRadius: "0.75rem",
    border: isSelected
      ? "2px solid #2563eb"
      : "2px solid #e5e7eb",
    backgroundColor: isSelected
      ? "#eff6ff"
      : "#ffffff",
    cursor: isSelected ? "default" : "pointer",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    transform: animate ? "scale(1.02)" : "scale(1)",
    boxShadow: isSelected
      ? "0 0 0 3px rgba(37,99,235,0.15)"
      : "0 1px 3px rgba(0,0,0,0.07)",
    outline: "none",
    textAlign: "left",
    width: "100%",
  };

  return (

    <button
      style={baseStyle}
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Select ${option.label}`}
    >

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        <span style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: isSelected ? "#1d4ed8" : "#111827",
        }}>
          {option.label}
        </span>

        {isSelected && (

          <span
            aria-label="Selected"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✓
          </span>

        )}

      </div>

      <p style={{
        margin: 0,
        fontSize: "0.9rem",
        color: isSelected ? "#1e40af" : "#6b7280",
        lineHeight: 1.5,
      }}>
        {option.description}
      </p>

      {isSelected && (

        <span style={{
          alignSelf: "flex-start",
          marginTop: "0.25rem",
          display: "inline-block",
          padding: "0.2rem 0.65rem",
          borderRadius: "9999px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}>
          Your Journey
        </span>

      )}

    </button>

  );

}

// ============================================================================
// JourneyDiscoverySection
// ============================================================================

export function JourneyDiscoverySection() {

  const {
    selectedJourney,
    selectedAt,
    setSelectedJourney,
  } = useJourneyPreference();

  return (

    <section style={{ padding: "3rem 1.5rem" }}>

      <h2 style={{
        fontSize: "1.75rem",
        fontWeight: 700,
        marginBottom: "0.5rem",
        color: "#111827",
      }}>
        Discover Your Journey
      </h2>

      <p style={{
        color: "#6b7280",
        marginBottom: "2rem",
        maxWidth: "36rem",
      }}>
        Select the path that best reflects your aspirations.
        You can change this at any time.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1rem",
        maxWidth: "48rem",
      }}>

        {JOURNEY_OPTIONS.map((option) => (

          <JourneyCard
            key={option.id}
            option={option}
            isSelected={selectedJourney === option.id}
            onSelect={setSelectedJourney}
          />

        ))}

      </div>

      {selectedJourney !== null && selectedAt !== null && (

        <p style={{
          marginTop: "1.5rem",
          fontSize: "0.85rem",
          color: "#9ca3af",
        }}>
          Journey {selectedJourney} selected{" "}
          {new Date(selectedAt).toLocaleString()}.
        </p>

      )}

    </section>

  );

}
