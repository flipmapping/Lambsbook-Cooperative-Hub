import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';


interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { t } = useLanguage();

const heroImage = 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200&auto=format&fit=crop';

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
          {t('hero_title')}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t('hero_subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => onNavigate('eb3')}
            className="text-lg px-8"
            data-testid="button-hero-cta"
          >
            {t('hero_cta')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onNavigate('contact')}
            className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            data-testid="button-hero-consultation"
          >
            {t('hero_consultation')}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-white/80">
          <Users className="h-5 w-5" />
          <span>{t('hero_trusted')}</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-white/60 text-sm flex-wrap">
          <span>CTBC University of Technology</span>
          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
          <a href="https://www.ctbctech.edu.tw/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/90 transition-colors">ctbctech.edu.tw</a>
          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
          <span>Tainan, Taiwan</span>
        </div>
      </div>
    </section>
  );
}
