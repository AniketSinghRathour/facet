"use client";

import { useSession } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * PhotographerLayout provides client-side route protection for all /dashboard/* pages.
 *
 * It pairs with Next.js proxy middleware (server-side check) to enforce defense-in-depth:
 * 1. While the Better-Auth session is resolving, displays a sleek themed loading skeleton.
 * 2. If the user is unauthenticated, redirects to /sign-in with callbackUrl preserved.
 * 3. Prevents unauthenticated users from ever seeing or interacting with the dashboard or event creation.
 */
export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      const callback = encodeURIComponent(pathname);
      router.replace(`/sign-in?callbackUrl=${callback}`);
    }
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-700/70" />
          <p className="text-sm font-medium text-zinc-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-700/70" />
          <p className="text-sm font-medium text-zinc-500">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
