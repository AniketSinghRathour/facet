import type { Request, Response, NextFunction } from "express";
import { rateLimit, type Options } from "express-rate-limit";

/**
 * Standard handler for 429 Too Many Requests responses.
 * Formats errors to match the project's ApiError shape:
 * { success: false, message: string, errors: string[] }
 */
function createRateLimitHandler(message: string) {
  return (_req: Request, res: Response, _next: NextFunction, options: Options): void => {
    res.status(options.statusCode).json({
      success: false,
      message,
      errors: [message],
    });
  };
}

/**
 * Attendee Search Limiters:
 * Protects AWS Rekognition against automated scraping and looping.
 * 1. Burst: 2 searches per 1 minute.
 * 2. Window: 5 searches per 6 minutes.
 */
export const searchBurstLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Search rate limit reached. On the free tier, attendee selfie search is limited to 2 searches per minute. Please wait a moment before trying again, or reach out via our Contact page for higher capacity.",
  ),
});

export const searchWindowLimiter = rateLimit({
  windowMs: 6 * 60 * 1000, // 6 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Search limit reached. On the free tier, attendee selfie search is limited to 5 searches per 6 minutes. Please wait a few minutes before trying again, or reach out via our Contact page for higher capacity.",
  ),
});

/**
 * Contact Us Limiters:
 * Protects Gmail SMTP daily quota against spam bots.
 * 1. Hourly: 4 submissions per 1 hour.
 * 2. Daily: 7 submissions per 24 hours.
 */
export const contactHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "You have submitted multiple messages recently (maximum 4 per hour). Please wait before sending another inquiry.",
  ),
});

export const contactDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 7,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Daily contact limit reached (maximum 7 submissions per 24 hours). If your inquiry is urgent, please try again tomorrow or contact us directly.",
  ),
});

/**
 * Auth Sign-Up Limiter:
 * Free tier limit of 4 account creations per hour per IP.
 */
export const authSignUpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many accounts created from this network. Free tier registration is limited to 4 accounts per hour. Please try again later or reach out via our Contact page if you need assistance.",
  ),
});

/**
 * Auth Sign-In Limiter:
 * Security defense against brute force and credential stuffing: 10 attempts per 15 minutes.
 */
export const authSignInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many sign-in attempts. For your account security, please wait 15 minutes before trying again.",
  ),
});

/**
 * Per-Account Email Verification Limiter:
 * Limit of 5 verification emails per hour per user ID/account to protect SMTP quota.
 */
const accountEmailVerificationStore = new Map<string, number[]>();

export function checkAccountEmailVerificationLimit(accountId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 5;

  // Periodic cleanup of expired entries to prevent memory leaks
  if (accountEmailVerificationStore.size > 1000) {
    for (const [key, times] of accountEmailVerificationStore.entries()) {
      if (times.every((t) => now - t >= windowMs)) {
        accountEmailVerificationStore.delete(key);
      }
    }
  }

  const timestamps = (accountEmailVerificationStore.get(accountId) || []).filter(
    (t) => now - t < windowMs,
  );

  if (timestamps.length >= max) {
    return false;
  }

  timestamps.push(now);
  accountEmailVerificationStore.set(accountId, timestamps);
  return true;
}

/**
 * Public API Limiter:
 * General scraper defense for public gallery and status viewing: 60 requests per minute.
 */
export const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Too many requests from your IP. Please slow down and try again shortly.",
  ),
});

/**
 * Photo Download Limiter:
 * High-capacity limiter for photo downloads: 250 requests per minute.
 */
export const photoDownloadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "Download rate limit reached (maximum 250 requests per minute). Please wait a moment before downloading more photos.",
  ),
});
