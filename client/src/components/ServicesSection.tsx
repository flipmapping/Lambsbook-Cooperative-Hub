import { Briefcase, Users, GraduationCap, Award, FileText, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/LanguageContext';

export function ServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Briefcase,
      title: t('service_work_visa'),
      description: t('service_work_visa_desc'),
    },
    {
      icon: Users,
      title: t('service_job_placement'),
      description: t('service_job_placement_desc'),
    },
    {
      icon: GraduationCap,
      title: t('service_study_abroad'),
      description: t('service_study_abroad_desc'),
    },
    {
      icon: Award,
      title: t('service_scholarship'),
      description: t('service_scholarship_desc'),
    },
    {
      icon: FileText,
      title: t('service_visa'),
      description: t('service_visa_desc'),
    },
    {
      icon: Building,
      title: t('service_immigration'),
      description: t('service_immigration_desc'),
    },
  ];

  return (
    <section className="py-20" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('services_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('services_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-service-${index}`}>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
