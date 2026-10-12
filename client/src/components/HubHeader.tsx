import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

interface HubHeaderProps {
  onNavigate?: (section: string) => void;
}

export function HubHeader({ onNavigate }: HubHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);
  const authLabelsByLanguage: Record<string, {
    signIn: string;
    userSignIn: string;
    memberSignIn: string;
    createUserAccount: string;
    memberInvitationNote: string;
  }> = {
    en: {
      signIn: "Sign In",
      userSignIn: "User Sign In",
      memberSignIn: "Member Sign In",
      createUserAccount: "Create User Account",
      memberInvitationNote: "Membership is by invitation. Use your invitation link to join.",
    },
    vi: {
      signIn: "Đăng nhập",
      userSignIn: "Người dùng đăng nhập",
      memberSignIn: "Thành viên đăng nhập",
      createUserAccount: "Tạo tài khoản người dùng",
      memberInvitationNote: "Tư cách thành viên cần có thư mời. Hãy dùng liên kết mời để tham gia.",
    },
    zh: {
      signIn: "登录",
      userSignIn: "用户登录",
      memberSignIn: "会员登录",
      createUserAccount: "创建用户账户",
      memberInvitationNote: "会员资格需邀请。请使用邀请链接加入。",
    },
  };
  const authLabels = authLabelsByLanguage[language] ?? authLabelsByLanguage.en;


  const handleNavClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-header-home">
            <img
              src="/assets/logo-lambsbook.png"
              alt="Lambsbook logo"
              className="h-8 w-8 rounded-full object-cover"
              data-testid="img-header-logo"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">Lambsbook Cooperative Hub</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Open Collaboration Economy</span>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {onNavigate && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('about')}
                data-testid="nav-about"
              >
                {t('hub_about')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('programs')}
                data-testid="nav-programs"
              >
                {t('hub_programs')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('contact')}
                data-testid="nav-contact"
              >
                {t('hub_contact')}
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {onNavigate && (
            <Button
              className="hidden sm:inline-flex"
              size="sm"
              onClick={() => handleNavClick('contact')}
              data-testid="button-header-consultation"
            >
              {t('hub_free_consultation')}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex"
                data-testid="button-header-signin">
                {authLabels.signIn}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/hub/login?account=user">{authLabels.userSignIn}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hub/login?account=member">{authLabels.memberSignIn}</Link>
              </DropdownMenuItem>
              <DropdownMenuLabel className="max-w-64 whitespace-normal text-xs font-normal text-muted-foreground">
                {authLabels.memberInvitationNote}
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/hub/signup?account=user">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex"
              data-testid="button-header-join">
              {authLabels.createUserAccount}
            </Button>
          </Link>

          {onNavigate && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <nav className="flex flex-col gap-2 mt-8">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavClick('about')}
                    data-testid="mobile-nav-about"
                  >
                    {t('hub_about')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavClick('programs')}
                    data-testid="mobile-nav-programs"
                  >
                    {t('hub_programs')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavClick('contact')}
                    data-testid="mobile-nav-contact"
                  >
                    {t('hub_contact')}
                  </Button>
                  <Button
                    className="mt-4"
                    onClick={() => handleNavClick('contact')}
                    data-testid="button-mobile-consultation"
                  >
                    {t('hub_free_consultation')}
                  </Button>
                  <Link href="/hub/login?account=user">
                    <Button variant="ghost" className="justify-start w-full mt-2"
                      onClick={() => setIsOpen(false)} data-testid="mobile-nav-user-signin">
                      {authLabels.userSignIn}
                    </Button>
                  </Link>
                  <Link href="/hub/login?account=member">
                    <Button variant="ghost" className="justify-start w-full"
                      onClick={() => setIsOpen(false)} data-testid="mobile-nav-member-signin">
                      {authLabels.memberSignIn}
                    </Button>
                  </Link>
                  <Link href="/hub/signup?account=user">
                    <Button variant="outline" className="justify-start w-full"
                      onClick={() => setIsOpen(false)} data-testid="mobile-nav-join">
                      {authLabels.createUserAccount}
                    </Button>
                  </Link>
                  <p className="px-3 pt-2 text-xs text-muted-foreground">
                    {authLabels.memberInvitationNote}
                  </p>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
