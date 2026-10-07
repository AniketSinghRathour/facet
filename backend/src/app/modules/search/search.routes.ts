import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { optionalAuth } from "../auth/auth.middleware.js";
import { searchBurstLimiter, searchWindowLimiter } from "../../common/middleware/rateLimiter.js";
import { searchSchema } from "./search.schema.js";
import * as searchController from "./search.controller.js";

/**
 * Search routes — attendee-facing, protected by Rekognition rate-limiting.
 *
 * Mounted at /api/search in app.ts.
 * Enforces:
 * - 2 searches per 1 minute (burst)
 * - 5 searches per 6 minutes (window)
 */
const router = Router();

/** POST /api/search — selfie search against an event's face collection */
router.post(
  "/",
  searchBurstLimiter,
  searchWindowLimiter,
  optionalAuth,
  validate(searchSchema, "body"),
  searchController.search,
);

export default router;
