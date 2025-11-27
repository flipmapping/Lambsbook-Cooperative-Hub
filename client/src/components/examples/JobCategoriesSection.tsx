import { LanguageProvider } from '@/lib/LanguageContext';
import { JobCategoriesSection } from '../JobCategoriesSection';

export default function JobCategoriesSectionExample() {
  return (
    <LanguageProvider>
      <JobCategoriesSection />
    </LanguageProvider>
  );
}
