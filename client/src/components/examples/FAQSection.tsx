import { LanguageProvider } from '@/lib/LanguageContext';
import { FAQSection } from '../FAQSection';

export default function FAQSectionExample() {
  return (
    <LanguageProvider>
      <FAQSection />
    </LanguageProvider>
  );
}
