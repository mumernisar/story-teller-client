/**
 * Story Reader Component - Full story view with chapters and controls
 *
 * Enhanced with:
 * - Proper loading states during chapter generation
 * - Narrative trajectory visualization
 * - Improved chapter navigation
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "../api";
import type { StoryStatus, Chapter, EndingResponse } from "../api";
import { ContinueModal } from "./ContinueModal";
import "./StoryReader.css";

// Emotion colors
const EMOTION_COLORS: Record<string, string> = {
  kind: "#4CAF50",
  prideful: "#9C27B0",
  wrathful: "#f44336",
  envious: "#00BCD4",
  fearful: "#607D8B",
  conflicted: "#FF9800",
  determined: "#2196F3",
  restless: "#FFEB3B",
  humble: "#8BC34A",
  greedy: "#FFD700",
  lustful: "#E91E63",
};

// Loading messages for chapter generation
const LOADING_MESSAGES = [
  "Weaving the next chapter...",
  "The story unfolds...",
  "Characters come to life...",
  "Crafting your narrative...",
  "The tale continues...",
  "Words find their way...",
  "Building anticipation...",
  "Threads intertwine...",
];

interface StoryReaderProps {
  storyId: string;
  onBack: () => void;
}

export function StoryReader({ storyId, onBack }: StoryReaderProps) {
  const [story, setStory] = useState<StoryStatus | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ending, setEnding] = useState<EndingResponse | null>(null);
  const [generatingEnding, setGeneratingEnding] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  // Rotate loading messages during generation
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [generating]);

  const loadStory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [storyData, chaptersData] = await Promise.all([
        api.getStory(storyId),
        api.listChapters(storyId),
      ]);
      setStory(storyData);

      // Separate regular chapters from ending
      const regularChapters = chaptersData.chapters.filter(
        (c) => c.chapter_type !== "ending"
      );
      const endingChapter = chaptersData.chapters.find(
        (c) => c.chapter_type === "ending"
      );

      setChapters(regularChapters);

      // If there's a persisted ending, load it into state
      if (endingChapter) {
        const endingData = endingChapter.ending as
          | Record<string, unknown>
          | undefined;
        setEnding({
          ending_type: (endingData?.ending_type as string) || "unknown",
          title: endingChapter.chapter_title || "The End",
          text: endingChapter.chapter_text,
          word_count: endingChapter.chapter_word_count,
          resolved_threads: (endingData?.resolved_threads as string[]) || [],
          unresolved_threads:
            (endingData?.unresolved_threads as string[]) || [],
        });
      }

      // Select most recent chapter
      if (regularChapters.length > 0) {
        setSelectedChapter(regularChapters[0].day);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load story");
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  const handleContinue = async (emotion: string) => {
    try {
      setShowModal(false);
      setGenerating(true);
      setLoadingMessage(LOADING_MESSAGES[0]);
      setError("");

      // Use random seed automatically
      await api.runDay(storyId, { emotion, recap: "on" });
      await loadStory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue story");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateEnding = async () => {
    try {
      setGeneratingEnding(true);
      setLoadingMessage("Crafting the perfect ending...");
      const result = await api.generateEnding(storyId);
      setEnding(result);
      await loadStory();
      // Auto-select the ending to show it
      setSelectedChapter(-1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate ending"
      );
    } finally {
      setGeneratingEnding(false);
    }
  };

  const currentChapter = selectedChapter
    ? chapters.find((c) => c.day === selectedChapter)
    : chapters[0];

  // Get dominant ending for trajectory display
  const getDominantEnding = () => {
    if (!story?.ending_vector) return null;
    const entries = Object.entries(story.ending_vector);
    if (entries.length === 0) return null;
    const sorted = entries.sort(([, a], [, b]) => b - a);
    return { type: sorted[0][0], score: sorted[0][1] };
  };

  const dominantEnding = getDominantEnding();

  if (loading && !story) {
    return (
      <div className="story-reader loading-state">
        <div className="initial-loader">
          <div className="book-animation">📖</div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (error && !story) {
    return (
      <div className="story-reader error-state">
        <p>⚠️ {error}</p>
        <button onClick={onBack}>← Back to Stories</button>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="story-reader">
      {/* Generation Overlay */}
      {generating && (
        <div className="generation-overlay">
          <div className="generation-content">
            <div className="generation-animation">
              <div className="quill">✒️</div>
              <div className="sparkles">✨</div>
            </div>
            <h3>{loadingMessage}</h3>
            <p className="generation-hint">
              Your choice of emotion is shaping the narrative...
            </p>
            <div className="generation-progress">
              <div className="progress-wave"></div>
            </div>
          </div>
        </div>
      )}

      {/* Ending Generation Overlay */}
      {generatingEnding && (
        <div className="generation-overlay ending-overlay">
          <div className="generation-content">
            <div className="generation-animation">
              <div className="quill">🏁</div>
              <div className="sparkles">✨</div>
            </div>
            <h3>Crafting the perfect ending...</h3>
            <p className="generation-hint">
              Your journey through the story is being woven into a fitting
              conclusion...
            </p>
            <div className="generation-progress">
              <div className="progress-wave"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="reader-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="header-content">
          <h1>{story.title}</h1>
          <div className="story-meta">
            <div className="progress-container">
              <span className="progress-label">
                {story.finished
                  ? `Complete (${story.max_days} days)`
                  : `Day ${Math.max(0, story.day_index - 1)} / ${
                      story.max_days
                    }`}
              </span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (Math.min(story.day_index - 1, story.max_days) /
                        story.max_days) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
            {story.last_emotion && (
              <span
                className="emotion-badge"
                style={{ backgroundColor: EMOTION_COLORS[story.last_emotion] }}
              >
                {story.last_emotion}
              </span>
            )}
            {story.finished && (
              <span className="finished-badge">✓ Complete</span>
            )}
          </div>
        </div>
        {/* Show Continue button only if story is not finished AND we haven't exceeded max days */}
        {!story.finished && story.day_index <= story.max_days && (
          <button
            className="continue-btn"
            onClick={() => setShowModal(true)}
            disabled={loading || generating}
          >
            {generating ? "✨ Writing..." : "Continue Story →"}
          </button>
        )}
        {/* Show Generate Ending button if story is finished OR we've exceeded max days */}
        {(story.finished || story.day_index > story.max_days) && !ending && (
          <button
            className="ending-btn"
            onClick={handleGenerateEnding}
            disabled={generatingEnding}
          >
            {generatingEnding ? "✨ Crafting..." : "🏁 Generate Ending"}
          </button>
        )}
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Collapsible Insights Panel */}
      <div className={`insights-panel ${insightsOpen ? "open" : ""}`}>
        <button
          className="insights-toggle"
          onClick={() => setInsightsOpen(!insightsOpen)}
        >
          {insightsOpen ? "▼" : "▶"} Story Insights
          {dominantEnding && !insightsOpen && (
            <span className="trajectory-hint">
              Trending: {dominantEnding.type.replace("_", " ")}
            </span>
          )}
        </button>
        {insightsOpen && (
          <div className="insights-content">
            <div className="insight-section">
              <h3>📊 Ending Trajectory</h3>
              <p className="trajectory-description">
                Your choices are shaping how this story will end. The bars show
                which endings are most likely based on your journey so far.
              </p>
              <div className="ending-bars">
                {story.top2_endings.map(({ type, score }) => (
                  <div key={type} className="ending-bar-item">
                    <span className="ending-type">
                      {type.replace("_", " ")}
                    </span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.max(
                            5,
                            Math.min(100, (score + 10) * 5)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="score">
                      {score > 0 ? "+" : ""}
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="insight-section">
              <h3>📌 Open Threads</h3>
              <p className="threads-description">
                Story elements that haven't been resolved yet:
              </p>
              {story.open_threads.length > 0 ? (
                <ul className="threads-list">
                  {story.open_threads.map((thread, i) => (
                    <li key={i}>{thread}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-threads">No open threads</p>
              )}
            </div>
            <div className="insight-section">
              <h3>🎯 Full Ending Vector</h3>
              <div className="vector-grid">
                {Object.entries(story.ending_vector).map(([type, score]) => (
                  <div key={type} className="vector-item">
                    <span>{type.replace("_", " ")}</span>
                    <span
                      className={
                        score > 0 ? "positive" : score < 0 ? "negative" : ""
                      }
                    >
                      {score > 0 ? "+" : ""}
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="reader-content">
        {/* Chapter Sidebar */}
        <aside className="chapter-sidebar">
          <h3>Chapters</h3>
          <div className="chapter-list">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                className={`chapter-item ${
                  selectedChapter === chapter.day && !ending ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedChapter(chapter.day);
                }}
              >
                <span className="chapter-day">
                  {chapter.day === 0
                    ? "Prologue"
                    : chapter.chapter_title || `Day ${chapter.day}`}
                </span>
                <span
                  className="chapter-emotion"
                  style={{ color: EMOTION_COLORS[chapter.emotion] || "#666" }}
                >
                  {chapter.emotion !== "neutral" ? chapter.emotion : ""}
                </span>
              </button>
            ))}
            {/* Ending in sidebar */}
            {ending && (
              <button
                className={`chapter-item ending-item ${
                  selectedChapter === -1 ? "selected" : ""
                }`}
                onClick={() => setSelectedChapter(-1)}
              >
                <span className="chapter-day">🏁 {ending.title}</span>
                <span className="chapter-emotion ending-type">
                  {ending.ending_type.replace("_", " ")}
                </span>
              </button>
            )}
          </div>
        </aside>

        {/* Chapter Reader */}
        <main className="chapter-reader">
          {/* Show ending when selected */}
          {selectedChapter === -1 && ending ? (
            <div className="story-ending">
              <div className="chapter-header">
                <h2>🏁 {ending.title}</h2>
                <div className="chapter-meta">
                  <span className="ending-type-badge">
                    {ending.ending_type.replace("_", " ")}
                  </span>
                  <span className="word-count">{ending.word_count} words</span>
                </div>
              </div>
              <div className="chapter-text ending-text">{ending.text}</div>
              {ending.resolved_threads?.length > 0 && (
                <div className="chapter-summary resolved-threads">
                  <h4>Resolved Threads</h4>
                  <ul>
                    {ending.resolved_threads.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : currentChapter ? (
            <>
              <div className="chapter-header">
                <h2>
                  {currentChapter.day === 0
                    ? "Prologue"
                    : currentChapter.chapter_title ||
                      `Day ${currentChapter.day}`}
                </h2>
                {currentChapter.day > 0 && currentChapter.chapter_title && (
                  <span className="chapter-day-label">
                    Day {currentChapter.day}
                  </span>
                )}
                <div className="chapter-meta">
                  {currentChapter.emotion !== "neutral" && (
                    <span
                      className="emotion-tag"
                      style={{
                        backgroundColor:
                          EMOTION_COLORS[currentChapter.emotion] || "#666",
                      }}
                    >
                      {currentChapter.emotion}
                    </span>
                  )}
                  <span className="word-count">
                    {currentChapter.chapter_word_count} words
                  </span>
                </div>
              </div>
              <div className="chapter-text">{currentChapter.chapter_text}</div>
              <div className="chapter-summary">
                <h4>Summary</h4>
                <p>{currentChapter.chapter_summary}</p>
              </div>
            </>
          ) : (
            <div className="no-chapters">
              <p>No chapters yet.</p>
              <button onClick={() => setShowModal(true)}>
                Start Writing →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Continue Modal */}
      {showModal && (
        <ContinueModal
          onClose={() => setShowModal(false)}
          onContinue={handleContinue}
          currentDay={story.day_index}
          maxDays={story.max_days}
        />
      )}
    </div>
  );
}
