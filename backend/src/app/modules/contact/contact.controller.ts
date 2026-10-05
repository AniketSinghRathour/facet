import type { Request, Response } from "express";
import { env } from "../../common/config/env.js";
import { sendEmail } from "../../common/config/mailer.js";
import type { ContactInput } from "./contact.schema.js";

/**
 * Handles incoming contact form inquiries from photographers, devs, partners, and visitors.
 * Sends the inquiry to the admin inbox (GMAIL_USER) and a confirmation to the sender.
 */
export async function submitContact(req: Request, res: Response): Promise<void> {
  const { name, email, message } = req.body as ContactInput;

  // 1. Send notification to site owner/admin
  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #09090b; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
      <div style="border-bottom: 1px solid #27272a; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #a1a1aa; font-weight: 600;">Facet Inquiries</span>
        <h2 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 500; color: #ffffff;">New Contact Form Submission</h2>
      </div>

      <div style="margin-bottom: 16px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">From</p>
        <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">${name} &lt;<a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a>&gt;</p>
      </div>

      <div style="margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
        <div style="background: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #e4e4e7;">${message}</div>
      </div>

      <div style="font-size: 12px; color: #52525b; border-top: 1px solid #27272a; padding-top: 16px;">
        Submitted at ${new Date().toUTCString()} &bull; Reply directly to this email to contact ${name}.
      </div>
    </div>
  `;

  await sendEmail({
    to: env.GMAIL_USER,
    replyTo: email,
    subject: `[Facet Contact] New inquiry from ${name}`,
    html: adminHtml,
  });

  // 2. Send friendly confirmation to the person who contacted
  const confirmationHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #18181b; border-radius: 12px; border: 1px solid #e4e4e7;">
      <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600; color: #09090b;">Thanks for reaching out, ${name}!</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #3f3f46; margin: 0 0 20px 0;">
        We've received your message. Whether you're a photographer exploring Facet, a developer building integrations, or just saying hello, we appreciate your interest and will get back to you shortly.
      </p>

      <div style="background: #fafafa; padding: 16px; border-radius: 8px; border: 1px solid #f4f4f5; margin-bottom: 24px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Your Message</p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #52525b; white-space: pre-wrap;">${message}</p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #71717a;">
        Best regards,<br />
        <strong>The Facet Team</strong>
      </p>
    </div>
  `;

  // We send confirmation asynchronously so user doesn't wait
  sendEmail({
    to: email,
    subject: "We received your message — Facet",
    html: confirmationHtml,
  }).catch((err) => {
    console.error("[Contact] Failed to send confirmation email:", err);
  });

  res.status(200).json({
    success: true,
    message: "Thank you! Your message has been received.",
  });
}
