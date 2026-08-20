import { z } from "zod";

/**
 * Zod schema for all environment variables.
 * Parsed once at import time.
 */
const envSchema = z.object({
  PORT: z.string().optional().default("8080"),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  GMAIL_USER: z.string().min(1),
  GMAIL_APP_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
});

/**
 * Validated environment
 */
export const env = envSchema.parse(process.env);
