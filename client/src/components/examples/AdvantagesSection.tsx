import { LanguageProvider } from '@/lib/LanguageContext';
import { AdvantagesSection } from '../AdvantagesSection';

export default function AdvantagesSectionExample() {
  return (
    <LanguageProvider>
      <AdvantagesSection />
    </LanguageProvider>
  );
}
