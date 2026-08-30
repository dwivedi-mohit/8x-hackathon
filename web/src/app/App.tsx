import React, { useState } from "react";
import type { PersonaId, AppScreen } from "../types/index.js";
import { MobileContainer } from "../components/MobileContainer.js";
import { BottomNavigation } from "../components/BottomNavigation.js";
import { HomeScreen } from "../features/home/HomeScreen.js";
import { PersonaDetailScreen } from "../features/detail/PersonaDetailScreen.js";
import { LiveCallScreen } from "../features/call/LiveCallScreen.js";
import { EndedCallScreen } from "../features/ended/EndedCallScreen.js";
import { CreatePersonaScreen } from "../features/create/CreatePersonaScreen.js";
import { CallHistoryScreen } from "../features/history/CallHistoryScreen.js";
import { getPersonaById } from "../features/persona/personasData.js";
import { useRealtimeCall } from "../hooks/useRealtimeCall.js";
import "../styles/theme.css";

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home");
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>("maya");
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [lastCall, setLastCall] = useState<{ personaId: PersonaId; durationSeconds: number }>();
  const callController = useRealtimeCall();
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true";

  // Navigation handlers
  const handleSelectPersona = (id: PersonaId) => {
    setSelectedPersonaId(id);
    setCurrentScreen("persona-detail");
  };

  const handleStartCall = (id: PersonaId) => {
    setSelectedPersonaId(id);
    setCallDurationSeconds(0);
    setCurrentScreen("call");
    if (!demoMode) {
      void callController.connect(id);
    }
  };

  const handleCallEnded = () => {
    // Transition to ended screen
    setCallDurationSeconds(callController.elapsedSeconds);
    const durationSeconds = callController.elapsedSeconds;
    setCallDurationSeconds(durationSeconds);
    setLastCall({ personaId: selectedPersonaId, durationSeconds });
    setCurrentScreen("ended");
  };

  const handleGoHome = () => {
    setCurrentScreen("home");
  };

  const handleCreatePersona = () => {
    setCurrentScreen("create-persona");
  };

  const dockActive = currentScreen === "create-persona" ? "create" : currentScreen === "call-history" ? "history" : "home";
  const showBottomNavigation = currentScreen !== "call";

  const selectedPersona = getPersonaById(selectedPersonaId);

  return (
    <MobileContainer
      bottomNavigation={showBottomNavigation ? (
        <BottomNavigation
          active={dockActive}
          onHome={handleGoHome}
          onCreate={handleCreatePersona}
          onHistory={() => setCurrentScreen("call-history")}
        />
      ) : undefined}
    >
      {currentScreen === "home" && (
        <HomeScreen
          onSelectPersona={handleSelectPersona}
          onQuickCall={handleStartCall}
          onCreatePersona={handleCreatePersona}
        />
      )}

      {currentScreen === "persona-detail" && (
        <PersonaDetailScreen
          personaId={selectedPersonaId}
          onBack={handleGoHome}
          onStartCall={handleStartCall}
        />
      )}

      {currentScreen === "call" && (
        <LiveCallScreen
          personaId={selectedPersonaId}
          personaName={selectedPersona.name}
          onCallEnd={handleCallEnded}
          controller={demoMode ? undefined : callController}
        />
      )}

      {currentScreen === "ended" && (
        <EndedCallScreen
          personaId={selectedPersonaId}
          durationSeconds={callDurationSeconds}
          onCallAgain={handleStartCall}
          onChooseAnother={handleGoHome}
          onGoHome={handleGoHome}
        />
      )}

      {currentScreen === "create-persona" && (
        <CreatePersonaScreen
          onBack={handleGoHome}
          onCreated={handleGoHome}
        />
      )}

      {currentScreen === "call-history" && <CallHistoryScreen lastCall={lastCall} />}
    </MobileContainer>
  );
};

export default App;
