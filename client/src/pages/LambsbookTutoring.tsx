import { useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Sparkles,
  CheckCircle2,
  Users,
  ArrowRight,
  MessageSquare,
  GraduationCap,
  Zap
} from 'lucide-react';
import { HubHeader } from '@/components/HubHeader';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';
import { InteractiveProofOfMethod } from '@/components/sll/InteractiveProofOfMethod';


const pageCopy = {
  en: {
    header: {
      title: "Lambsbook Online Tutoring",
      subtitle: "Learn with verified tutors, improve faster with AI feedback, and join a collaborative education hub.",
      getStarted: "Get Started with Lambsbook",
      tryAi: "Try AI Feedback Free",
    },
    aiFeedback: {
      badge: "Member Benefit",
      title: "Unlimited AI English Feedback",
      description: "Practice English speaking and writing with our AI Feedback Engine. Get detailed analysis and suggestions for improvement.",
      features: ["Instant feedback on speaking and writing", "Unlimited usage for members", "For students, teachers, and tutors", "IELTS, Business English, and presentation frameworks"],
      callout: "Available when you join Lambsbook, with no extra fees.",
      sllBenefitTitle: "SLL English learning",
      sllVisitorLimit: "Visitors can create 3 examples every 24 hours.",
      sllAccountBenefit: "A free user account unlocks unlimited SLL examples. No invitation or membership required.",
      sllCta: "Explore SLL and create a free user account",
      visualTitle: "AI Feedback",
      visualSubtitle: "Instant Analysis",
    },
    whyJoin: {
      title: "Why Join Lambsbook Tutoring",
      description: "Join learners improving their skills through Lambsbook's collaborative education platform.",
      benefits: ["Learn from verified Lambsbook tutors", "Access free trial classes every week", "Affordable monthly subscription", "Join a collaborative education hub", "Connect with students and educators worldwide", "Flexible scheduling across time zones"],
    },
    onboarding: {
      title: "How Onboarding Works",
      description: "Getting started is easy. Follow these steps to join our education community.",
      steps: [
        { number: 1, title: "Join Lambsbook as a Member", description: "Sign up for free and become part of our education community." },
        { number: 2, title: "Explore Tutors and Trial Classes", description: "Browse verified tutors and attend free trial classes every week." },
        { number: 3, title: "Subscribe for Full Access", description: "Unlock tutoring sessions and collaboration benefits with an affordable subscription." },
      ],
    },
    cta: {
      title: "Ready to Start Learning?",
      description: "Join Lambsbook for access to verified tutors, free trial classes, and AI feedback.",
      back: "Back to Education Hub",
    },
    tutors: {
      title: "Verified Lambsbook Tutors",
      description: "Our tutors are verified and trained to provide quality education. Whether you are learning English, preparing for IELTS, or developing professional skills, we can help you find a tutor.",
      badges: ["Background Verified", "Teaching Certified", "Native and Non-Native Speakers"],
    },
    footer: { hub: "Lambsbook Hub", education: "Education Hub", ai: "AI Feedback Tool" },
  },
  vi: {
    header: {
      title: "Gia sư trực tuyến Lambsbook",
      subtitle: "Học cùng gia sư đã xác minh, tiến bộ nhanh hơn nhờ phản hồi AI và tham gia cộng đồng giáo dục hợp tác.",
      getStarted: "Bắt đầu với Lambsbook",
      tryAi: "Dùng thử phản hồi AI miễn phí",
    },
    aiFeedback: {
      badge: "Quyền lợi thành viên",
      title: "Phản hồi tiếng Anh bằng AI không giới hạn",
      description: "Luyện nói và viết tiếng Anh với công cụ phản hồi AI. Nhận phân tích chi tiết và gợi ý cải thiện.",
      features: ["Phản hồi tức thì về kỹ năng nói và viết", "Thành viên được sử dụng không giới hạn", "Phù hợp với học viên, giáo viên và gia sư", "Khung luyện IELTS, tiếng Anh thương mại và thuyết trình"],
      callout: "Có thể sử dụng khi tham gia Lambsbook, không mất thêm phí.",
      sllBenefitTitle: "Học tiếng Anh với SLL",
      sllVisitorLimit: "Khách có thể tạo 3 ví dụ mỗi 24 giờ.",
      sllAccountBenefit: "Tài khoản người dùng miễn phí mở khóa SLL không giới hạn. Không cần thư mời hay trở thành thành viên.",
      sllCta: "Tìm hiểu SLL và tạo tài khoản miễn phí",
      visualTitle: "Phản hồi AI",
      visualSubtitle: "Phân tích tức thì",
    },
    whyJoin: {
      title: "Vì sao nên tham gia gia sư Lambsbook",
      description: "Cùng cộng đồng giáo dục hợp tác của Lambsbook cải thiện kỹ năng.",
      benefits: ["Học cùng gia sư Lambsbook đã xác minh", "Tham gia lớp học thử miễn phí mỗi tuần", "Gói đăng ký hằng tháng hợp lý", "Tham gia cộng đồng giáo dục hợp tác", "Kết nối với học viên và nhà giáo dục trên toàn thế giới", "Lịch học linh hoạt theo nhiều múi giờ"],
    },
    onboarding: {
      title: "Các bước bắt đầu",
      description: "Bắt đầu thật dễ dàng. Hãy làm theo các bước sau để tham gia cộng đồng giáo dục.",
      steps: [
        { number: 1, title: "Tham gia Lambsbook", description: "Đăng ký miễn phí và trở thành thành viên cộng đồng giáo dục." },
        { number: 2, title: "Tìm gia sư và lớp học thử", description: "Tìm hiểu gia sư đã xác minh và tham gia lớp học thử miễn phí hằng tuần." },
        { number: 3, title: "Đăng ký quyền truy cập đầy đủ", description: "Mở khóa các buổi học gia sư và quyền lợi hợp tác với mức phí hợp lý." },
      ],
    },
    cta: {
      title: "Sẵn sàng bắt đầu học?",
      description: "Tham gia Lambsbook để học với gia sư đã xác minh, dự lớp học thử miễn phí và sử dụng phản hồi AI.",
      back: "Quay lại Trung tâm Giáo dục",
    },
    tutors: {
      title: "Gia sư Lambsbook đã được xác minh",
      description: "Gia sư của chúng tôi được xác minh và đào tạo để giảng dạy chất lượng. Dù bạn đang học tiếng Anh, luyện thi IELTS hay phát triển kỹ năng nghề nghiệp, chúng tôi có thể giúp bạn tìm gia sư phù hợp.",
      badges: ["Đã xác minh lý lịch", "Có chứng nhận giảng dạy", "Người bản ngữ và không phải bản ngữ"],
    },
    footer: { hub: "Trung tâm Lambsbook", education: "Trung tâm Giáo dục", ai: "Công cụ phản hồi AI" },
  },
  zh: {
    header: {
      title: "Lambsbook 在线辅导",
      subtitle: "与经过核实的导师学习，通过 AI 反馈更快进步，并加入协作式教育社区。",
      getStarted: "开始使用 Lambsbook",
      tryAi: "免费试用 AI 反馈",
    },
    aiFeedback: {
      badge: "会员权益",
      title: "不限次数的 AI 英语反馈",
      description: "使用 AI 反馈引擎练习英语口语和写作，获取详细分析和改进建议。",
      features: ["即时获取口语和写作反馈", "会员可不限次数使用", "适合学生、教师和导师", "涵盖 IELTS、商务英语和演讲框架"],
      callout: "加入 Lambsbook 即可使用，无需额外付费。",
      sllBenefitTitle: "SLL 英语学习",
      sllVisitorLimit: "访客每 24 小时可生成 3 个示例。",
      sllAccountBenefit: "免费用户账户可无限使用 SLL；无需邀请，也无需成为会员。",
      sllCta: "了解 SLL 并创建免费用户账户",
      visualTitle: "AI 反馈",
      visualSubtitle: "即时分析",
    },
    whyJoin: {
      title: "为什么加入 Lambsbook 辅导",
      description: "加入 Lambsbook 协作式教育平台，与其他学习者一起提升技能。",
      benefits: ["向经过核实的 Lambsbook 导师学习", "每周参加免费试听课", "价格合理的月度订阅", "加入协作式教育社区", "与世界各地的学生和教育工作者联系", "灵活安排不同时区的课程"],
    },
    onboarding: {
      title: "如何开始",
      description: "开始很简单。按照以下步骤加入我们的教育社区。",
      steps: [
        { number: 1, title: "成为 Lambsbook 会员", description: "免费注册，加入我们的教育社区。" },
        { number: 2, title: "了解导师和试听课程", description: "浏览经过核实的导师，并每周参加免费试听课。" },
        { number: 3, title: "订阅完整服务", description: "通过价格合理的订阅，解锁辅导课程和协作权益。" },
      ],
    },
    cta: {
      title: "准备好开始学习了吗？",
      description: "加入 Lambsbook，使用经过核实的导师、免费试听课程和 AI 反馈。",
      back: "返回教育中心",
    },
    tutors: {
      title: "经过核实的 Lambsbook 导师",
      description: "我们的导师均经过核实和培训，能够提供优质教学。无论你是在学习英语、准备 IELTS 考试，还是提升职业技能，我们都能帮助你找到合适的导师。",
      badges: ["背景已核实", "具备教学资质", "母语者及非母语者"],
    },
    footer: { hub: "Lambsbook 中心", education: "教育中心", ai: "AI 反馈工具" },
  },
} as const;

