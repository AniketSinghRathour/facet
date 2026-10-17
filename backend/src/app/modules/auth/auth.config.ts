import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../common/config/prisma.js";
import { env } from "../../common/config/env.js";
import { sendEmail } from "../../common/config/mailer.js";
import { checkAccountEmailVerificationLimit } from "../../common/middleware/rateLimiter.js";

/**
 * Better-Auth instance — the single source of auth configuration.
 *
 * Providers: email/password + Google OAuth.
 * Database: Prisma adapter pointing at Postgres.
 *
 * This file must be exported as `auth` for the Better-Auth CLI
 * to discover it during schema generation.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    ...new Set([
      "http://localhost:3000",
      "http://localhost:8080",
      ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL.replace(/\/$/, "")] : []),
      ...(env.FRONTEND_URL ? env.FRONTEND_URL.split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean) : []),
    ]),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Free-tier limit: 5 verification emails per hour per id/account
      const accountIdentifier = user.id || user.email;
      if (!checkAccountEmailVerificationLimit(accountIdentifier)) {
        throw new Error(
          "Too many verification email requests for this account. Maximum 5 per hour. Please check your inbox or wait before requesting another link."
        );
      }

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #18181b; border-radius: 16px; border: 1px solid #e4e4e7;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #71717a;">FACET</span>
          </div>
          
          <h1 style="font-size: 24px; font-weight: 600; color: #09090b; margin: 0 0 12px 0; letter-spacing: -0.02em;">
            Verify your email address
          </h1>
          
          <p style="font-size: 15px; line-height: 1.6; color: #52525b; margin: 0 0 28px 0;">
            Hi ${user.name || "there"}, welcome to Facet. Please confirm your email address by clicking the button below to activate your account and access your dashboard.
          </p>
          
          <div style="margin-bottom: 32px;">
            <a href="${url}" style="display: inline-block; background: #09090b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Verify Email Address &rarr;
            </a>
          </div>
          
          <div style="border-top: 1px solid #f4f4f5; padding-top: 20px; margin-top: 24px;">
            <p style="font-size: 12px; color: #a1a1aa; line-height: 1.5; margin: 0 0 8px 0;">
              If the button doesn't work, copy and paste this URL into your browser:
            </p>
            <p style="font-size: 12px; color: #71717a; word-break: break-all; margin: 0;">
              <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
            </p>
          </div>
          
          <div style="font-size: 11px; color: #a1a1aa; margin-top: 24px;">
            If you did not sign up for Facet, you can safely ignore this email.
          </div>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "Verify your email address — Facet",
        html: emailHtml,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
