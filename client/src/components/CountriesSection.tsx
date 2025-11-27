import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

import usaImage from '@assets/generated_images/nyc_skyline_with_statue_of_liberty.png';
import canadaImage from '@assets/stock_images/canadian_landscape_w_f2194763.jpg';
import australiaImage from '@assets/stock_images/sydney_opera_house_a_994f1251.jpg';
import ukImage from '@assets/stock_images/london_big_ben_uk_la_dd5ee0fa.jpg';
import vietnamImage from '@assets/stock_images/vietnam_ha_long_bay__2ba05574.jpg';
import malaysiaImage from '@assets/stock_images/malaysia_kuala_lumpu_fe72cecf.jpg';
import taiwanImage from '@assets/stock_images/taiwan_taipei_101_to_50b4deb6.jpg';
import chinaImage from '@assets/stock_images/china_great_wall_sce_6172830d.jpg';

interface CountriesSectionProps {
  onContact: () => void;
}

export function CountriesSection({ onContact }: CountriesSectionProps) {
  const { t } = useLanguage();

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
