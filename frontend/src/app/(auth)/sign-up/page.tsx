import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#FAF7F2]">
      <div className="w-full max-w-md relative z-10 -mt-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto p-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-700/70" />
            </div>
          }
        >
          <AuthForm type="sign-up" />
        </Suspense>
      </div>
    </div>
  );
}
