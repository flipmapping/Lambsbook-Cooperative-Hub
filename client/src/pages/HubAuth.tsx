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
import { useLanguage } from "@/lib/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import {
  postAuthenticationContinuation,
  type AuthenticationMode,
  type ContinuationContext,
} from "@/lib/auth/PostAuthenticationContinuation";
import { resolvePostAuthenticationDestination } from "@/lib/auth/NavigationConsumptionAuthority";
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

const authPageTranslations: Record<string, Record<string, string>> = {
  "en": {
    "3-50 characters: letters, numbers, underscores, hyphens": "3-50 characters: letters, numbers, underscores, hyphens",
    "Account Created": "Account Created",
    "Already have an account?": "Already have an account?",
    "At least 8 characters": "At least 8 characters",
    "Back to Hub": "Back to Hub",
    "Back to Login": "Back to Login",
    "Check Your Email": "Check Your Email",
    "Click the link in your email to confirm your account, then you can log in with your password.": "Click the link in your email to confirm your account, then you can log in with your password.",
    "Click the link in your email to reset your password. The link will expire in 1 hour.": "Click the link in your email to reset your password. The link will expire in 1 hour.",
    "Confirm Password *": "Confirm Password *",
    "Create an account": "Create an account",
    "Create Account": "Create Account",
    "Email Address": "Email Address",
    "Email Address *": "Email Address *",
    "Enter your email and we'll send you a link to reset your password": "Enter your email and we'll send you a link to reset your password",
    "Forgot password?": "Forgot password?",
    "Full Name *": "Full Name *",
    "Go to Login": "Go to Login",
    "Include country code (e.g., +84 for Vietnam)": "Include country code (e.g., +84 for Vietnam)",
    "Know someone in the Hub? Enter their email to connect as their referral.": "Know someone in the Hub? Enter their email to connect as their referral.",
    "Log in": "Log in",
    "Membership Is By Invitation": "Membership Is By Invitation",
    "New to Lambsbook Hub?": "New to Lambsbook Hub?",
    "No member found with this email. You can still sign up and add a referrer later.": "No member found with this email. You can still sign up and add a referrer later.",
    "Password *": "Password *",
    "Please check": "Please check",
    "Referrer Email (Optional)": "Referrer Email (Optional)",
    "Reset Password": "Reset Password",
    "Return Home": "Return Home",
    "Send Reset Link": "Send Reset Link",
    "Sending...": "Sending...",
    "Sign In": "Sign In",
    "This keeps the community high-trust and ensures every member is accountable to someone already inside.": "This keeps the community high-trust and ensures every member is accountable to someone already inside.",
    "To join, ask an existing member to send you a personal invitation link.": "To join, ask an existing member to send you a personal invitation link.",
    "Username *": "Username *",
    "We've sent a password reset link to": "We've sent a password reset link to",
    "You'll be connected to:": "You'll be connected to:",
    "Your account has been created, but Lambsbook Cooperative is a members-only community.": "Your account has been created, but Lambsbook Cooperative is a members-only community.",
    "for a confirmation link": "for a confirmation link",
    "is a trusted relationship network. Membership is extended only through personal invitation from an existing member who knows and trusts you.": "is a trusted relationship network. Membership is extended only through personal invitation from an existing member who knows and trusts you."
  },
  "vi": {
    "3-50 characters: letters, numbers, underscores, hyphens": "3–50 ký tự: chữ cái, số, dấu gạch dưới và dấu gạch nối",
    "Account Created": "Đã tạo tài khoản",
    "Already have an account?": "Đã có tài khoản?",
    "At least 8 characters": "Ít nhất 8 ký tự",
    "Back to Hub": "Quay lại Hub",
    "Back to Login": "Quay lại đăng nhập",
    "Check Your Email": "Kiểm tra email của bạn",
    "Click the link in your email to confirm your account, then you can log in with your password.": "Nhấp vào liên kết trong email để xác nhận tài khoản, sau đó đăng nhập bằng mật khẩu.",
    "Click the link in your email to reset your password. The link will expire in 1 hour.": "Nhấp vào liên kết trong email để đặt lại mật khẩu. Liên kết sẽ hết hạn sau 1 giờ.",
    "Confirm Password *": "Xác nhận mật khẩu *",
    "Create an account": "Tạo tài khoản",
    "Create Account": "Tạo tài khoản",
    "Email Address": "Địa chỉ email",
    "Email Address *": "Địa chỉ email *",
    "Enter your email and we'll send you a link to reset your password": "Nhập email để nhận liên kết đặt lại mật khẩu",
    "Forgot password?": "Quên mật khẩu?",
    "Full Name *": "Họ và tên *",
    "Go to Login": "Đi tới đăng nhập",
    "Include country code (e.g., +84 for Vietnam)": "Bao gồm mã quốc gia (ví dụ: +84 cho Việt Nam)",
    "Know someone in the Hub? Enter their email to connect as their referral.": "Bạn quen ai trong Hub không? Nhập email của họ để ghi nhận người giới thiệu.",
    "Log in": "Đăng nhập",
    "Membership Is By Invitation": "Tư cách thành viên cần có thư mời",
    "New to Lambsbook Hub?": "Bạn mới biết đến Lambsbook Hub?",
    "No member found with this email. You can still sign up and add a referrer later.": "Không tìm thấy thành viên có email này. Bạn vẫn có thể đăng ký và thêm người giới thiệu sau.",
    "Password *": "Mật khẩu *",
    "Please check": "Vui lòng kiểm tra",
    "Referrer Email (Optional)": "Email người giới thiệu (không bắt buộc)",
    "Reset Password": "Đặt lại mật khẩu",
    "Return Home": "Về trang chủ",
    "Send Reset Link": "Gửi liên kết đặt lại",
    "Sending...": "Đang gửi...",
    "Sign In": "Đăng nhập",
    "This keeps the community high-trust and ensures every member is accountable to someone already inside.": "Điều này giúp cộng đồng duy trì sự tin cậy và bảo đảm mỗi thành viên được một người đang tham gia giới thiệu.",
    "To join, ask an existing member to send you a personal invitation link.": "Để tham gia, hãy nhờ một thành viên gửi cho bạn liên kết mời riêng.",
    "Username *": "Tên người dùng *",
    "We've sent a password reset link to": "Chúng tôi đã gửi liên kết đặt lại mật khẩu tới",
    "You'll be connected to:": "Bạn sẽ được kết nối với:",
    "Your account has been created, but Lambsbook Cooperative is a members-only community.": "Tài khoản đã được tạo, nhưng Lambsbook Cooperative là cộng đồng chỉ dành cho thành viên được mời.",
    "for a confirmation link": "để nhận liên kết xác nhận",
    "is a trusted relationship network. Membership is extended only through personal invitation from an existing member who knows and trusts you.": "là mạng lưới quan hệ đáng tin cậy. Chỉ thành viên hiện tại quen biết và tin tưởng bạn mới có thể gửi lời mời tham gia.",
    "placeholder:Enter your full name": "placeholder:Nhập họ và tên",
    "placeholder:Enter your password": "placeholder:Nhập mật khẩu",
    "placeholder:Re-enter your password": "placeholder:Nhập lại mật khẩu",
    "placeholder:referrer@example.com": "placeholder:email-nguoi-gioi-thieu@example.com",
    "placeholder:you@example.com": "placeholder:ban@example.com",
    "placeholder:your_username": "placeholder:ten_nguoi_dung"
  },
  "zh": {
    "3-50 characters: letters, numbers, underscores, hyphens": "3–50 个字符：字母、数字、下划线和连字符",
    "Account Created": "账户已创建",
    "Already have an account?": "已有账户？",
    "At least 8 characters": "至少 8 个字符",
    "Back to Hub": "返回 Hub",
    "Back to Login": "返回登录",
    "Check Your Email": "请查收电子邮件",
    "Click the link in your email to confirm your account, then you can log in with your password.": "请点击邮件中的链接确认账户，然后使用密码登录。",
    "Click the link in your email to reset your password. The link will expire in 1 hour.": "请点击邮件中的链接重置密码。该链接将在 1 小时后失效。",
    "Confirm Password *": "确认密码 *",
    "Create an account": "创建账户",
    "Create Account": "创建账户",
    "Email Address": "电子邮件地址",
    "Email Address *": "电子邮件地址 *",
    "Enter your email and we'll send you a link to reset your password": "输入电子邮件，我们会向你发送重置密码链接",
    "Forgot password?": "忘记密码？",
    "Full Name *": "姓名 *",
    "Go to Login": "前往登录",
    "Include country code (e.g., +84 for Vietnam)": "请填写国家/地区代码（例如越南为 +84）",
    "Know someone in the Hub? Enter their email to connect as their referral.": "你认识 Hub 中的成员吗？输入对方的电子邮件以关联推荐人。",
    "Log in": "登录",
    "Membership Is By Invitation": "会员资格仅限邀请加入",
    "New to Lambsbook Hub?": "刚开始使用 Lambsbook Hub？",
    "No member found with this email. You can still sign up and add a referrer later.": "未找到使用此电子邮件的会员。你仍可注册，之后再添加推荐人。",
    "Password *": "密码 *",
    "Please check": "请检查",
    "Referrer Email (Optional)": "推荐人电子邮件（选填）",
    "Reset Password": "重置密码",
    "Return Home": "返回首页",
    "Send Reset Link": "发送重置链接",
    "Sending...": "正在发送…",
    "Sign In": "登录",
    "This keeps the community high-trust and ensures every member is accountable to someone already inside.": "这有助于维护社区信任，并确保每位会员都由现有成员引荐。",
    "To join, ask an existing member to send you a personal invitation link.": "如需加入，请联系现有会员向你发送专属邀请链接。",
    "Username *": "用户名 *",
    "We've sent a password reset link to": "我们已发送密码重置链接至",
    "You'll be connected to:": "你将关联至：",
    "Your account has been created, but Lambsbook Cooperative is a members-only community.": "你的账户已创建，但 Lambsbook Cooperative 是仅限受邀会员加入的社群。",
    "for a confirmation link": "以获取确认链接",
    "is a trusted relationship network. Membership is extended only through personal invitation from an existing member who knows and trusts you.": "是一个可信关系网络。只有认识并信任你的现有会员才能邀请你加入。",
    "placeholder:Enter your full name": "placeholder:请输入姓名",
    "placeholder:Enter your password": "placeholder:请输入密码",
    "placeholder:Re-enter your password": "placeholder:请再次输入密码",
    "placeholder:referrer@example.com": "placeholder:推荐人@example.com",
    "placeholder:you@example.com": "placeholder:你的邮箱@example.com",
    "placeholder:your_username": "placeholder:你的用户名"
  }
};

