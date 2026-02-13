import { Link } from 'wouter';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '@/lib/LanguageContext';
import { useHubTranslation } from '@/lib/hubTranslations';

interface HubHeaderProps {
  onNavigate?: (section: string) => void;
  brandName?: string;
  brandSubtitle?: string;
  homeLink?: string;
}

export function HubHeader({ 
  onNavigate, 
  brandName = 'Lambsbook Hub',
  brandSubtitle,
  homeLink = '/hub'
}: HubHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);

  const handleNavClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href={homeLink}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">{brandName}</span>
              {brandSubtitle && (
                <span className="text-[10px] text-muted-foreground leading-tight">{brandSubtitle}</span>
              )}
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
          <Link href="/hub/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" data-testid="button-header-signin">
              {t('hub_login')}
            </Button>
          </Link>
          <Link href="/hub/signup">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" data-testid="button-header-join">
              {t('hub_join_now')}
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
                  <Link href="/hub/login">
                    <Button
                      variant="ghost"
                      className="justify-start w-full mt-2"
                      onClick={() => setIsOpen(false)}
                      data-testid="mobile-nav-signin"
                    >
                      {t('hub_login')}
                    </Button>
                  </Link>
                  <Link href="/hub/signup">
                    <Button
                      variant="outline"
                      className="justify-start w-full"
                      onClick={() => setIsOpen(false)}
                      data-testid="mobile-nav-join"
                    >
                      {t('hub_join_now')}
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
