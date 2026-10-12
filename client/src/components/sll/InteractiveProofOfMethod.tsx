import { useEffect, useState, type FormEvent } from "react";
import { Sparkles, BookOpen, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { createClient } from "@/lib/supabase/client";

type Locale = "en" | "vi" | "zh";
type Mode = "GENERAL_ENGLISH" | "IELTS_PREPARATION";
type Level = "basic" | "developed" | "extended" | "analytical";

interface GeneratedExample {
  model_answer: string;
  semantic_tree: Array<{
    idea: string;
    relationship: string;
    meaning_support: string;
  }>;
  meaning_support: string;
  adaptation_prompt: string;
}

const copy = {
  en: {
    eyebrow: "SLL English learning",
    title: "See how an answer is built",
    intro: "Enter a question or task. Gemini will create an English model answer and show the semantic ideas behind it.",
    mode: "Learning mode",
    general: "General English",
    ielts: "IELTS preparation",
    level: "Example depth",
    levels: ["Basic", "Developed", "Extended", "Analytical"],
    task: "Your question or task",
    placeholder: "Example: What makes a good day at work?",
    generate: "Generate my example",
    generating: "Building your example…",
    answer: "English model answer",
    tree: "How the ideas connect",
    support: "Meaning support",
    adapt: "Try a related task",
    disclosure: "Your prompt is sent to Google Gemini to generate this learning example. The app does not save it.",
    learnMore: "Learn more about SLL",
    learnMoreTitle: "Build meaning before building sentences",
    learnMoreBody: "SLL helps learners organize a topic into connected ideas, then see how those ideas become a clear English answer. Explore examples for General English and IELTS preparation.",
    accountBenefit: "Create a free user account—no invitation or membership required—to unlock unlimited SLL examples.",
    visitorAllowance: "Visitors can generate 3 examples every 24 hours. Create a free user account for unlimited SLL access.",
    createAccount: "Create a free user account",
    signupTitle: "Create your free user account",
    signupName: "Name (optional)",
    signupEmail: "Email",
    signupPassword: "Password",
    signupSubmit: "Create account",
    signupSuccess: "Your account is ready. You now have unlimited SLL access.",
    signupCheckEmail: "Check your email to confirm your account, then return here and sign in.",
    resendConfirmation: "Resend confirmation email",
    confirmationResent: "Confirmation email sent. Check your inbox.",
    resendFailed: "Could not resend the email. Check the address and try again.",
    signupError: "We could not create the account. Check your details and try again.",
    guestLimit: "You have used your three free examples for today. Create a free user account—no invitation or membership required—for unlimited SLL use.",
    ebooks: "Download the two free SLL ebooks",
    note: "Learning example only. It is not an official IELTS answer, score, or assessment.",
    error: "The example could not be generated. Please try again.",
  },
  vi: {
    eyebrow: "Học tiếng Anh với SLL",
    title: "Xem cách xây dựng câu trả lời",
    intro: "Nhập câu hỏi hoặc đề bài. Gemini sẽ tạo câu trả lời mẫu bằng tiếng Anh và trình bày các ý nghĩa phía sau.",
    mode: "Chế độ học",
    general: "Tiếng Anh tổng quát",
    ielts: "Luyện thi IELTS",
    level: "Độ sâu ví dụ",
    levels: ["Cơ bản", "Phát triển", "Mở rộng", "Phân tích"],
    task: "Câu hỏi hoặc đề bài",
    placeholder: "Ví dụ: Điều gì tạo nên một ngày làm việc tốt?",
    generate: "Tạo ví dụ cho tôi",
    generating: "Đang tạo ví dụ…",
    answer: "Câu trả lời mẫu bằng tiếng Anh",
    tree: "Các ý tưởng kết nối như thế nào",
    support: "Hỗ trợ ý nghĩa",
    adapt: "Thử một đề bài liên quan",
    disclosure: "Câu hỏi của bạn được gửi đến Google Gemini để tạo ví dụ học tập này. Ứng dụng không lưu nội dung.",
    learnMore: "Tìm hiểu thêm về SLL",
    learnMoreTitle: "Xây dựng ý nghĩa trước khi viết câu",
    learnMoreBody: "SLL giúp người học sắp xếp chủ đề thành các ý tưởng có liên kết, rồi xem cách phát triển chúng thành câu trả lời tiếng Anh rõ ràng. Khám phá ví dụ cho tiếng Anh tổng quát và luyện thi IELTS.",
    accountBenefit: "Tạo tài khoản người dùng miễn phí, không cần thư mời hay trở thành thành viên, để sử dụng SLL không giới hạn.",
    visitorAllowance: "Khách có thể tạo 3 ví dụ mỗi 24 giờ. Tạo tài khoản người dùng miễn phí để sử dụng SLL không giới hạn.",
    createAccount: "Tạo tài khoản người dùng miễn phí",
    signupTitle: "Tạo tài khoản người dùng miễn phí",
    signupName: "Tên (không bắt buộc)",
    signupEmail: "Email",
    signupPassword: "Mật khẩu",
    signupSubmit: "Tạo tài khoản",
    signupSuccess: "Tài khoản đã sẵn sàng. Bạn có thể sử dụng SLL không giới hạn.",
    signupCheckEmail: "Hãy kiểm tra email để xác nhận tài khoản, sau đó quay lại đăng nhập.",
    resendConfirmation: "Gửi lại email xác nhận",
    confirmationResent: "Đã gửi lại email xác nhận. Hãy kiểm tra hộp thư.",
    resendFailed: "Không thể gửi lại email. Hãy kiểm tra địa chỉ và thử lại.",
    signupError: "Không thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.",
    guestLimit: "Bạn đã dùng hết ba ví dụ miễn phí hôm nay. Tạo tài khoản người dùng miễn phí, không cần thư mời hay trở thành thành viên, để sử dụng SLL không giới hạn.",
    ebooks: "Tải hai ebook SLL miễn phí",
    note: "Chỉ là ví dụ học tập, không phải câu trả lời, điểm số hay đánh giá IELTS chính thức.",
    error: "Không thể tạo ví dụ. Vui lòng thử lại.",
  },
  zh: {
    eyebrow: "SLL 英语学习",
    title: "了解答案如何构建",
    intro: "输入问题或题目。Gemini 将生成英语示例答案，并展示其背后的语义思路。",
    mode: "学习模式",
    general: "通用英语",
    ielts: "IELTS 备考",
    level: "示例深度",
    levels: ["基础", "发展", "扩展", "分析"],
    task: "你的问题或题目",
    placeholder: "例如：怎样的一天才算工作顺利？",
    generate: "生成示例",
    generating: "正在生成示例…",
    answer: "英语示例答案",
    tree: "思路之间的联系",
    support: "含义辅助说明",
    adapt: "尝试相关题目",
    disclosure: "你的问题会发送给 Google Gemini 以生成学习示例。应用不会保存内容。",
    learnMore: "了解更多 SLL",
    learnMoreTitle: "先构建意义，再组织句子",
    learnMoreBody: "SLL 帮助学习者将主题整理为相互关联的想法，再了解如何把这些想法发展成清晰的英语回答。可探索通用英语和 IELTS 备考示例。",
    accountBenefit: "免费创建普通用户账户即可无限使用 SLL；无需邀请，也不会成为会员。",
    visitorAllowance: "访客每 24 小时可生成 3 个示例。免费创建用户账户即可无限使用 SLL。",
    createAccount: "免费创建用户账户",
    signupTitle: "创建免费用户账户",
    signupName: "姓名（可选）",
    signupEmail: "电子邮箱",
    signupPassword: "密码",
    signupSubmit: "创建账户",
    signupSuccess: "账户已就绪。现在可以无限使用 SLL。",
    signupCheckEmail: "请查收邮件并确认账户，然后返回此处登录。",
    resendConfirmation: "重新发送确认邮件",
    confirmationResent: "确认邮件已重新发送，请检查收件箱。",
    resendFailed: "无法重新发送邮件，请检查邮箱地址后重试。",
    signupError: "无法创建账户，请检查填写的信息后重试。",
    guestLimit: "你今天的三个免费示例已用完。免费创建普通用户账户即可无限使用 SLL；无需邀请，也不会成为会员。",
    ebooks: "下载两本免费的 SLL 电子书",
    note: "仅供学习参考，不是官方 IELTS 答案、分数或评估。",
    error: "无法生成示例，请重试。",
  },
} as const;

export function InteractiveProofOfMethod() {
  const { language } = useLanguage();
  const locale: Locale = language === "vi" || language === "zh" ? language : "en";
  const t = copy[locale];
  const [mode, setMode] = useState<Mode>("GENERAL_ENGLISH");
  const [level, setLevel] = useState<Level>("developed");
  const [task, setTask] = useState("");
  const [result, setResult] = useState<GeneratedExample | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(() => window.location.hash === "#sll-signup");
  const [signupBusy, setSignupBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [signupStatus, setSignupStatus] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [failureCode, setFailureCode] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsSignedIn(Boolean(data.session?.access_token));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.access_token));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(event: FormEvent) {
    event.preventDefault();
    if (signupBusy) return;
    setSignupBusy(true);
    setSignupStatus("");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: "user",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) throw new Error("SIGNUP_FAILED");

      const session = payload.data?.session;
      if (session?.access_token && session?.refresh_token) {
        const { error } = await createClient().auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        if (error) throw error;
        setIsSignedIn(true);
        setShowSignup(false);
        setSignupStatus(t.signupSuccess);
      } else {
        setSignupStatus(t.signupCheckEmail);
      }
    } catch {
      setSignupStatus(t.signupError);
    } finally {
      setSignupBusy(false);
    }
  }

  async function resendSignupConfirmation() {
    if (resendBusy || !signupEmail.trim()) return;
    setResendBusy(true);
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email: signupEmail.trim(),
      });
      if (error) throw error;
      setSignupStatus(t.confirmationResent);
    } catch {
      setSignupStatus(t.resendFailed);
    } finally {
      setResendBusy(false);
    }
  }

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (busy || task.trim().length < 4) return;
    setBusy(true);
    setFailed(false);
    setFailureCode("");
    setResult(null);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      const response = await fetch("/api/sll/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          prompt: task.trim(),
          mode,
          level,
          supportLanguage: locale,
        }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(typeof problem.code === "string" ? problem.code : "GENERATION_FAILED");
      }
      setResult(await response.json() as GeneratedExample);
    } catch (error) {
      setFailureCode(error instanceof Error ? error.message : "GENERATION_FAILED");
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-muted/30 px-4 py-16" aria-labelledby="sll-proof-title">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="text-center">
          <Sparkles className="mx-auto mb-3 h-7 w-7 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t.eyebrow}</p>
          <h2 id="sll-proof-title" className="mt-2 text-3xl font-bold">{t.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t.intro}</p>
        </header>

        <div className="space-y-3 rounded-xl border bg-background p-5">
          <button type="button" className="font-medium text-primary underline"
            aria-expanded={showLearnMore}
            onClick={() => setShowLearnMore((shown) => !shown)}>
            {t.learnMore}
          </button>
          {showLearnMore && (
            <div>
              <h3 className="font-semibold">{t.learnMoreTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.learnMoreBody}</p>
            </div>
          )}
          <p className="text-sm">{isSignedIn ? t.signupSuccess : t.accountBenefit}</p>
          {!isSignedIn && <p className="text-sm text-muted-foreground">{t.visitorAllowance}</p>}
          {!isSignedIn && (
            <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => setShowSignup((shown) => !shown)}>
              {t.createAccount}
            </button>
          )}
          <a className="inline-flex text-sm font-medium text-primary underline"
            href="https://drive.google.com/drive/folders/1i16uFbYFiiJZdSnYccNa60olgSbz6LSD?usp=sharing"
            target="_blank" rel="noopener noreferrer">
            {t.ebooks}
          </a>
          {showSignup && !isSignedIn && (
            <form id="sll-signup" onSubmit={signUp} className="grid gap-3 border-t pt-4 sm:grid-cols-2">
              <h3 className="font-semibold sm:col-span-2">{t.signupTitle}</h3>
              <label className="grid gap-1 text-sm">{t.signupName}
                <input className="rounded-md border bg-background p-2" autoComplete="name"
                  value={signupName} onChange={(event) => setSignupName(event.target.value)} maxLength={120} />
              </label>
              <label className="grid gap-1 text-sm">{t.signupEmail}
                <input className="rounded-md border bg-background p-2" type="email" required autoComplete="email"
                  value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} maxLength={254} />
              </label>
              <label className="grid gap-1 text-sm sm:col-span-2">{t.signupPassword}
                <input className="rounded-md border bg-background p-2" type="password" required minLength={8}
                  autoComplete="new-password" value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)} maxLength={128} />
              </label>
              <button type="submit" disabled={signupBusy}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:col-span-2">
                {signupBusy ? t.generating : t.signupSubmit}
              </button>
            </form>
          )}
          {signupStatus && <p role="status" className="text-sm">{signupStatus}</p>}
          {signupStatus === t.signupCheckEmail && (
            <button type="button" disabled={resendBusy || !signupEmail.trim()}
              className="text-sm font-medium text-primary underline disabled:opacity-60"
              onClick={resendSignupConfirmation}>
              {t.resendConfirmation}
            </button>
          )}
        </div>

        <form onSubmit={generate} className="space-y-4 rounded-xl border bg-background p-5 md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              {t.mode}
              <select className="mt-1 w-full rounded-md border bg-background p-2"
                value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="GENERAL_ENGLISH">{t.general}</option>
                <option value="IELTS_PREPARATION">{t.ielts}</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              {t.level}
              <select className="mt-1 w-full rounded-md border bg-background p-2"
                value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                {(["basic", "developed", "extended", "analytical"] as const).map((value, index) => (
                  <option key={value} value={value}>{t.levels[index]}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium">
            {t.task}
            <textarea className="mt-1 min-h-28 w-full rounded-md border bg-background p-3"
              value={task} onChange={(e) => setTask(e.target.value)}
              placeholder={t.placeholder} minLength={4} maxLength={2000} required />
          </label>

          <p className="text-xs text-muted-foreground">{t.disclosure}</p>
          <button type="submit" disabled={busy || task.trim().length < 4}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {busy ? t.generating : <><BookOpen className="h-4 w-4" aria-hidden="true" />{t.generate}</>}
          </button>
        </form>

        {failed && <p role="alert" className="rounded-md border border-destructive/40 p-4 text-sm">{failureCode === "GUEST_DAILY_LIMIT" ? t.guestLimit : t.error}</p>}

        {result && (
          <article className="space-y-5 rounded-xl border bg-background p-5 md:p-7" aria-live="polite">
            <section>
              <h3 className="font-semibold">{t.answer}</h3>
              <p className="mt-2 text-lg leading-relaxed">{result.model_answer}</p>
            </section>
            <section>
              <h3 className="font-semibold">{t.tree}</h3>
              <ol className="mt-3 space-y-3">
                {result.semantic_tree.map((node, index) => (
                  <li key={`${index}-${node.idea}`} className="rounded-lg border p-4">
                    <p className="font-medium">{node.idea}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{node.relationship}</p>
                    <p className="mt-2 text-sm">{node.meaning_support}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="rounded-lg bg-primary/5 p-4">
              <h3 className="font-semibold">{t.support}</h3>
              <p className="mt-1 text-sm">{result.meaning_support}</p>
              <button type="button" className="mt-3 text-sm font-medium text-primary underline"
                onClick={() => { setTask(result.adaptation_prompt); setResult(null); }}>
                {t.adapt}
              </button>
            </section>
            <p className="text-xs text-muted-foreground">{t.note}</p>
          </article>
        )}
      </div>
    </section>
  );
}