export default function HubAuth({ mode }: HubAuthProps) {
  const { language } = useLanguage();
  const authIntroByLanguage: Record<string, {
    userSignupTitle: string;
    userSignupDescription: string;
    memberSignupTitle: string;
    memberSignupDescription: string;
    loginTitle: string;
    userLoginDescription: string;
    memberLoginDescription: string;
  }> = {
    en: {
      userSignupTitle: "Create a User Account",
      userSignupDescription: "Create your account to start learning.",
      memberSignupTitle: "Join Lambsbook Hub",
      memberSignupDescription: "Create your account to start earning.",
      loginTitle: "Welcome Back",
      userLoginDescription: "Log in with your email to continue learning.",
      memberLoginDescription: "Log in with your email to continue.",
    },
    vi: {
      userSignupTitle: "Tạo tài khoản người dùng",
      userSignupDescription: "Tạo tài khoản để bắt đầu học tập.",
      memberSignupTitle: "Tham gia Lambsbook Hub",
      memberSignupDescription: "Tạo tài khoản để bắt đầu tích lũy tín dụng.",
      loginTitle: "Chào mừng bạn trở lại",
      userLoginDescription: "Đăng nhập bằng email để tiếp tục học tập.",
      memberLoginDescription: "Đăng nhập bằng email để tiếp tục.",
    },
    zh: {
      userSignupTitle: "创建用户账户",
      userSignupDescription: "创建账户，开始学习。",
      memberSignupTitle: "加入 Lambsbook Hub",
      memberSignupDescription: "创建账户，开始赚取积分。",
      loginTitle: "欢迎回来",
      userLoginDescription: "使用电子邮件登录以继续学习。",
      memberLoginDescription: "使用电子邮件登录以继续。",
    },
  };
  const authIntro = authIntroByLanguage[language] ?? authIntroByLanguage.en;


  const authText = (english: string) =>
    authPageTranslations[language]?.[english] ?? english;
  const [, setLocation] = useLocation();
  const search = useSearch();
  const authParams = new URLSearchParams(search);
  const isRegularUserFlow =
    authParams.get("account") === "user" ||
    (mode === "signup" &&
      authParams.get("account") !== "member" &&
      !authParams.get("invite"));
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
  const [showInvitationOnly, setShowInvitationOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get("ref");
    const inviteToken = params.get("invite");

    if (ref && mode === "signup") {
      setReferrerEmail(ref);
    }

    if (inviteToken && mode === "signup") {
      localStorage.setItem("gateway.invite.token", inviteToken);
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

  /**
   * Phase 5 Work Package 2A
   *
   * Dormant preparation boundary for future continuation delegation.
   *
   * This boundary intentionally prepares only the raw authentication
   * values already owned by HubAuth.tsx. Mapping these values into the
   * canonical ContinuationContext remains the sole responsibility of the
   * Canonical Authentication Continuation Authority once delegation is
   * introduced in a later work package.
   */

  interface _PreparedAuthenticationValues {
    readonly accessToken: string;
    readonly refreshToken?: string;
    readonly inviteToken?: string;
  }

  function _buildContinuationContext(
    prepared: _PreparedAuthenticationValues,
    authenticationMode: AuthenticationMode,
  ): ContinuationContext {
    return {
      accessToken: prepared.accessToken,
      refreshToken: prepared.refreshToken,
      inviteToken: prepared.inviteToken,
      authenticationMode,
    };
  }

  function _prepareContinuationValues(
    values: _PreparedAuthenticationValues,
  ): _PreparedAuthenticationValues {
    return values;
  }

  const authMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      fullName?: string;
      username?: string;
      phone?: string;
      referrerEmail?: string;
      inviteToken?: string;
    }) => {
      const endpoint = isRegularUserFlow
        ? `/api/auth/${mode === "signup" ? "signup" : "signin"}`
        : `/api/hub/auth/${mode}`;
      const payload = isRegularUserFlow
        ? { email: data.email, password: data.password, fullName: data.fullName }
        : data;
      const res = await apiRequest("POST", endpoint, payload);
      return res.json();
    },
    onSuccess: async (result, variables) => {

      if (isRegularUserFlow) {
        if (result.success === false) {
          throw new Error(result.message || "Account authentication failed.");
        }
        const userSession = result.data?.session ?? result.session;
        if (mode === "signup" && !userSession?.access_token) {
          setSignupSuccess(true);
          return;
        }
        if (!userSession?.access_token) {
          throw new Error("Sign in did not return an active session.");
        }
        const { error: sessionError } = await createClient().auth.setSession({
          access_token: userSession.access_token,
          refresh_token: userSession.refresh_token ?? "",
        });
        if (sessionError) throw sessionError;
        localStorage.setItem("supabase.auth.token", JSON.stringify(userSession));
        trackEvent("auth_completed", { mode, account_type: "user" });
        setLocation("/hub/sbu/education/lambsbook-tutoring");
        return;
      }

      if (mode === "signup") {
        if (result.needsConfirmation === false && result.session) {
          const { error: sessionError } = await createClient().auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token ?? "",
          });

          if (sessionError) {
            throw sessionError;
          }

          localStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(result.session),
          );

          const inviteToken =
            localStorage.getItem("gateway.invite.token") ?? undefined;

          // P1: materialize the canonical member invitation before membership
          // resolution so the newly authenticated invitee can resolve as pending.
          if (inviteToken) {
            try {
              const response = await fetch("/api/member/onboarding/materialize-invitation", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${result.session.access_token}`,
                },
                body: JSON.stringify({ inviteToken }),
              });
              if (!response.ok) throw new Error(`Invitation materialization failed: HTTP ${response.status}`);
            } catch (e) {
              throw new Error("Invitation materialization failed.");
            }
          }

          // APP-PIC-001: Resolve membership before constructing ContinuationContext.
          const prepared = _prepareContinuationValues({
            accessToken: result.session.access_token,
            refreshToken: result.session.refresh_token,
            inviteToken,
          });

          const continuationContext = _buildContinuationContext(
            prepared,
            mode,
          );

          console.group("[APP-PIC-001] Authentication Runtime");
          console.log("mode:", mode);
          console.log("gateway.invite.token:", inviteToken);
          console.log("ContinuationContext:", continuationContext);

          const runtimeState =
            await postAuthenticationContinuation(continuationContext);

          console.log("RuntimeState:", runtimeState);

          const destination =
            resolvePostAuthenticationDestination(runtimeState);

          console.log("Destination:", destination);
          console.groupEnd();

          // Consume the invitation token after the canonical
          // materialization/continuation lifecycle completes.
          if (inviteToken) {
            localStorage.removeItem("gateway.invite.token");
          }

          // APP-REC-006C: non_member with no pending invitation → invitation-only screen.
          if (runtimeState.outcome === "non_member") {
                      trackEvent("auth_completed", {
            mode,
            has_referrer: Boolean(variables.referrerEmail),
            has_invite: Boolean(variables.inviteToken),
          });
            setShowInvitationOnly(true);
            return;
          }

                    trackEvent("auth_completed", {
            mode,
            has_referrer: Boolean(variables.referrerEmail),
            has_invite: Boolean(variables.inviteToken),
          });
          setLocation(destination);
        } else {
                    trackEvent("auth_completed", {
            mode,
            has_referrer: Boolean(variables.referrerEmail),
            has_invite: Boolean(variables.inviteToken),
          });
          setSignupSuccess(true);
        }
        return;
      }

      if (result.session) {
        const { error: sessionError } = await createClient().auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token ?? "",
        });

        if (sessionError) {
          throw sessionError;
        }

        localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(result.session),
        );

        const inviteToken =
          localStorage.getItem("gateway.invite.token") ?? undefined;

        if (inviteToken) {
          try {
            const response = await fetch("/api/member/onboarding/materialize-invitation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${result.session.access_token}`,
              },
              body: JSON.stringify({ inviteToken }),
            });
            if (!response.ok) throw new Error(`Invitation materialization failed: HTTP ${response.status}`);
          } catch (e) {
            throw new Error("Invitation materialization failed.");
          }
        }

        // APP-PIC-001: Resolve membership before constructing ContinuationContext.
        const prepared = _prepareContinuationValues({
          accessToken: result.session.access_token,
          refreshToken: result.session.refresh_token,
          inviteToken,
        });

        const continuationContext = _buildContinuationContext(
          prepared,
          mode,
        );

        console.group("[APP-PIC-001] Authentication Runtime");
        console.log("mode:", mode);
        console.log("gateway.invite.token:", inviteToken);
        console.log("ContinuationContext:", continuationContext);

        const runtimeState =
          await postAuthenticationContinuation(continuationContext);

        console.log("RuntimeState:", runtimeState);

        const destination =
          resolvePostAuthenticationDestination(runtimeState);

        console.log("Destination:", destination);
        console.groupEnd();

        // Consume the invitation token after the canonical
        // materialization/continuation lifecycle completes.
        if (inviteToken) {
          localStorage.removeItem("gateway.invite.token");
        }

        // APP-REC-006C: non_member with no pending invitation → invitation-only screen.
        if (runtimeState.outcome === "non_member") {
                    trackEvent("auth_completed", {
            mode,
            has_referrer: Boolean(variables.referrerEmail),
            has_invite: Boolean(variables.inviteToken),
          });
          setShowInvitationOnly(true);
          return;
        }

                  trackEvent("auth_completed", {
            mode,
            has_referrer: Boolean(variables.referrerEmail),
            has_invite: Boolean(variables.inviteToken),
          });
        setLocation(destination);
      }
    },
    onError: (error: Error) => {
      trackEvent("auth_failed", { mode });
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
        inviteToken: localStorage.getItem("gateway.invite.token") || undefined,
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

  // APP-REC-006C — Invitation-only information screen.
  // Shown when authentication succeeds but the user has no membership
  // and no pending invitation. Replaces the previous signup loop.
  if (showInvitationOnly) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <UserCheck className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle>{authText("Membership Is By Invitation")}</CardTitle>
            <CardDescription>
              {authText("Your account has been created, but Lambsbook Cooperative is a members-only community.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Lambsbook Cooperative</strong>{" "}
                {authText("is a trusted relationship network. Membership is extended only through personal invitation from an existing member who knows and trusts you.")}
              </p>
              <p>
                {authText("This keeps the community high-trust and ensures every member is accountable to someone already inside.")}
              </p>
              <p>
                {authText("To join, ask an existing member to send you a personal invitation link.")}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-invitation-return-home"
              >
                {authText("Return Home")}
              </Button>
              <Button
                className="w-full"
                onClick={() => setLocation("/hub/login")}
                data-testid="button-invitation-sign-in"
              >
                {authText("Sign In")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>{authText("Account Created")}</CardTitle>
            <CardDescription>
              {authText("Please check")} <strong>{email}</strong> {authText("for a confirmation link")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {authText("Click the link in your email to confirm your account, then you can log in with your password.")}
            </p>
            <Button
              variant="outline"
              onClick={() => setLocation(isRegularUserFlow ? "/hub/login?account=user" : "/hub/login")}
              data-testid="button-go-to-login"
            >
              {authText("Go to Login")}
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
            <CardTitle>{authText("Check Your Email")}</CardTitle>
            <CardDescription>
              {authText("We've sent a password reset link to")} <strong>{forgotEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {authText("Click the link in your email to reset your password. The link will expire in 1 hour.")}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setShowForgotPassword(false);
              }}
              data-testid="button-back-to-login"
            >
              {authText("Back to Login")}
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
            {authText("Back to Login")}
          </Button>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-md bg-primary flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>{authText("Reset Password")}</CardTitle>
              <CardDescription>
                {authText("Enter your email and we'll send you a link to reset your password")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">{authText("Email Address")}</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder={authText("placeholder:you@example.com")}
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
                      {authText("Sending...")}
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {authText("Send Reset Link")}
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
            {authText("Back to Hub")}
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-md bg-primary flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-bold">LB</span>
            </div>
            <CardTitle>
              {mode === "signup"
                ? isRegularUserFlow
                  ? authIntro.userSignupTitle
                  : authIntro.memberSignupTitle
                : authIntro.loginTitle}
            </CardTitle>
            <CardDescription>
              {mode === "signup"
                ? isRegularUserFlow
                  ? authIntro.userSignupDescription
                  : authIntro.memberSignupDescription
                : isRegularUserFlow
                  ? authIntro.userLoginDescription
                  : authIntro.memberLoginDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{authText("Full Name *")}</Label>
                    <Input
                      id="fullName"
                      placeholder={authText("placeholder:Enter your full name")}
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
                    <Label htmlFor="username">{authText("Username *")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder={authText("placeholder:your_username")}
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
                        {authText("3-50 characters: letters, numbers, underscores, hyphens")}
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
                        {authText("Include country code (e.g., +84 for Vietnam)")}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{authText("Email Address *")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={authText("placeholder:you@example.com")}
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
                <Label htmlFor="password">{authText("Password *")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={authText("placeholder:Enter your password")}
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
                    {authText("At least 8 characters")}
                  </p>
                ) : null}
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{authText("Confirm Password *")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={authText("placeholder:Re-enter your password")}
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
                    {authText("Referrer Email (Optional)")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="referrerEmail"
                      type="email"
                      placeholder={authText("placeholder:referrer@example.com")}
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
                        {authText("You'll be connected to:")} {referrerValidation.name}
                      </p>
                    )}
                  {referrerValidation.valid === false && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {authText("No member found with this email. You can still sign up and add a referrer later.")}
                    </p>
                  )}
                  {referrerValidation.valid === null &&
                    !referrerValidation.checking && (
                      <p className="text-xs text-muted-foreground">
                        {authText("Know someone in the Hub? Enter their email to connect as their referral.")}
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
                    {mode === "signup" ? authText("Create Account") : "Log In"}
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
                    {authText("Forgot password?")}
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "signup" ? (
                <p className="text-muted-foreground">
                  {authText("Already have an account?")}{" "}
                  <Link
                    href="/hub/login"
                    className="text-primary hover:underline"
                    data-testid="link-login"
                  >
                    {authText("Log in")}
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {authText("New to Lambsbook Hub?")}{" "}
                  <Link
                    href="/hub/signup"
                    className="text-primary hover:underline"
                    data-testid="link-signup"
                  >
                    {authText("Create an account")}
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
