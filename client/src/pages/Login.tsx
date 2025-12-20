import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const handleMagicLink = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", "/api/auth/magic-link", { email });
      const data = await result.json();
      if (data.success) {
        toast({ title: "Check your email", description: "We've sent you a magic link to sign in." });
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send magic link", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleSendOTP = async () => {
    if (!otpEmail) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", "/api/auth/send-otp", { email: otpEmail });
      const data = await result.json();
      if (data.success) {
        setOtpSent(true);
        toast({ title: "Code sent", description: "Check your email for the verification code." });
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send code", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({ title: "Error", description: "Please enter the verification code", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", "/api/auth/verify-otp", { email: otpEmail, token: otp });
      const data = await result.json();
      if (data.success) {
        if (data.data?.session?.access_token) {
          localStorage.setItem("supabase_access_token", data.data.session.access_token);
        }
        toast({ title: "Success", description: "You're now logged in!" });
        setLocation("/admin");
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to verify code", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      toast({ title: "Error", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", "/api/auth/signin", { email, password });
      const data = await result.json();
      if (data.success) {
        if (data.data?.session?.access_token) {
          localStorage.setItem("supabase_access_token", data.data.session.access_token);
        }
        toast({ title: "Success", description: "You're now logged in!" });
        setLocation("/admin");
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to sign in", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/")}
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="magic-link">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="magic-link" data-testid="tab-magic-link">Magic Link</TabsTrigger>
                <TabsTrigger value="otp" data-testid="tab-otp">Email Code</TabsTrigger>
                <TabsTrigger value="password" data-testid="tab-password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="magic-link" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-magic-email"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleMagicLink}
                  disabled={isLoading}
                  data-testid="button-send-magic-link"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                  Send Magic Link
                </Button>
              </TabsContent>

              <TabsContent value="otp" className="space-y-4">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp-email">Email</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="your@email.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        data-testid="input-otp-email"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      data-testid="button-send-otp"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                      Send Verification Code
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp-code">Verification Code</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        data-testid="input-otp-code"
                      />
                      <p className="text-sm text-muted-foreground">
                        Code sent to {otpEmail}
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleVerifyOTP}
                      disabled={isLoading}
                      data-testid="button-verify-otp"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Verify Code
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setOtpSent(false)}
                      data-testid="button-resend-otp"
                    >
                      Use different email
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-email">Email</Label>
                  <Input
                    id="password-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-password-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handlePasswordLogin}
                  disabled={isLoading}
                  data-testid="button-password-login"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Sign In
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
