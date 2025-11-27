import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

import studentsImage from '@assets/generated_images/international_students_university_campus.png';

interface StudyAbroadSectionProps {
  onContact: () => void;
}

export function StudyAbroadSection({ onContact }: StudyAbroadSectionProps) {
  const { language } = useLanguage();

  const title = language === 'en' ? 'Study Abroad Programs' 
    : language === 'vi' ? 'Chương trình Du học' 
    : language === 'zh' ? '留学项目' 
    : language === 'ja' ? '留学プログラム'
    : language === 'es' ? 'Programas de Estudio en el Extranjero'
    : language === 'fr' ? 'Programmes d\'Études à l\'Étranger'
    : language === 'pt' ? 'Programas de Estudo no Exterior'
    : 'Study Abroad Programs';

  const subtitle = language === 'en' ? 'Access world-class education and scholarship opportunities' 
    : language === 'vi' ? 'Tiếp cận giáo dục đẳng cấp thế giới và cơ hội học bổng'
    : language === 'zh' ? '获取世界一流的教育和奖学金机会'
    : 'Access world-class education and scholarship opportunities';

  const features = [
    {
      title: language === 'en' ? 'University Admission' : language === 'vi' ? 'Nhập học Đại học' : language === 'zh' ? '大学入学' : 'University Admission',
      description: language === 'en' ? 'Guidance for top universities in USA, UK, Australia, and Canada' : language === 'vi' ? 'Hướng dẫn cho các đại học hàng đầu tại Mỹ, Anh, Úc và Canada' : language === 'zh' ? '美国、英国、澳大利亚和加拿大顶尖大学的指导' : 'Guidance for top universities',
    },
    {
      title: language === 'en' ? 'Scholarship Applications' : language === 'vi' ? 'Đơn xin Học bổng' : language === 'zh' ? '奖学金申请' : 'Scholarship Applications',
      description: language === 'en' ? 'Help securing financial aid and merit-based scholarships' : language === 'vi' ? 'Hỗ trợ đảm bảo hỗ trợ tài chính và học bổng dựa trên thành tích' : language === 'zh' ? '帮助获得财务援助和基于成绩的奖学金' : 'Help securing scholarships',
    },
    {
      title: language === 'en' ? 'Student Visa Support' : language === 'vi' ? 'Hỗ trợ Visa Du học' : language === 'zh' ? '学生签证支持' : 'Student Visa Support',
      description: language === 'en' ? 'Complete visa application assistance and interview prep' : language === 'vi' ? 'Hỗ trợ hoàn chỉnh đơn xin visa và chuẩn bị phỏng vấn' : language === 'zh' ? '完整的签证申请协助和面试准备' : 'Complete visa assistance',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-primary" data-testid={`card-study-feature-${index}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="lg" onClick={onContact} data-testid="button-study-contact">
              {language === 'en' ? 'Get Started' : language === 'vi' ? 'Bắt đầu' : language === 'zh' ? '开始' : 'Get Started'}
            </Button>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={studentsImage}
                alt="International students on campus"
                className="w-full h-auto object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-4">
                  <p className="font-semibold text-sm">
                    {language === 'en' ? 'Over 90% of university seats are reserved for citizens and permanent residents' : language === 'vi' ? 'Hơn 90% số chỗ đại học được dành cho công dân và thường trú nhân' : language === 'zh' ? '超过90%的大学名额保留给公民和永久居民' : 'Over 90% seats reserved for residents'}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {language === 'en' ? 'Become a permanent resident first for easier admissions' : language === 'vi' ? 'Trở thành thường trú nhân trước để nhập học dễ dàng hơn' : language === 'zh' ? '首先成为永久居民，更容易入学' : 'Get green card for easier admission'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
