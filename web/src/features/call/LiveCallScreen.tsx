import React, { useState, useEffect, useRef } from "react";
import type { CallUiProps, CallStatus } from "../../types/call.js";
import { getPersonaById } from "../persona/personasData.js";
import { ThreeAvatar3D } from "../../components/ThreeAvatar3D.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import { TimerDisplay } from "../../components/TimerDisplay.js";
import { CallControls } from "../../components/CallControls.js";
import { VoiceboxService } from "../../services/voice/VoiceboxService.js";
import { tokens } from "../../styles/tokens.js";

// Speech Recognition Type definition
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const LiveCallScreen: React.FC<CallUiProps> = ({
  personaId,
  personaName,
  onCallEnd,
  controller,
}) => {
  const persona = getPersonaById(personaId);

  // Internal call state
  const [internalStatus, setInternalStatus] = useState<CallStatus>("speaking");
  const [internalMuted, setInternalMuted] = useState<boolean>(false);
  const [internalSeconds, setInternalSeconds] = useState<number>(0);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [aiResponseText, setAiResponseText] = useState<string>("");

  const status =
    controller && controller.status !== "error" && controller.status !== "idle"
      ? controller.status
      : internalStatus;
  const muted = controller ? controller.muted : internalMuted;
  const elapsedSeconds = controller ? controller.elapsedSeconds : internalSeconds;
  const errorMessage = internalError;

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const latestTranscriptRef = useRef<string>("");
  const voiceProfileRef = useRef(
    persona.clonedVoice
      ? {
          fundamentalPitchHz: persona.clonedVoice.pitchEstimateHz || 135,
          pitchShiftFactor: (persona.clonedVoice.pitchEstimateHz || 135) / 160,
          audioDataUrl: persona.clonedVoice.audioBlobUrl,
        }
      : undefined
  );

  // Conversational response generator based on relation and user query
  const generatePersonaResponse = (userText: string): string => {
    const query = userText.toLowerCase();
    const isHindi = /kaise|kya|aap|namaste|pranam|dada|batao|kaho|theek|haal|meri|baat|sun/i.test(query);

    if (persona.id === "dadaji" || persona.name.toLowerCase().includes("dada")) {
      if (isHindi) {
        if (/kaise|haal|kya chal/i.test(query)) {
          return `Jeete raho beta! Main bilkul theek hoon. Tum batao, aaj tumhara din kaisa raha?`;
        }
        if (/dar|tension|chinta|stress|pareshan|problem/i.test(query)) {
          return `Beta, chinta mat karo. Mushkilein sabke jeevan me aati hain. Hamesha himmat aur vishwas rakho, sab theek hoga.`;
        }
        if (/kaha|kidhar|ghar/i.test(query)) {
          return `Main hamesha tumhare dil me aur tumhare sath hoon beta. Tum bas khush raho.`;
        }
        return `Haan beta, main tumhari har baat dhyan se sun raha hoon. Hamesha aage badhte raho, mera aashirwad tumhare sath hai.`;
      } else {
        if (/how are you|how do you do/i.test(query)) {
          return `Bless you, my child! I am doing wonderfully. How has your day been treating you?`;
        }
        if (/worried|stress|anxious|tired|help/i.test(query)) {
          return `Take a deep breath, my child. Remember that storms always pass. I am always right here by your side.`;
        }
        return `I hear you, my child. Always remember you are capable of overcoming whatever comes your way.`;
      }
    }

    if (isHindi) {
      return `Main hamesha aapke sath hoon. Mujhe sunkar bahut accha laga, aur bataiye!`;
    }
    return `I hear you completely. It's so good to talk to you. Tell me more!`;
  };

  // Speak dynamic AI dialogue with Voicebox synthesis
  const speakAiReply = (replyText: string) => {
    isSpeakingRef.current = true;
    latestTranscriptRef.current = "";
    setLiveTranscript("");
    setAiResponseText(replyText);
    setInternalStatus("speaking");

    // Pause recognition while companion is speaking
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    VoiceboxService.speakWithVoicebox(
      replyText,
      voiceProfileRef.current,
      () => {
        isSpeakingRef.current = true;
        setInternalStatus("speaking");
      },
      () => {
        isSpeakingRef.current = false;
        setInternalStatus("listening");
        // Resume listening for next user input
        setTimeout(() => {
          startListeningLoop();
        }, 300);
      }
    );
  };

  // Continuous speech recognition loop
  const startListeningLoop = () => {
    if (isSpeakingRef.current || muted) return;

    const win = window as unknown as IWindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setInternalStatus("listening");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Supports Hindi, Hinglish & English accents smoothly

      recognition.onstart = () => {
        if (!isSpeakingRef.current) {
          setInternalStatus("listening");
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i]?.[0]?.transcript || "";
        }

        if (transcript.trim()) {
          latestTranscriptRef.current = transcript.trim();
          setLiveTranscript(transcript.trim());
        }
      };

      recognition.onend = () => {
        if (isSpeakingRef.current) return;

        const capturedText = latestTranscriptRef.current.trim();
        if (capturedText) {
          latestTranscriptRef.current = "";
          setLiveTranscript("");
          setInternalStatus("thinking");

          setTimeout(() => {
            const aiReply = generatePersonaResponse(capturedText);
            speakAiReply(aiReply);
          }, 450);
        } else {
          // Keep listening loop active
          setTimeout(() => {
            if (!isSpeakingRef.current && !muted) {
              startListeningLoop();
            }
          }, 500);
        }
      };

      recognition.onerror = () => {
        setTimeout(() => {
          if (!isSpeakingRef.current && !muted) {
            startListeningLoop();
          }
        }, 800);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      // recognition fallback
    }
  };

  // Initial call start greeting
  useEffect(() => {
    const isDadaji = persona.id === "dadaji" || persona.name.toLowerCase().includes("dada");
    const greetingText = isDadaji
      ? `Jeete raho beta! Main Dada Ji hoon. Kaho, aaj tumhara din kaisa raha?`
      : `Hello! I am ${persona.name}. I am right here with you. How are you feeling today?`;

    const timer = setTimeout(() => {
      speakAiReply(greetingText);
    }, 450);

    return () => {
      clearTimeout(timer);
      isSpeakingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [persona.id]);

  // Timer interval for call duration
  useEffect(() => {
    if (status === "listening" || status === "thinking" || status === "speaking") {
      const interval = setInterval(() => {
        setInternalSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleToggleMute = () => {
    setInternalMuted((prev) => {
      const next = !prev;
      if (next) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // ignore
          }
        }
      } else {
        startListeningLoop();
      }
      return next;
    });
  };

  const handleEndCall = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setInternalStatus("ended");
    onCallEnd?.();
  };

  const handleRetry = () => {
    setInternalError(undefined);
    setInternalStatus("listening");
    startListeningLoop();
  };

  const handleQuickPrompt = (promptText: string) => {
    speakAiReply(generatePersonaResponse(promptText));
  };

  const getSubtitleByStatus = () => {
    switch (status) {
      case "connecting":
        return "Establishing secure voice call…";
      case "listening":
        return muted ? "Microphone is muted" : `Listening… Speak naturally to ${persona.name}`;
      case "thinking":
        return `${persona.name} is thinking & reflecting…`;
      case "speaking":
        return `${persona.name} is speaking…`;
      case "reconnecting":
        return "Re-establishing audio connection…";
      case "error":
        return "Connection interrupted";
      case "ended":
        return "Call finished";
      case "idle":
      default:
        return "Ready";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        flex: 1,
        padding: "42px 20px 28px",
        boxSizing: "border-box",
        justifyContent: "space-between",
      }}
    >
      {/* 1. Header with Persona Name & Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: tokens.colors.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {persona.name}
        </h2>

        <StatusBadge status={status} />
        <TimerDisplay seconds={elapsedSeconds} />
      </div>

      {/* 2. Central 3D Holographic Character Viewport */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          margin: "6px 0",
        }}
      >
        <ThreeAvatar3D
          photoUrl={persona.photoUrl}
          personaName={persona.name}
          size={300}
          isSpeaking={status === "speaking"}
          isListening={status === "listening"}
        />

        {/* Live Subtitle & Transcript Overlay Card */}
        <div
          style={{
            marginTop: "12px",
            width: "100%",
            maxWidth: "340px",
            minHeight: "44px",
            borderRadius: "20px",
            padding: "10px 16px",
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            border: "1px solid rgba(254, 240, 138, 0.6)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: status === "speaking" ? "#B45309" : tokens.colors.textPrimary,
              lineHeight: "18px",
              margin: 0,
            }}
          >
            {status === "speaking" && aiResponseText
              ? `"${aiResponseText}"`
              : liveTranscript
              ? `You: "${liveTranscript}"`
              : getSubtitleByStatus()}
          </p>
        </div>

        {/* Quick Suggestion Chips for Instant Tap Conversation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "340px",
          }}
        >
          {["Dada ji kaise ho?", "Mujhe thoda tension hai", "How are you doing?"].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(chip)}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#78350F",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
              }}
            >
              💬 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Call Controls (Mute & End Call) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <CallControls
          status={status}
          muted={muted}
          onToggleMute={handleToggleMute}
          onEndCall={handleEndCall}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};
