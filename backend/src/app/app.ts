import express from "express";
import type { Express } from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";

import { errorHandler } from "./common/middleware/errorHandler.js";

/**
 * Creates and configures the Express application.
 */

export function createApplication(): Express {
  const app = express();

  // ── 1. CORS ──
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // ── 2. Auth routes — mounted BEFORE json parser ──
  // Better-Auth manages its own body parsing; pre-parsed bodies
  // cause 404s or hung requests.
  app.use("/api/auth", authRouter);

  // ── 4. Global JSON body parser for all remaining routes ──
  app.use(express.json({ limit: "50mb" }));

  // ── 5. Health check & Welcome route ──
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to Facet Backend Service" });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ── 7. Error handler ──
  app.use(errorHandler);

  return app;
}
