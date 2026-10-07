import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { contactHourlyLimiter, contactDailyLimiter } from "../../common/middleware/rateLimiter.js";
import { contactSchema } from "./contact.schema.js";
import * as contactController from "./contact.controller.js";

const router = Router();

/**
 * POST /api/contact — public contact form submission.
 * Enforces:
 * - 4 submissions per 1 hour
 * - 7 submissions per 24 hours
 */
router.post(
  "/",
  contactHourlyLimiter,
  contactDailyLimiter,
  validate(contactSchema, "body"),
  contactController.submitContact,
);

export default router;
