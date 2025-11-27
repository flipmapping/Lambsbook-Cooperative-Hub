import { useState } from 'react';
import { Menu, X, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '@/lib/LanguageContext';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { key: 'home', label: t('nav_home') },
    { key: 'eb3', label: t('nav_eb3') },
    { key: 'services', label: t('nav_services') },
    { key: 'countries', label: t('nav_countries') },
    { key: 'success', label: t('nav_success') },
    { key: 'faq', label: t('nav_faq') },
    { key: 'contact', label: t('nav_contact') },
  ];

  const handleNavClick = (section: string) => {
    onNavigate(section);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">Other Path Travel</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Partner of Glory International</span>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(item.key)}
              data-testid={`nav-${item.key}`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button
            className="hidden sm:inline-flex"
            size="sm"
            onClick={() => handleNavClick('contact')}
            data-testid="button-header-consultation"
          >
            {t('hero_consultation')}
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavClick(item.key)}
                    data-testid={`mobile-nav-${item.key}`}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  className="mt-4"
                  onClick={() => handleNavClick('contact')}
                  data-testid="button-mobile-consultation"
                >
                  {t('hero_consultation')}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
