import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your login...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const error = hashParams.get("error") || queryParams.get("error");
        const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(errorDescription || "Authentication failed");
          return;
        }

        if (accessToken) {
          localStorage.setItem("supabase_access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("supabase_refresh_token", refreshToken);
          }
          
          setStatus("success");
          setMessage("Login successful! Redirecting...");
          
          setTimeout(() => {
            setLocation("/admin");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("No authentication token received");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during authentication");
        console.error("Auth callback error:", err);
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Authenticating
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                Success
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                Error
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4" data-testid="text-auth-message">
            {message}
          </p>
          {status === "error" && (
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation("/login")} 
                data-testid="button-try-again"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                data-testid="button-go-home"
                className="ml-2"
              >
                Go Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
