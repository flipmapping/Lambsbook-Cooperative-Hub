import { LanguageProvider } from '@/lib/LanguageContext';
import { Header } from '../Header';

export default function HeaderExample() {
  return (
    <LanguageProvider>
      <Header onNavigate={(section) => console.log('Navigate to:', section)} />
    </LanguageProvider>
  );
}
