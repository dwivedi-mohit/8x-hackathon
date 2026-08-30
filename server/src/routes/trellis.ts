import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { TrellisService } from "../services/trellis.js";

export const trellisRouter = Router();

const generateRequestSchema = z.object({
  modelName: z.string().trim().min(1).default("3D Companion"),
  imageBase64: z.string().min(10),
});

/**
 * POST /api/3d/generate-trellis
 * Generates a 3D asset using Microsoft TRELLIS 3D Generation.
 */
trellisRouter.post("/generate-trellis", async (req: Request, res: Response) => {
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid image data for 3D generation." });
    return;
  }

  try {
    const { imageBase64, modelName } = parsed.data;
    const result = await TrellisService.generate3DModel(imageBase64, modelName);
    res.status(201).json(result);
  } catch (error) {
    console.error("TRELLIS generation failed:", error);
    res.status(500).json({ error: "Failed to generate 3D model with TRELLIS." });
  }
});
