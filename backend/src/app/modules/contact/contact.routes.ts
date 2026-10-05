import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import { contactSchema } from "./contact.schema.js";
import * as contactController from "./contact.controller.js";

const router = Router();

/**
 * POST /api/contact — public contact form submission
 */
router.post(
  "/",
  validate(contactSchema, "body"),
  contactController.submitContact,
);

export default router;
