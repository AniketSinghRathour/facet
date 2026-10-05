import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address (e.g., name@example.com)."),
  message: z.string().trim().min(5, "Message must be at least 5 characters long."),
});

export type ContactInput = z.infer<typeof contactSchema>;
