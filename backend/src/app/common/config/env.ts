import { z } from "zod";

/**
 * Zod schema for all environment variables.
 * Parsed once at import time.
 */
const envSchema = z.object({
  PORT: z.string().optional().default("8080"),
});

/**
 * Validated environment
 */
export const env = envSchema.parse(process.env);
