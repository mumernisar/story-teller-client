/**
 * Landing Page Component - Shows story cards grid and demo stories
 */

import { useState, useEffect } from "react";
import * as api from "../api";
import type { StoryListItem, DemoStory } from "../api";
import "./Landing.css";

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

// Genre colors/icons
const GENRE_STYLES: Record<string, { color: string; icon: string }> = {
  "Dark Fantasy": { color: "#8B0000", icon: "⚔️" },
  "Science Fiction": { color: "#1E90FF", icon: "🚀" },
  "Neo-Noir Mystery": { color: "#2F4F4F", icon: "🔍" },
  "Fantasy Adventure": { color: "#228B22", icon: "🏰" },
  "Post-Apocalyptic": { color: "#696969", icon: "🌆" },
};

interface LandingProps {
  onSelectStory: (storyId: string) => void;
  onCreateStory: () => void;
  switchToDemos?: boolean;
  onSwitchToDemosHandled?: () => void;
}

export function Landing({
  onSelectStory,
  onCreateStory,
  switchToDemos,
  onSwitchToDemosHandled,
}: LandingProps) {
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [demos, setDemos] = useState<DemoStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creatingFromDemo, setCreatingFromDemo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stories" | "demos">("stories");

  // Handle switchToDemos prop
  useEffect(() => {
    if (switchToDemos) {
      setActiveTab("demos");
      onSwitchToDemosHandled?.();
    }
  }, [switchToDemos, onSwitchToDemosHandled]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [storiesRes, demosRes] = await Promise.all([
        api.listStories(),
        api.listDemoStories(),
      ]);
      setStories(storiesRes.stories);
      setDemos(demosRes.demos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this story? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      setDeletingId(storyId);
      await api.deleteStory(storyId);
      setStories(stories.filter((s) => s.story_id !== storyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete story");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartDemo = async (demoId: string) => {
    try {
      setCreatingFromDemo(demoId);
      const result = await api.createStoryFromDemo(demoId, 7);
      onSelectStory(result.story_id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start demo story"
      );
      setCreatingFromDemo(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressPercent = (day: number, max: number) => {
    return Math.round((day / max) * 100);
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <h1>📖 StoryFlow</h1>
        <p className="tagline">Interactive Narrative Generation</p>
        <button className="create-btn" onClick={onCreateStory}>
          ✨ Start New Story
        </button>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "stories" ? "active" : ""}`}
          onClick={() => setActiveTab("stories")}
        >
          📚 Your Stories ({stories.length})
        </button>
        <button
          className={`tab ${activeTab === "demos" ? "active" : ""}`}
          onClick={() => setActiveTab("demos")}
        >
          🎭 Demo Stories ({demos.length})
        </button>
      </div>

      {/* Your Stories Tab */}
      {activeTab === "stories" && (
        <section className="stories-section">
          <div className="section-header">
            <h2>Your Stories</h2>
            <button
              className="refresh-btn"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "⏳" : "🔄"} Refresh
            </button>
          </div>

          {loading && stories.length === 0 ? (
            <div className="loading">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="empty-state">
              <p>No stories yet.</p>
              <p>Click "Start New Story" or try a Demo Story to begin!</p>
            </div>
          ) : (
            <div className="stories-grid">
              {stories.map((story) => (
                <div
                  key={story.story_id}
                  className={`story-card ${story.finished ? "finished" : ""}`}
                  onClick={() => onSelectStory(story.story_id)}
                >
                  <div className="card-header">
                    <h3 className="story-title">{story.title}</h3>
                    {story.finished && (
                      <span className="finished-badge">✓ Complete</span>
                    )}
                  </div>

                  <div className="progress-section">
                    <div className="progress-label">
                      {story.finished
                        ? `Complete (${story.max_days} days)`
                        : `Day ${Math.max(0, story.day_index - 1)} / ${
                            story.max_days
                          }`}
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${getProgressPercent(
                            Math.min(story.day_index - 1, story.max_days),
                            story.max_days
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="card-meta">
                    {story.last_emotion && (
                      <span
                        className="emotion-chip"
                        style={{
                          backgroundColor:
                            EMOTION_COLORS[story.last_emotion] || "#666",
                        }}
                      >
                        {story.last_emotion}
                      </span>
                    )}
                    {story.top_ending && (
                      <span className="ending-chip">→ {story.top_ending}</span>
                    )}
                  </div>

                  <div className="card-footer">
                    <span
                      className="drift-indicator"
                      title="Total ending drift"
                    >
                      📊 {story.ending_drift}
                    </span>
                    <span className="timestamp">
                      {formatDate(story.updated_at)}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteStory(e, story.story_id)}
                      disabled={deletingId === story.story_id}
                      title="Delete story"
                    >
                      {deletingId === story.story_id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Demo Stories Tab */}
      {activeTab === "demos" && (
        <section className="demos-section">
          <div className="section-header">
            <h2>Demo Stories</h2>
            <p className="section-subtitle">
              Start with a pre-written prologue and rich world setup
            </p>
          </div>

          {loading ? (
            <div className="loading">Loading demos...</div>
          ) : demos.length === 0 ? (
            <div className="empty-state">
              <p>No demo stories available.</p>
            </div>
          ) : (
            <div className="demos-grid">
              {demos.map((demo) => {
                const style = GENRE_STYLES[demo.genre] || {
                  color: "#666",
                  icon: "📖",
                };
                return (
                  <div
                    key={demo.id}
                    className="demo-card"
                    style={{ borderColor: style.color }}
                  >
                    <div className="demo-header">
                      <span className="genre-icon">{style.icon}</span>
                      <span
                        className="genre-badge"
                        style={{ backgroundColor: style.color }}
                      >
                        {demo.genre}
                      </span>
                    </div>

                    <h3 className="demo-title">{demo.title}</h3>
                    <p className="demo-protagonist">
                      Protagonist: <strong>{demo.protagonist}</strong>
                    </p>
                    <p className="demo-description">{demo.description}</p>

                    <button
                      className="start-demo-btn"
                      onClick={() => handleStartDemo(demo.id)}
                      disabled={creatingFromDemo === demo.id}
                      style={{ backgroundColor: style.color }}
                    >
                      {creatingFromDemo === demo.id
                        ? "✨ Creating..."
                        : `${style.icon} Begin This Story`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
