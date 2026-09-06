import express from "express";
import type { Express } from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";
import eventRouter from "./modules/events/event.routes.js";
import photoRouter from "./modules/photos/photo.routes.js";
import searchRouter from "./modules/search/search.routes.js";

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

  // ── 6. Domain module routers ──
  app.use("/api/events", eventRouter);
  app.use("/api/photos", photoRouter);
  app.use("/api/search", searchRouter);

  // ── 7. Error handler ──
  app.use(errorHandler);

  return app;
}
