import express from "express";
import type { Express } from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";
import eventRouter from "./modules/events/event.routes.js";
import photoRouter from "./modules/photos/photo.routes.js";
import searchRouter from "./modules/search/search.routes.js";
import webhookRouter from "./modules/webhooks/webhook.routes.js";
import contactRouter from "./modules/contact/contact.routes.js";

import { errorHandler } from "./common/middleware/errorHandler.js";

/**
 * Creates and configures the Express application.
 */

export function createApplication(): Express {
  const app = express();

  // ── 0. Proxy configuration ──
  // Trust first hop reverse proxy (Cloudflare, AWS ALB, Nginx, Render, etc.)
  // so that req.ip and express-rate-limit correctly identify client IPs.
  app.set("trust proxy", 1);

  // ── 1. CORS ──
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // ── 2. Auth routes — mounted BEFORE json parser ──
  // Better-Auth manages its own body parsing; pre-parsed bodies
  // cause 404s or hung requests.
  app.use("/api/auth", authRouter);

  // ── 3. Webhooks — mounted BEFORE json parser ──
  // Webhooks need the raw body for signature verification.
  app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter);

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
  app.use("/api/contact", contactRouter);

  // ── 7. Error handler ──
  app.use(errorHandler);

  return app;
}
