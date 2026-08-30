import "dotenv/config";
import cors from "cors";
import express from "express";
import { createRateLimiter } from "./middleware/rate-limit.js";
import { realtimeRouter } from "./routes/realtime.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10);

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "220kb" }));

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use(
  "/api/realtime",
  createRateLimiter({
    windowMs: Number.isFinite(rateLimitWindowMs) ? rateLimitWindowMs : 60_000,
    maxRequests: Number.isFinite(rateLimitMaxRequests) ? rateLimitMaxRequests : 10,
  }),
  realtimeRouter,
);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "Invalid JSON request body." });
    return;
  }

  console.error("Unhandled server error.", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  response.status(500).json({ error: "Unexpected server error." });
});

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.listen(port, () => {
  console.info(`Echo server listening on port ${port}.`);
});
