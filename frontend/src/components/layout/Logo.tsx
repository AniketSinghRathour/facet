"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoVariant =
  | "signature"
  | "monogram-combo"
  | "signature-studio"
  | "couture";

interface LogoProps {
  isHome?: boolean;
  variant?: LogoVariant;
  className?: string;
}

export function Logo({
  isHome = false,
  variant = "signature",
  className,
}: LogoProps) {
  const textColor = isHome ? "text-white" : "text-zinc-900";
  const dropShadow = isHome ? "drop-shadow-sm" : "";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center transition-all duration-300 select-none",
        className
      )}
      aria-label="Facet Home"
    >
      {/* 
        Style 1: The Aristocratic Signature (Pure Stylish Cursive)
        Bespoke, flowing calligraphic script (Pinyon Script).
        Feels like a master photographer's gold-ink signature on a gallery print.
      */}
      {variant === "signature" && (
        <span
          className={cn(
            "font-script text-3xl sm:text-[2.4rem] font-normal tracking-wide leading-none transition-transform duration-300 group-hover:scale-[1.03] flex items-baseline",
            textColor,
            dropShadow
          )}
        >
          Facet
          <span className="text-amber-500 text-2xl font-serif leading-none ml-0.5">.</span>
        </span>
      )}

      {/* 
        Style 2: Monogram Combo (Dramatic Cursive "F" + Architectural "ACET")
        Combines a sweeping calligraphic script capital "F" with clean, 
        spaced Roman serif capitals for the remaining letters.
      */}
      {variant === "monogram-combo" && (
        <span
          className={cn(
            "inline-flex items-center tracking-normal transition-transform duration-300 group-hover:scale-[1.02]",
            textColor,
            dropShadow
          )}
        >
          <span className="font-script text-3xl sm:text-[2.6rem] font-normal leading-none text-amber-500 mr-0.5 transform -translate-y-0.5">
            F
          </span>
          <span className="font-serif text-base sm:text-lg font-light tracking-[0.25em] uppercase">
            acet
          </span>
        </span>
      )}

      {/* 
        Style 3: Signature Studio Lockup (Cursive Brand + Micro-Caps Subtitle)
        Flowing script "Facet" stacked with an ultra-spaced, architectural
        "STUDIO" subline beneath. Evokes high-end Paris/Milan atelier branding.
      */}
      {variant === "signature-studio" && (
        <div className="inline-flex flex-col items-start leading-none group-hover:opacity-95 transition-opacity">
          <span
            className={cn(
              "font-script text-3xl sm:text-[2.2rem] font-normal tracking-wide",
              textColor,
              dropShadow
            )}
          >
            Facet
          </span>
          <span className="font-sans text-[8px] sm:text-[9px] uppercase tracking-[0.42em] font-medium text-amber-500/90 pl-0.5 -mt-1">
            Studio
          </span>
        </div>
      )}

      {/* 
        Style 4: Haute Couture (Spaced Editorial All-Caps)
        Architectural wide-spaced serif capitals (F A C E T).
      */}
      {variant === "couture" && (
        <span
          className={cn(
            "font-serif text-lg sm:text-xl font-light uppercase tracking-[0.28em] transition-all duration-300 group-hover:tracking-[0.32em]",
            textColor,
            dropShadow
          )}
        >
          Facet
        </span>
      )}
    </Link>
  );
}
