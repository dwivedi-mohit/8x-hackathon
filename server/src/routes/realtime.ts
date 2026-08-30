import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { personaIds, personaSessions, type PersonaId } from "../config/personas.js";

const requestSchema = z.object({
  personaId: z.string().trim().min(1),
  sdp: z.string().trim().min(1).max(200_000),
});

const model = process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime";

export const realtimeRouter = Router();

realtimeRouter.post("/calls", async (request: Request, response: Response) => {
  const parsed = requestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: "Invalid call request." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not configured.");
    response.status(503).json({ error: "Voice calls are not configured yet." });
    return;
  }

  const { personaId, sdp } = parsed.data;
  const session = createSession(personaId);
  const form = new FormData();
  form.append("sdp", new Blob([sdp], { type: "application/sdp" }), "offer.sdp");
  form.append("session", new Blob([JSON.stringify(session)], { type: "application/json" }), "session.json");

  try {
    const upstream = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    const answerSdp = await upstream.text();

    if (!upstream.ok) {
      console.error("Realtime call creation failed.", { status: upstream.status });
      response.status(502).json({ error: "Unable to start the voice call. Please try again." });
      return;
    }

    response.status(201).json({ sdp: answerSdp });
  } catch (error) {
    console.error("Realtime call request failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    response.status(502).json({ error: "Unable to reach the voice service. Please try again." });
  }
});

function createSession(personaId: string) {
  const persona = personaSessions[personaId as PersonaId];
  if (persona) {
    return {
      type: "realtime",
      model,
      instructions: `${persona.instructions}\n\nThe user selected ${persona.displayName}.`,
    };
  }

  // Custom 3D Persona Session
  const cleanName = personaId.replace(/^custom_/, "").replace(/_[0-9]+$/, "").replace(/_/g, " ");
  return {
    type: "realtime",
    model,
    instructions: `You are ${cleanName || "a warm companion"}, a thoughtful, caring, and loving AI companion in a live voice call. Speak naturally, warmly, attentively, and concisely as a true trusted companion.`,
  };
}
