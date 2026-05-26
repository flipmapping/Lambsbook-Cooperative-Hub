import { LanguageProvider } from '@/lib/LanguageContext';
import { ProcessSection } from '../ProcessSection';

export default function ProcessSectionExample() {
  return (
    <LanguageProvider>
      <ProcessSection />
    </LanguageProvider>
  );
}
