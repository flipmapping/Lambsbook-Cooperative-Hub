import { GraduationCap, Wrench, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

interface EB3CategoriesProps {
  onLearnMore: () => void;
}

export function EB3Categories({ onLearnMore }: EB3CategoriesProps) {
  const { t } = useLanguage();

  const categories = [
    {
      icon: GraduationCap,
      title: t('eb3_professionals'),
      description: t('eb3_professionals_desc'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Wrench,
      title: t('eb3_skilled'),
      description: t('eb3_skilled_desc'),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Users,
      title: t('eb3_unskilled'),
      description: t('eb3_unskilled_desc'),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <section className="py-20 bg-muted/30" id="eb3">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('eb3_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('eb3_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-eb3-category-${index}`}>
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 rounded-lg ${category.bgColor} flex items-center justify-center mb-4`}>
                  <category.icon className={`h-7 w-7 ${category.color}`} />
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{category.description}</p>
                <Button variant="ghost" className="p-0 h-auto" onClick={onLearnMore} data-testid={`button-learn-more-${index}`}>
                  {t('eb3_learn_more')}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
