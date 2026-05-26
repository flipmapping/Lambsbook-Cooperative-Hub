import { FileSignature, BookOpen, FileCheck, FileText, Stamp, Home } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export function ProcessSection() {
  const { t } = useLanguage();

  const steps = [
    { icon: FileSignature, title: t('process_step1'), description: t('process_step1_desc') },
    { icon: BookOpen, title: t('process_step2'), description: t('process_step2_desc') },
    { icon: FileCheck, title: t('process_step3'), description: t('process_step3_desc') },
    { icon: FileText, title: t('process_step4'), description: t('process_step4_desc') },
    { icon: Stamp, title: t('process_step5'), description: t('process_step5_desc') },
    { icon: Home, title: t('process_step6'), description: t('process_step6_desc') },
  ];

  return (
    <section className="py-20" id="process">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('process_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('process_subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative" data-testid={`process-step-${index + 1}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && index % 3 !== 2 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%+1rem)] w-8 border-t-2 border-dashed border-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
