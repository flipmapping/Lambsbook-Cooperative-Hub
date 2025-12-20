import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";

interface HubAuthProps {
  mode: "login" | "signup";
}

export default function HubAuth({ mode }: HubAuthProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; fullName?: string; referralCode?: string }) => {
      return apiRequest("POST", `/api/hub/auth/${mode}`, data);
    },
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    authMutation.mutate({ 
      email, 
      fullName: mode === "signup" ? fullName : undefined,
      referralCode: mode === "signup" ? referralCode : undefined,
    });
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to {mode === "signup" ? "complete your registration" : "log in"}. 
              The link will expire in 1 hour.
            </p>
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              data-testid="button-try-different-email"
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/hub">
          <Button variant="ghost" className="mb-4" data-testid="button-back-to-hub">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-md bg-primary flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-bold">LB</span>
            </div>
            <CardTitle>
              {mode === "signup" ? "Join Lambsbook Hub" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {mode === "signup" 
                ? "Create your account to start earning" 
                : "Log in with your email to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    data-testid="input-full-name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referrer Email (Optional)</Label>
                  <Input
                    id="referralCode"
                    type="email"
                    placeholder="referrer@example.com"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    data-testid="input-referrer-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Know someone in the Hub? Enter their email to connect as their referral.
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={authMutation.isPending}
                data-testid="button-submit-auth"
              >
                {authMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {mode === "signup" ? "Send Magic Link" : "Send Login Link"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "signup" ? (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/hub/login" className="text-primary hover:underline" data-testid="link-login">
                    Log in
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  New to Lambsbook Hub?{" "}
                  <Link href="/hub/signup" className="text-primary hover:underline" data-testid="link-signup">
                    Create an account
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
