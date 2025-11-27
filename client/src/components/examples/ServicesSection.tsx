import { LanguageProvider } from '@/lib/LanguageContext';
import { ServicesSection } from '../ServicesSection';

export default function ServicesSectionExample() {
  return (
    <LanguageProvider>
      <ServicesSection />
    </LanguageProvider>
  );
}
