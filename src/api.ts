/**
 * API client for StoryFlow backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
export interface CreateStoryRequest {
  quick?: boolean;
  title?: string;
  protagonist?: string;
  total_days?: number;
}

export interface CreateStoryResponse {
  story_id: string;
  title: string;
  day_index: number;
  max_days: number;
  protagonist?: string;
  characters: string[];
  threads: string[];
}

export interface EndingScore {
  type: string;
  score: number;
}

export interface StoryStatus {
  story_id: string;
  title: string;
  day_index: number;
  max_days: number;
  finished: boolean;
  last_emotion?: string;
  top2_endings: EndingScore[];
  ending_vector: Record<string, number>;
  open_threads: string[];
  chapters_count: number;
}

export interface StoryListItem {
  story_id: string;
  title: string;
  day_index: number;
  max_days: number;
  finished: boolean;
  last_emotion?: string;
  top_ending?: string;
  ending_drift: number;
  created_at?: string;
  updated_at?: string;
}

export interface StoryListResponse {
  stories: StoryListItem[];
  total: number;
}

export interface RunDayRequest {
  emotion: string;
  recap?: "on" | "off";
  seed?: number | null;
}

export interface BeatUsed {
  position?: number;
  beat_type?: string;
  description?: string;
}

export interface RunDayResponse {
  story_id: string;
  day_generated: number;
  emotion: string;
  recap?: string;
  chapter_text: string;
  chapter_word_count: number;
  chapter_summary: string;
  ending_vector: Record<string, number>;
  beat_used?: BeatUsed;
  evaluation: Record<string, unknown>;
  ending?: Record<string, unknown>;
  story_complete: boolean;
  seed_used?: number;
}

export interface Chapter {
  id: string;
  story_id: string;
  day: number;
  emotion: string;
  chapter_type: string; // prologue, day, ending
  seed?: number;
  chapter_title?: string; // Evocative AI-generated title
  chapter_text: string;
  chapter_summary: string;
  chapter_word_count: number;
  beat_used?: Record<string, unknown>;
  ending?: Record<string, unknown>;
  evaluation?: Record<string, unknown>;
  created_at?: string;
}

export interface ChapterListResponse {
  chapters: Chapter[];
  total: number;
}

export interface Emotion {
  name: string;
  tone_tags: string[];
  risk_bias: string;
  ending_drift: Record<string, number>;
}

export interface EmotionListResponse {
  emotions: Emotion[];
}

export interface EndingResponse {
  ending_type: string;
  title: string;
  text: string;
  word_count: number;
  resolved_threads: string[];
  unresolved_threads: string[];
}

// API functions
export async function healthCheck(): Promise<{ ok: boolean }> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) throw new Error("Health check failed");
  return response.json();
}

export async function createStory(
  request: CreateStoryRequest = { quick: true }
): Promise<CreateStoryResponse> {
  const response = await fetch(`${BASE_URL}/api/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create story");
  }
  return response.json();
}

export async function listStories(limit = 50): Promise<StoryListResponse> {
  const response = await fetch(`${BASE_URL}/api/stories?limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to list stories");
  }
  return response.json();
}

export async function getStory(storyId: string): Promise<StoryStatus> {
  const response = await fetch(`${BASE_URL}/api/stories/${storyId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get story");
  }
  return response.json();
}

export async function runDay(
  storyId: string,
  request: RunDayRequest
): Promise<RunDayResponse> {
  const response = await fetch(`${BASE_URL}/api/stories/${storyId}/day`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to run day");
  }
  return response.json();
}

export async function listChapters(
  storyId: string
): Promise<ChapterListResponse> {
  const response = await fetch(`${BASE_URL}/api/stories/${storyId}/chapters`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to list chapters");
  }
  return response.json();
}

export async function getEmotions(): Promise<EmotionListResponse> {
  const response = await fetch(`${BASE_URL}/api/emotions`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get emotions");
  }
  return response.json();
}

export async function generateEnding(storyId: string): Promise<EndingResponse> {
  const response = await fetch(`${BASE_URL}/api/stories/${storyId}/ending`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate ending");
  }
  return response.json();
}

export async function deleteStory(storyId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/stories/${storyId}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete story");
  }
}

// Demo Stories
export interface DemoStory {
  id: string;
  title: string;
  protagonist: string;
  genre: string;
  description: string;
}

export interface DemoStoriesResponse {
  demos: DemoStory[];
}

export async function listDemoStories(): Promise<DemoStoriesResponse> {
  const response = await fetch(`${BASE_URL}/api/demos`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to list demo stories");
  }
  return response.json();
}

export async function createStoryFromDemo(
  demoId: string,
  totalDays: number = 7
): Promise<CreateStoryResponse> {
  const response = await fetch(`${BASE_URL}/api/demos/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ demo_id: demoId, total_days: totalDays }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create story from demo");
  }
  return response.json();
}
