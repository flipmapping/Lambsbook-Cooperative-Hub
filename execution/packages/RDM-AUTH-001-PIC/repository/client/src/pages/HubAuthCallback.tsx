import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  postAuthenticationContinuation,
  type ContinuationContext,
} from "@/lib/auth/PostAuthenticationContinuation";
import { resolvePostAuthenticationDestination } from "@/lib/auth/NavigationConsumptionAuthority";


/**
 * Phase 5 Work Package 2B
 *
 * Dormant preparation boundary for future continuation delegation.
 *
 * Architectural invariant:
 *
 * This helper prepares only HubAuthCallback-local authentication values.
 * It SHALL NOT construct or infer the canonical ContinuationContext.
 * Mapping into the canonical ContinuationContext remains exclusively
 * owned by the Canonical Authentication Continuation Authority.
 *
 * This preparation boundary intentionally mirrors the structure,
 * documentation style, and dormant behaviour established in
 * HubAuth.tsx during Work Package 2A.
 */

interface _PreparedAuthenticationValues {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly inviteToken?: string;
}

function _prepareContinuationValues(
  values: _PreparedAuthenticationValues,
): _PreparedAuthenticationValues {
  return values;
}

function _buildContinuationContext(
  prepared: _PreparedAuthenticationValues,
): ContinuationContext {
  return {
    accessToken: prepared.accessToken,
    refreshToken: prepared.refreshToken,
    inviteToken: prepared.inviteToken,
    authenticationMode: "callback",
  };
}


export default function HubAuthCallback() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        const urlParams = new URLSearchParams(search);
        const urlError = urlParams.get("error");
        const urlErrorDescription = urlParams.get("error_description");
        const referrer = urlParams.get("referrer");
        const inviteToken = urlParams.get("invite");

        if (error || urlError) {
          setStatus("error");
          setErrorMessage(
            errorDescription || urlErrorDescription || "Authentication failed",
          );
          return;
        }

        if (!accessToken) {
          setStatus("error");
          setErrorMessage(
            "No authentication token received. Please try signing up again.",
          );
          return;
        }

        const tokenData = {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: "bearer",
        };

        localStorage.setItem("supabase.auth.token", JSON.stringify(tokenData));

        const prepared =
          _prepareContinuationValues({
            accessToken,
            refreshToken:
              refreshToken ?? undefined,
            inviteToken:
              inviteToken ?? undefined,
          });

        const continuationContext =
          _buildContinuationContext(
            prepared,
          );

        const runtimeState =
          await postAuthenticationContinuation(
            continuationContext,
          );

        const destination =
          resolvePostAuthenticationDestination(
            runtimeState,
          );


        if (referrer) {
          try {
            await fetch("/api/hub/auth/link-referrer", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ referrerEmail: referrer }),
            });
          } catch (e) {
            console.warn("Failed to link referrer:", e);
          }
        }


        if (inviteToken) {
          try {
            await fetch("/api/member/onboarding/materialize-invitation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ inviteToken }),
            });
          } catch (e) {
            console.warn("Failed to materialize invitation:", e);
          }
        }

        setStatus("success");

        setTimeout(() => {
          setLocation(destination);
        }, 1500);
      } catch (e) {
        console.error("Auth callback error:", e);
        setStatus("error");
        setErrorMessage("An error occurred during authentication.");
      }
    };

    handleCallback();
  }, [search, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle>Signing you in...</CardTitle>
              <CardDescription>
                Please wait while we verify your credentials
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Welcome to Lambsbook Hub!</CardTitle>
              <CardDescription>
                Redirecting you to your dashboard...
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>Authentication Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>

        {status === "error" && (
          <CardContent className="flex flex-col gap-2">
            <Button
              onClick={() => setLocation("/hub/signup")}
              data-testid="button-try-again"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/hub")}
              data-testid="button-back-to-hub"
            >
              Back to Hub
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
