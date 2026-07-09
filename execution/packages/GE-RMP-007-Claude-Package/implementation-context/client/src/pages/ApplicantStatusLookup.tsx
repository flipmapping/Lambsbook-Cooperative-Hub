import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowRight } from "lucide-react";

export default function ApplicantStatusLookup() {
  const [, setLocation] = useLocation();
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setLookupError(null);

    try {
      const res = await apiRequest("GET", "/api/admissions/prospects");
      if (!res.ok) throw new Error("Failed to contact admissions service");

      const prospects: Array<{ id: string; email: string }> = await res.json();
      const match = prospects.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!match) {
        setLookupError(
          "No application found for that email address. " +
          "Please check your email or register at the link below."
        );
        return;
      }

      setLocation(`/hub/applicant/status/${match.id}`);
    } catch {
      setLookupError("Unable to look up your application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Check Application Status</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the email address you used to register your application.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Find your application</CardTitle>
            <CardDescription className="text-xs">
              We'll look up your status using your registered email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10"
                />
              </div>

              {lookupError && (
                <p className="text-sm text-destructive">{lookupError}</p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email.trim()}
              >
                {loading ? "Searching\u2026" : (
                  <>
                    Find My Application
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Haven't registered yet?{" "}
          <a href="/hub/prospect-registration" className="underline hover:text-foreground">
            Register your application
          </a>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Need help? Contact{" "}
          <a href="mailto:admissions@lambsbook.net" className="underline hover:text-foreground">
            admissions@lambsbook.net
          </a>
        </p>
      </div>
    </div>
  );
}
