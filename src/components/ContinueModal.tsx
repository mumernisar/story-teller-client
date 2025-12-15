/**
 * Continue Modal Component - Enhanced Emotion Selection
 *
 * The emotion system influences story direction but doesn't force it.
 * Similar to choosing a "mood" for how your character approaches the next chapter.
 */

import { useState } from "react";
import "./ContinueModal.css";

// Emotions with descriptions and trajectory hints
const EMOTIONS = [
  {
    name: "kind",
    desc: "Warmth and compassion guide your choices",
    hint: "Tends toward redemption & reconciliation",
    color: "#4CAF50",
    icon: "💚",
  },
  {
    name: "prideful",
    desc: "Standing firm with dignity and resolve",
    hint: "May lead to confrontation or self-discovery",
    color: "#9C27B0",
    icon: "👑",
  },
  {
    name: "wrathful",
    desc: "Intensity and the desire for action",
    hint: "Risk of tragedy, but also breakthrough",
    color: "#f44336",
    icon: "🔥",
  },
  {
    name: "envious",
    desc: "Awareness of what others have",
    hint: "Opens doors to betrayal or mystery",
    color: "#00BCD4",
    icon: "💎",
  },
  {
    name: "fearful",
    desc: "Caution and awareness of danger",
    hint: "Builds suspense and tension",
    color: "#607D8B",
    icon: "🌑",
  },
  {
    name: "conflicted",
    desc: "Torn between competing desires",
    hint: "Favors self-discovery and growth",
    color: "#FF9800",
    icon: "⚖️",
  },
  {
    name: "determined",
    desc: "Focused pursuit of your goals",
    hint: "Drives momentum and progress",
    color: "#2196F3",
    icon: "⚡",
  },
  {
    name: "restless",
    desc: "The need for change and movement",
    hint: "Opens paths to mystery and discovery",
    color: "#FFEB3B",
    icon: "🌊",
  },
  {
    name: "humble",
    desc: "Openness to learning and listening",
    hint: "Builds trust and connection",
    color: "#8BC34A",
    icon: "🌱",
  },
  {
    name: "greedy",
    desc: "The desire for more, always more",
    hint: "Risks tragedy and betrayal",
    color: "#FFD700",
    icon: "✨",
  },
  {
    name: "lustful",
    desc: "Passion that overrides caution",
    hint: "Creates intensity and risk",
    color: "#E91E63",
    icon: "❤️‍🔥",
  },
];

interface ContinueModalProps {
  onClose: () => void;
  onContinue: (emotion: string) => void;
  currentDay: number;
  maxDays: number;
}

export function ContinueModal({
  onClose,
  onContinue,
  currentDay,
  maxDays,
}: ContinueModalProps) {
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedEmotion) return;
    setSubmitting(true);
    onContinue(selectedEmotion);
  };

  const selectedEmotionData = EMOTIONS.find((e) => e.name === selectedEmotion);

  // Calculate story phase for context
  const progress = currentDay / maxDays;
  const phase =
    progress <= 0.25
      ? "setup"
      : progress <= 0.5
      ? "development"
      : progress <= 0.75
      ? "escalation"
      : "resolution";

  const phaseHints: Record<string, string> = {
    setup: "Early in the story - your choices are planting seeds for later.",
    development: "The story deepens - relationships and complications grow.",
    escalation: "Stakes are rising - your choices carry more weight now.",
    resolution: "The story nears its end - final choices shape the conclusion.",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>Continue Your Story</h2>
        <p className="modal-subtitle">
          Day {currentDay} of {maxDays}
        </p>

        <div className="phase-hint">
          <span className="phase-label">{phase}</span>
          <span className="phase-description">{phaseHints[phase]}</span>
        </div>

        <div className="emotion-section">
          <h3>Choose Your Approach</h3>
          <p className="emotion-hint">
            Your emotional state influences how the story unfolds - but it's a
            suggestion, not a command. The narrative responds to your
            accumulated choices over time.
          </p>
          <div className="emotion-grid">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.name}
                className={`emotion-card ${
                  selectedEmotion === emotion.name ? "selected" : ""
                }`}
                style={{
                  borderColor:
                    selectedEmotion === emotion.name
                      ? emotion.color
                      : "transparent",
                  backgroundColor:
                    selectedEmotion === emotion.name
                      ? `${emotion.color}20`
                      : "rgba(255, 255, 255, 0.05)",
                }}
                onClick={() => setSelectedEmotion(emotion.name)}
              >
                <span className="emotion-icon">{emotion.icon}</span>
                <span className="emotion-name">{emotion.name}</span>
              </button>
            ))}
          </div>

          {selectedEmotionData && (
            <div
              className="selected-emotion-details"
              style={{ borderColor: selectedEmotionData.color }}
            >
              <h4>
                {selectedEmotionData.icon} {selectedEmotionData.name}
              </h4>
              <p className="emotion-desc">{selectedEmotionData.desc}</p>
              <p className="emotion-trajectory">{selectedEmotionData.hint}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="continue-btn"
            onClick={handleSubmit}
            disabled={!selectedEmotion || submitting}
          >
            {submitting ? "✨ Writing..." : `Write Day ${currentDay}`}
          </button>
        </div>
      </div>
    </div>
  );
}
