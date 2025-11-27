import { LanguageProvider } from '@/lib/LanguageContext';
import { EB3Categories } from '../EB3Categories';

export default function EB3CategoriesExample() {
  return (
    <LanguageProvider>
      <EB3Categories onLearnMore={() => console.log('Learn more clicked')} />
    </LanguageProvider>
  );
}
