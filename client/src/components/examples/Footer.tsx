import { LanguageProvider } from '@/lib/LanguageContext';
import { Footer } from '../Footer';

export default function FooterExample() {
  return (
    <LanguageProvider>
      <Footer />
    </LanguageProvider>
  );
}
