import { LanguageProvider } from '@/lib/LanguageContext';
import { StudyAbroadSection } from '../StudyAbroadSection';

export default function StudyAbroadSectionExample() {
  return (
    <LanguageProvider>
      <StudyAbroadSection onContact={() => console.log('Contact clicked')} />
    </LanguageProvider>
  );
}
