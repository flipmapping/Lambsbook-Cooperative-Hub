import { LanguageProvider } from '@/lib/LanguageContext';
import { HeroSection } from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <LanguageProvider>
      <HeroSection onNavigate={(section) => console.log('Navigate to:', section)} />
    </LanguageProvider>
  );
}
