import React, { useState } from "react";
import type { PersonaId, AppScreen } from "../types/index.js";
import { MobileContainer } from "../components/MobileContainer.js";
import { HomeScreen } from "../features/home/HomeScreen.js";
import { PersonaDetailScreen } from "../features/detail/PersonaDetailScreen.js";
import { LiveCallScreen } from "../features/call/LiveCallScreen.js";
import { EndedCallScreen } from "../features/ended/EndedCallScreen.js";
import { CreatePersonaScreen } from "../features/create/CreatePersonaScreen.js";
import { getPersonaById } from "../features/persona/personasData.js";
import "../styles/theme.css";

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home");
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>("maya");
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);

  // Navigation handlers
  const handleSelectPersona = (id: PersonaId) => {
    setSelectedPersonaId(id);
    setCurrentScreen("persona-detail");
  };

  const handleStartCall = (id: PersonaId) => {
    setSelectedPersonaId(id);
    setCallDurationSeconds(0);
    setCurrentScreen("call");
  };

  const handleCallEnded = () => {
    // Transition to ended screen
    setCallDurationSeconds(Math.floor(Math.random() * 45) + 30); // reasonable duration for demo
    setCurrentScreen("ended");
  };

  const handleGoHome = () => {
    setCurrentScreen("home");
  };

  const handleCreatePersona = () => {
    setCurrentScreen("create-persona");
  };

  const selectedPersona = getPersonaById(selectedPersonaId);

  return (
    <MobileContainer>
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
    </MobileContainer>
  );
};

export default App;
