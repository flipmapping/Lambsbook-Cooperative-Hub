import { LanguageProvider } from '@/lib/LanguageContext';
import { ContactSection } from '../ContactSection';

export default function ContactSectionExample() {
  return (
    <LanguageProvider>
      <ContactSection />
    </LanguageProvider>
  );
}
