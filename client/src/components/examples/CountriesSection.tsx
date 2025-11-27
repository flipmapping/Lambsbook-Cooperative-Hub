import { LanguageProvider } from '@/lib/LanguageContext';
import { CountriesSection } from '../CountriesSection';

export default function CountriesSectionExample() {
  return (
    <LanguageProvider>
      <CountriesSection onContact={() => console.log('Contact clicked')} />
    </LanguageProvider>
  );
}
