import { LanguageProvider } from '@/lib/LanguageContext';
import { SuccessStories } from '../SuccessStories';

export default function SuccessStoriesExample() {
  return (
    <LanguageProvider>
      <SuccessStories />
    </LanguageProvider>
  );
}
