import express from "express";
import type { Express } from "express";
import cors from "cors";

import { errorHandler } from "./common/middleware/errorHandler.js";

/**
 * Creates and configures the Express application (§8).
 */

export function createApplication(): Express {
  const app = express();

  // ── 1. CORS ──
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // ── 4. Global JSON body parser for all remaining routes ──
  app.use(express.json({ limit: "50mb" }));

  // ── 5. Health check & Welcome route ──
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to GP2 Backend Service" });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ── 7. Error handler ──
  app.use(errorHandler);

  return app;
}
