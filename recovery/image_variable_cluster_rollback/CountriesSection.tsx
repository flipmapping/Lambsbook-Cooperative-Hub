import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';










interface CountriesSectionProps {
  onContact: () => void;
}

export function CountriesSection({ onContact }: CountriesSectionProps) {
  const { t } = useLanguage();

const heroImage = 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200&auto=format&fit=crop';
const hotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop';
const healthcareImage = 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop';
const foodImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';
const studentsImage = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop';
const familyImage = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop';

  const usaImage = 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200&auto=format&fit=crop';
const canadaImage = 'https://images.unsplash.com/photo-1503614472-8c93d56e92c1?q=80&w=1200&auto=format&fit=crop';
const australiaImage = 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=1200&auto=format&fit=crop';
const ukImage = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop';
const vietnamImage = 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop';
const malaysiaImage = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop';
const taiwanImage = 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop';
const chinaImage = 'https://images.unsplash.com/photo-1547981609-4b6bf67db7bf?q=80&w=1200&auto=format&fit=crop';

const countries = [
    { name: 'USA', image: usaImage, flag: '🇺🇸' },
    { name: 'Canada', image: canadaImage, flag: '🇨🇦' },
    { name: 'UK', image: ukImage, flag: '🇬🇧' },
    { name: 'Australia', image: australiaImage, flag: '🇦🇺' },
    { name: 'Vietnam', image: vietnamImage, flag: '🇻🇳' },
    { name: 'Malaysia', image: malaysiaImage, flag: '🇲🇾' },
    { name: 'Taiwan', image: taiwanImage, flag: '🇹🇼' },
    { name: 'China', image: chinaImage, flag: '🇨🇳' },
  ];

  return (
    <section className="py-20 bg-muted/30" id="countries">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('countries_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('countries_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {countries.map((country, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover-elevate transition-all duration-300 cursor-pointer group"
              onClick={onContact}
              data-testid={`card-country-${country.name.toLowerCase()}`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={country.image}
                  alt={country.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-white font-semibold text-lg">{country.name}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <Button variant="ghost" className="w-full text-sm" data-testid={`button-contact-${country.name.toLowerCase()}`}>
                  {t('country_contact')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
