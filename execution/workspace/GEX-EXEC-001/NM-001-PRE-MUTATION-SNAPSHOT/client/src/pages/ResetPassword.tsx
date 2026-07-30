import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string | null; confirmPassword?: string | null }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    const token = hashParams.get("access_token") || queryParams.get("access_token");
    const error = hashParams.get("error") || queryParams.get("error");
    const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");
    const tokenType = hashParams.get("type") || queryParams.get("type");

    if (error) {
      setTokenError(true);
      toast({
        title: "Invalid or expired link",
        description: errorDescription || "Please request a new password reset link.",
        variant: "destructive",
      });
      return;
    }

    if (token && (tokenType === "recovery" || !tokenType)) {
      setAccessToken(token);
    } else {
      setTokenError(true);
    }
  }, [toast]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = { ...errors };
    if (field === 'password') {
      newErrors.password = newPassword.length < 8 ? "Password must be at least 8 characters" : null;
      if (confirmPassword && touched.confirmPassword) {
        newErrors.confirmPassword = newPassword !== confirmPassword ? "Passwords do not match" : null;
      }
    }
    if (field === 'confirmPassword') {
      newErrors.confirmPassword = newPassword !== confirmPassword ? "Passwords do not match" : null;
    }
    setErrors(newErrors);
  };

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/hub/auth/reset-password", {
        accessToken,
        newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = newPassword.length < 8 ? "Password must be at least 8 characters" : null;
    const confirmError = newPassword !== confirmPassword ? "Passwords do not match" : null;
    
    setErrors({ password: passwordError, confirmPassword: confirmError });
    setTouched({ password: true, confirmPassword: true });
    
    if (passwordError || confirmError) return;
    
    resetMutation.mutate();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>Your password has been updated successfully</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/hub/login")} data-testid="button-go-to-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => setLocation("/hub/login")} data-testid="button-back-to-login">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-md bg-primary flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`pl-9 pr-9 ${touched.password && errors.password ? "border-destructive" : ""}`}
                    data-testid="input-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                    data-testid="button-toggle-new-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">At least 8 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`pl-9 pr-9 ${touched.confirmPassword && errors.confirmPassword ? "border-destructive" : ""}`}
                    data-testid="input-confirm-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                    data-testid="button-toggle-confirm-new-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={resetMutation.isPending}
                data-testid="button-reset-password"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
