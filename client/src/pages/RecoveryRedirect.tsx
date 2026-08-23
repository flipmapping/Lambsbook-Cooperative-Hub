import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { createClient } from "@/lib/supabase/client";

export default function RecoveryRedirect() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifyRecoveryToken() {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (!tokenHash || type !== "recovery") {
        if (!cancelled) {
          setError("This password reset link is invalid.");
        }
        return;
      }

      const { error: verifyError } = await createClient().auth.verifyOtp({
        token_hash: tokenHash,
        type: "recovery",
      });

      if (cancelled) return;

      if (verifyError) {
        setError(
          verifyError.message || "This password reset link is invalid or expired.",
        );
        return;
      }

      setLocation("/auth/reset");
    }

    void verifyRecoveryToken();

    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Invalid or expired link</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p>Verifying your password reset link…</p>
    </div>
  );
}