export default function LambsbookTutoring() {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);
  const [, navigate] = useLocation();
  const locale = language === "vi" || language === "zh" ? language : "en";
  const copy = pageCopy[locale];

  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    programs: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const handleNavigate = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLoggedIn = () => {
    return localStorage.getItem('hub_member_id') || localStorage.getItem('hub_auth_token');
  };

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate('/hub/dashboard');
    } else {
      navigate('/hub/signup');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HubHeader 
        onNavigate={handleNavigate}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4" data-testid="badge-tutoring">
            <BookOpen className="h-3 w-3 mr-1" />
            Lambsbook.net
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
            {copy.header.title}
          </h1>
          <p className="text-xl text-purple-100 mb-8" data-testid="text-hero-subtitle">
            {copy.header.subtitle}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              data-testid="button-hero-get-started"
            >
              {copy.header.getStarted}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/hub/education/submit">
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-white/10"
                data-testid="button-hero-try-ai"
              >
                {copy.header.tryAi}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Feedback Engine Section */}
      <section ref={sectionRefs.about} className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4" data-testid="badge-ai-feature">
                <Sparkles className="h-3 w-3 mr-1" />
                {copy.aiFeedback.badge}
              </Badge>
              <h2 className="text-3xl font-bold mb-4" data-testid="text-ai-title">
                {copy.aiFeedback.title}
              </h2>
              <p className="text-muted-foreground mb-6" data-testid="text-ai-description">
                {copy.aiFeedback.description}
              </p>
              <ul className="space-y-3 mb-6">
                {copy.aiFeedback.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3" data-testid={`text-ai-feature-${index}`}>
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Card className="bg-primary/5 border-primary/20" data-testid="card-ai-callout">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-primary">
                    {copy.aiFeedback.callout}
                  </p>
                </CardContent>
              </Card>
              <Card className="mt-4 border-primary/20 bg-primary/5" data-testid="card-sll-user-benefit">
                <CardContent className="space-y-2 p-4">
                  <h3 className="font-semibold">{copy.aiFeedback.sllBenefitTitle}</h3>
                  <p className="text-sm text-muted-foreground">{copy.aiFeedback.sllVisitorLimit}</p>
                  <p className="text-sm">{copy.aiFeedback.sllAccountBenefit}</p>
                  <a className="inline-flex text-sm font-medium text-primary underline"
                    href="#sll-proof-title">{copy.aiFeedback.sllCta}</a>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-background flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-primary mx-auto mb-2" />
                      <p className="font-semibold">{copy.aiFeedback.visualTitle}</p>
                      <p className="text-sm text-muted-foreground">{copy.aiFeedback.visualSubtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Zap className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-why-title">
            {copy.whyJoin.title}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {copy.whyJoin.description}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {copy.whyJoin.benefits.map((benefit, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-benefit-${index}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Onboarding Works */}
      <section ref={sectionRefs.programs} className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-4" data-testid="text-onboarding-title">
            {copy.onboarding.title}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {copy.onboarding.description}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {copy.onboarding.steps.map((step) => (
              <Card key={step.number} className="text-center" data-testid={`card-step-${step.number}`}>
                <CardHeader>
                  <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">{copy.cta.title}</h2>
          <p className="mb-8 opacity-90">
            {copy.cta.description}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleGetStarted}
              data-testid="button-cta-get-started"
            >
              {copy.header.getStarted}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/hub/sbu/education">
              <Button 
                size="lg" 
                variant="outline" 
                className="backdrop-blur-sm bg-primary-foreground/10"
                data-testid="button-cta-back"
              >
                {copy.cta.back}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <InteractiveProofOfMethod />

      {/* Tutor Highlight Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4" data-testid="text-tutors-title">
            {copy.tutors.title}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {copy.tutors.description}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Badge variant="outline" className="px-4 py-2" data-testid="badge-verified">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {copy.tutors.badges[0]}
            </Badge>
            <Badge variant="outline" className="px-4 py-2" data-testid="badge-certified">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {copy.tutors.badges[1]}
            </Badge>
            <Badge variant="outline" className="px-4 py-2" data-testid="badge-speakers">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {copy.tutors.badges[2]}
            </Badge>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Lambsbook.net. {t('hub_footer_rights')}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/hub" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-hub">
                {copy.footer.hub}
              </Link>
              <Link href="/hub/sbu/education" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-education">
                {copy.footer.education}
              </Link>
              <Link href="/hub/education/submit" className="text-muted-foreground hover-elevate px-2 py-1 rounded" data-testid="link-footer-ai">
                {copy.footer.ai}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('hub_footer_contact')}: support@lambsbook.net
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
