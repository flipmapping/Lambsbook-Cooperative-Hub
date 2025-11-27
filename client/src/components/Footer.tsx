import { Plane } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  const services = [
    t('service_work_visa'),
    t('service_job_placement'),
    t('service_study_abroad'),
    t('service_scholarship'),
    t('service_visa'),
  ];

  const countries = ['USA', 'Canada', 'UK', 'Australia', 'Vietnam', 'Malaysia', 'Taiwan', 'China'];

  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">Other Path Travel</span>
                <span className="text-[10px] text-muted-foreground">Partner of Glory International</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer_about_text')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer_services')}</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer_countries')}</h4>
            <ul className="space-y-2">
              {countries.map((country, index) => (
                <li key={index}>
                  <a href="#countries" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {country}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer_contact')}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: info@otherpathtravel.com</p>
              <p>WhatsApp: +1 (234) 567-890</p>
              <p>Zalo: +84 123 456 789</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Other Path Travel. {t('footer_rights')}</p>
        </div>
      </div>
    </footer>
  );
}
