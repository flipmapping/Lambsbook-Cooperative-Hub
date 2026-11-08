import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

type OAuthClientDetails = {
  name?: string;
  client_name?: string;
  uri?: string;
  logo_uri?: string;
};

type AuthorizationDetails = {
  authorization_id: string;
  client: OAuthClientDetails;
  scope?: string;
  redirect_uri?: string;
};

type PageStatus = "loading" | "ready" | "approving" | "denying" | "error";

const PENDING_AUTH_KEY = "lch.oauth.pending_authorization_id";

export default function OAuthConsent() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const authorizationId = useMemo(
    () => new URLSearchParams(search).get("authorization_id")?.trim() ?? "",
    [search],
  );
  const [status, setStatus] = useState<PageStatus>("loading");
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadAuthorization = async () => {
      if (!authorizationId || authorizationId.length > 512) {
        setStatus("error");
        setMessage("This authorization request is missing or invalid.");
        return;
      }

      sessionStorage.setItem(PENDING_AUTH_KEY, authorizationId);
      const supabase = createClient();

      try {
        let { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        // HubAuth currently receives the password-auth session from the
        // server and publishes it through this existing bridge key.
        if (!sessionData.session) {
          const rawSession = localStorage.getItem("supabase.auth.token");
          if (rawSession) {
            try {
              const parsed = JSON.parse(rawSession) as {
                access_token?: string;
                refresh_token?: string;
              };
              if (parsed.access_token && parsed.refresh_token) {
                const restored = await supabase.auth.setSession({
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                });
                sessionError = restored.error;
                sessionData = { session: restored.data.session };
              }
            } catch {
              // An invalid legacy bridge value is not treated as a session.
            }
          }
        }

        if (!active) return;

        if (sessionError || !sessionData.session) {
          setLocation(
            `/hub/login?oauth_authorization_id=${encodeURIComponent(authorizationId)}`,
          );
          return;
        }

        const { data, error } =
          await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

        if (!active) return;
        if (error) throw error;

        if (!("authorization_id" in data)) {
          const redirectUrl = (data as { redirect_url?: string }).redirect_url;
          if (!redirectUrl) {
            throw new Error("Supabase returned an incomplete authorization response.");
          }
          window.location.assign(redirectUrl);
          return;
        }

        const authorization = data as AuthorizationDetails;
        if (!authorization.client?.name) {
          throw new Error("Supabase returned incomplete application details.");
        }

        setDetails(authorization);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this authorization request.",
        );
      }
    };

    void loadAuthorization();
    return () => {
      active = false;
    };
  }, [authorizationId, setLocation]);

  const completeAuthorization = async (decision: "approve" | "deny") => {
    if (!authorizationId || status !== "ready") return;

    setStatus(decision === "approve" ? "approving" : "denying");
    setMessage("");

    try {
      const supabase = createClient();
      const result =
        decision === "approve"
          ? await supabase.auth.oauth.approveAuthorization(authorizationId)
          : await supabase.auth.oauth.denyAuthorization(authorizationId);

      if (result.error) throw result.error;
      const redirectUrl = result.data?.redirect_url;

      if (!redirectUrl) {
        throw new Error("Supabase did not return an authorization redirect.");
      }

      sessionStorage.removeItem(PENDING_AUTH_KEY);
      window.location.assign(redirectUrl);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete the authorization decision.",
      );
    }
  };

  const clientName =
    details?.client?.name ??
    details?.client?.client_name ??
    "A third-party application";
  const scopes = details?.scope?.split(/\\s+/).filter(Boolean) ?? [];

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Connect with Lambsbook</CardTitle>
          <CardDescription>
            Review this application's request before sharing your approved
            account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your LCH session and authorization request…
            </div>
          )}

          {(status === "ready" ||
            status === "approving" ||
            status === "denying") && (
            <>
              <section className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Application requesting access
                </p>
                <h2 className="mt-1 text-lg font-semibold">{clientName}</h2>
                {details?.client?.uri && (
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {details.client.uri}
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">
                  Requested permissions
                </h3>
                {scopes.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {scopes.map((scope) => (
                      <li key={scope}>{scope}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    The application has not supplied a readable permissions
                    list. Do not approve unless you understand the request.
                  </p>
                )}
              </section>

              <p className="text-sm text-muted-foreground">
                Approving allows this application to receive only the
                information and permissions listed in this request. You can
                deny access if you do not recognise the application.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => void completeAuthorization("deny")}
                  disabled={status !== "ready"}
                >
                  {status === "denying" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Deny
                </Button>
                <Button
                  onClick={() => void completeAuthorization("approve")}
                  disabled={status !== "ready"}
                >
                  {status === "approving" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p>{message || "The authorization request could not be completed."}</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/hub")}
              >
                Return to Lambsbook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
