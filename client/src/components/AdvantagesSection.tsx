import { Briefcase, Scale, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/LanguageContext';

export function AdvantagesSection() {
  const { t } = useLanguage();

  const advantages = [
    {
      icon: Briefcase,
      title: t('advantages_jobs'),
      description: t('advantages_jobs_desc'),
    },
    {
      icon: Scale,
      title: t('advantages_lawyers'),
      description: t('advantages_lawyers_desc'),
    },
    {
      icon: HeartHandshake,
      title: t('advantages_support'),
      description: t('advantages_support_desc'),
    },
    {
      icon: CheckCircle2,
      title: t('advantages_onestop'),
      description: t('advantages_onestop_desc'),
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('advantages_title')}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {advantages.map((advantage, index) => (
            <Card key={index} className="text-center" data-testid={`card-advantage-${index}`}>
              <CardHeader className="pb-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-3">
                  <advantage.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">{advantage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{advantage.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
