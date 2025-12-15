import { useState, useEffect } from "react";
import * as api from "./api";
import { Landing } from "./components/Landing";
import { StoryReader } from "./components/StoryReader";
import "./App.css";

type View = "landing" | "reader";

function App() {
  const [view, setView] = useState<View>("landing");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [switchToDemos, setSwitchToDemos] = useState(false);

  // Check server connectivity on mount (silent)
  useEffect(() => {
    api.healthCheck().catch(() => {
      console.warn("Server not reachable");
    });
  }, []);

  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setView("reader");
  };

  // Switch to demo stories tab instead of creating a story
  const handleCreateStory = () => {
    setSwitchToDemos(true);
  };

  const handleBack = () => {
    setView("landing");
    setSelectedStoryId(null);
  };

  return (
    <div className="app">
      {view === "landing" && (
        <Landing
          onSelectStory={handleSelectStory}
          onCreateStory={handleCreateStory}
          switchToDemos={switchToDemos}
          onSwitchToDemosHandled={() => setSwitchToDemos(false)}
        />
      )}

      {view === "reader" && selectedStoryId && (
        <StoryReader storyId={selectedStoryId} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
