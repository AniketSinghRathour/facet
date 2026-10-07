import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import {
  authSignUpLimiter,
  authSignInLimiter,
} from "../../common/middleware/rateLimiter.js";
import { auth } from "./auth.config.js";

/**
 * Auth routes — delegates to Better-Auth's built-in handler.
 *
 * Specific endpoints are protected by rate limiters:
 * - POST /sign-up: max 4 accounts per hour per IP.
 * - POST /sign-in: max 10 attempts per 15 minutes per IP.
 * (Verification email requests are rate-limited per user ID/account in auth.config.ts)
 *
 * Express 5 requires `/*splat` for catch-all routes.
 */
const router = Router();

// Apply rate limits to sensitive auth entry points
router.post(["/sign-up", "/sign-up/*splat"], authSignUpLimiter);
router.post(["/sign-in", "/sign-in/*splat"], authSignInLimiter);

router.all("/*splat", toNodeHandler(auth));

export default router;
