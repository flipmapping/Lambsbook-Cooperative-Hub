import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  Loader2,
  UserCheck,
  AlertCircle,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

interface HubAuthProps {
  mode: "login" | "signup";
}

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUsername(username: string): string | null {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 50) return "Username must be 50 characters or less";
  if (!USERNAME_REGEX.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }
  return null;
}

function validatePhone(phone: string): string | null {
  if (!phone) return "Phone number is required";
  const normalized = phone.replace(/[\s\-().]/g, "");
  if (!PHONE_REGEX.test(normalized)) {
    return "Please enter a valid phone number (7-15 digits, optional + prefix)";
  }
  return null;
}

function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  return null;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, "");
}

interface FormErrors {
  username?: string | null;
  phone?: string | null;
  email?: string | null;
  fullName?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

export default function HubAuth({ mode }: HubAuthProps) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [referrerValidation, setReferrerValidation] = useState<{
    checking: boolean;
    valid: boolean | null;
    name?: string;
  }>({ checking: false, valid: null });

  const [emailSent, setEmailSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get("ref");
    if (ref && mode === "signup") {
      setReferrerEmail(ref);
    }
  }, [search, mode]);

  useEffect(() => {
    if (
      !referrerEmail ||
      referrerEmail.length < 5 ||
      !referrerEmail.includes("@")
    ) {
      setReferrerValidation({ checking: false, valid: null });
      return;
    }

    const timer = setTimeout(async () => {
      setReferrerValidation({ checking: true, valid: null });
      try {
        const response = await fetch(
          `/api/hub/auth/validate-referrer?email=${encodeURIComponent(referrerEmail)}`,
        );
        const data = await response.json();
        setReferrerValidation({
          checking: false,
          valid: data.valid,
          name: data.member?.name,
        });
      } catch {
        setReferrerValidation({ checking: false, valid: null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [referrerEmail]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const newErrors = { ...errors };

    switch (field) {
      case "username":
        newErrors.username = validateUsername(username);
        break;
      case "phone":
        newErrors.phone = validatePhone(phone);
        break;
      case "email":
        newErrors.email = validateEmail(email);
        break;
      case "fullName":
        newErrors.fullName = fullName.trim() ? null : "Full name is required";
        break;
      case "password":
        newErrors.password =
          password.length < 8 ? "Password must be at least 8 characters" : null;
        if (mode === "signup" && confirmPassword && touched.confirmPassword) {
          newErrors.confirmPassword =
            password !== confirmPassword ? "Passwords do not match" : null;
        }
        break;
      case "confirmPassword":
        newErrors.confirmPassword =
          password !== confirmPassword ? "Passwords do not match" : null;
        break;
    }

    setErrors(newErrors);
  };

  const authMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      fullName?: string;
      username?: string;
      phone?: string;
      referrerEmail?: string;
    }) => {
      const res = await apiRequest("POST", `/api/hub/auth/${mode}`, data);
      return res.json();
    },
    onSuccess: (result) => {
      if (mode === "signup") {
        if (result.needsConfirmation === false && result.session) {
          localStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(result.session),
          );
          setLocation("/hub/dashboard");
        } else {
          setSignupSuccess(true);
        }
        return;
      }

      if (result.session) {
        localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(result.session),
        );
        setLocation("/hub/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailValue: string) => {
      const res = await apiRequest("POST", "/api/hub/auth/forgot-password", {
        email: emailValue,
      });
      return res.json();
    },
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      const emailError = validateEmail(email);
      const usernameError = validateUsername(username);
      const phoneError = validatePhone(phone);
      const fullNameError = fullName.trim() ? null : "Full name is required";
      const passwordError =
        password.length < 8 ? "Password must be at least 8 characters" : null;
      const confirmPasswordError =
        password !== confirmPassword ? "Passwords do not match" : null;

      const newErrors: FormErrors = {
        email: emailError,
        username: usernameError,
        phone: phoneError,
        fullName: fullNameError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      };

      setErrors(newErrors);
      setTouched({
        email: true,
        username: true,
        phone: true,
        fullName: true,
        password: true,
        confirmPassword: true,
      });

      if (
        emailError ||
        usernameError ||
        phoneError ||
        fullNameError ||
        passwordError ||
        confirmPasswordError
      ) {
        toast({
          title: "Please fix the errors",
          description: "Check the form for validation errors",
          variant: "destructive",
        });
        return;
      }

      if (
        referrerEmail &&
        (!referrerEmail.includes("@") || referrerEmail.length < 5)
      ) {
        toast({
          title: "Invalid referrer email",
          description: "Please enter a valid email address for the referrer",
          variant: "destructive",
        });
        return;
      }

      authMutation.mutate({
        email,
        password,
        fullName,
        username,
        phone: normalizePhone(phone),
        referrerEmail: referrerEmail || undefined,
      });
    } else {
      const emailError = validateEmail(email);
      const passwordError =
        password.length < 8 ? "Password must be at least 8 characters" : null;

      if (emailError || passwordError) {
        setErrors({ email: emailError, password: passwordError });
        setTouched({ email: true, password: true });
        return;
      }

      authMutation.mutate({ email, password });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(forgotEmail);
    if (emailError) {
      toast({
        title: "Invalid email",
        description: emailError,
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(forgotEmail);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Account Created</CardTitle>
            <CardDescription>
              Please check <strong>{email}</strong> for a confirmation link
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to confirm your account, then you can
              log in with your password.
            </p>
            <Button
              variant="outline"
              onClick={() => setLocation("/hub/login")}
              data-testid="button-go-to-login"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{forgotEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to reset your password. The link will
              expire in 1 hour.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setShowForgotPassword(false);
              }}
              data-testid="button-back-to-login"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setShowForgotPassword(false)}
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-md bg-primary flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a link to reset your
                password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    data-testid="input-forgot-email"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                  data-testid="button-send-reset-link"
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/hub">
          <Button
            variant="ghost"
            className="mb-4"
            data-testid="button-back-to-hub"
          >
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
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      className={
                        touched.fullName && errors.fullName
                          ? "border-destructive"
                          : ""
                      }
                      data-testid="input-full-name"
                    />
                    {touched.fullName && errors.fullName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="your_username"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value.toLowerCase())
                        }
                        onBlur={() => handleBlur("username")}
                        className={`pl-9 ${
                          touched.username && errors.username
                            ? "border-destructive"
                            : ""
                        }`}
                        data-testid="input-username"
                      />
                    </div>
                    {touched.username && errors.username ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.username}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        3-50 characters: letters, numbers, underscores, hyphens
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+84 363 192 508"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={`pl-9 ${
                          touched.phone && errors.phone
                            ? "border-destructive"
                            : ""
                        }`}
                        data-testid="input-phone"
                      />
                    </div>
                    {touched.phone && errors.phone ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Include country code (e.g., +84 for Vietnam)
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={
                    touched.email && errors.email ? "border-destructive" : ""
                  }
                  data-testid="input-email"
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`pl-9 pr-9 ${
                      touched.password && errors.password
                        ? "border-destructive"
                        : ""
                    }`}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                ) : mode === "signup" ? (
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters
                  </p>
                ) : null}
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      className={`pl-9 pr-9 ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "border-destructive"
                          : ""
                      }`}
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      tabIndex={-1}
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="referrerEmail">
                    Referrer Email (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="referrerEmail"
                      type="email"
                      placeholder="referrer@example.com"
                      value={referrerEmail}
                      onChange={(e) => setReferrerEmail(e.target.value)}
                      className={
                        referrerValidation.valid === false
                          ? "border-amber-500"
                          : referrerValidation.valid === true
                            ? "border-green-500 pr-10"
                            : ""
                      }
                      data-testid="input-referrer-email"
                    />
                    {referrerValidation.checking && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {referrerValidation.valid === true &&
                      !referrerValidation.checking && (
                        <UserCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    {referrerValidation.valid === false &&
                      !referrerValidation.checking && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                      )}
                  </div>
                  {referrerValidation.valid === true &&
                    referrerValidation.name && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        You'll be connected to: {referrerValidation.name}
                      </p>
                    )}
                  {referrerValidation.valid === false && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      No member found with this email. You can still sign up and
                      add a referrer later.
                    </p>
                  )}
                  {referrerValidation.valid === null &&
                    !referrerValidation.checking && (
                      <p className="text-xs text-muted-foreground">
                        Know someone in the Hub? Enter their email to connect as
                        their referral.
                      </p>
                    )}
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
                    {mode === "signup"
                      ? "Creating Account..."
                      : "Logging in..."}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    {mode === "signup" ? "Create Account" : "Log In"}
                  </>
                )}
              </Button>

              {mode === "login" && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotEmail(email);
                    }}
                    className="text-sm text-muted-foreground hover:underline"
                    data-testid="link-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "signup" ? (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/hub/login"
                    className="text-primary hover:underline"
                    data-testid="link-login"
                  >
                    Log in
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  New to Lambsbook Hub?{" "}
                  <Link
                    href="/hub/signup"
                    className="text-primary hover:underline"
                    data-testid="link-signup"
                  >
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
