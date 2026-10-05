"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export function Footer() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = formState.name.trim();
    const trimmedEmail = formState.email.trim();
    const trimmedMessage = formState.message.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!trimmedMessage || trimmedMessage.length < 5) {
      setErrorMessage("Please write a message with at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.join(". ")
            : data.message || "Failed to send message. Please try again.";
        throw new Error(detail);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="bg-zinc-950 text-white border-t border-zinc-900 relative overflow-hidden">
      {/* Subtle warm amber ambient glow matching testimonial section */}
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[550px] h-[220px] bg-amber-500 rounded-full blur-[100px] opacity-15 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-16 md:pt-24 pb-12 relative z-10">
        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-16 md:pb-20 border-b border-zinc-900">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3 block">
              Contact
            </span>

            <h2 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight text-white leading-tight mb-4">
              Get in touch.
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg font-light leading-relaxed max-w-md">
              Have a question, feedback, an idea for collaboration, or just exploring the platform? Send a message and we’ll get back to you.
            </p>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 lg:p-10">
              {submitted ? (
                <div className="py-10 px-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-400">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-zinc-100" />
                  </div>
                  <h3 className="text-2xl font-serif text-white font-medium mb-2">
                    Message sent
                  </h3>
                  <p className="text-zinc-400 max-w-md font-light leading-relaxed mb-6 text-sm">
                    Thanks for reaching out, <span className="text-white font-medium">{formState.name}</span>. We’ve received your note and will get back to you at <span className="text-white font-medium">{formState.email}</span>.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", message: "" });
                    }}
                    variant="outline"
                    className="rounded-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-sm font-medium px-6 h-10"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-xs text-zinc-400 font-medium">
                        Your Name
                      </Label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Jane Doe"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        required
                        className="w-full h-11 px-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-xs text-zinc-400 font-medium">
                        Email Address
                      </Label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="jane@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        required
                        className="w-full h-11 px-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-xs text-zinc-400 font-medium">
                      Message
                    </Label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Write your message here..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      required
                      className="w-full p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-medium text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Minimal Brand & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-2xl font-semibold text-white tracking-tight hover:opacity-90 transition-opacity">
              Facet
            </Link>
            <span className="text-zinc-700">&middot;</span>
            <span className="text-xs text-zinc-500">
              Event photo recognition platform
            </span>
          </div>

          <span className="text-xs text-zinc-500 font-light">
            &copy; {new Date().getFullYear()} Facet. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
