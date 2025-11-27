import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/LanguageContext';

import hotelImage from '@assets/generated_images/hotel_hospitality_worker_professional.png';
import healthcareImage from '@assets/generated_images/healthcare_caregiver_professional_setting.png';
import foodImage from '@assets/generated_images/food_service_kitchen_worker.png';

export function JobCategoriesSection() {
  const { t, language } = useLanguage();

  const categories = [
    {
      title: language === 'en' ? 'Hotel & Hospitality' : language === 'vi' ? 'Khách sạn & Dịch vụ' : language === 'zh' ? '酒店与服务业' : 'Hotel & Hospitality',
      description: language === 'en' ? 'Front desk, housekeeping, and guest services positions' : language === 'vi' ? 'Vị trí lễ tân, dọn phòng và dịch vụ khách hàng' : language === 'zh' ? '前台、客房服务和客户服务职位' : 'Front desk, housekeeping, and guest services positions',
      image: hotelImage,
    },
    {
      title: language === 'en' ? 'Healthcare & Caregiving' : language === 'vi' ? 'Y tế & Chăm sóc' : language === 'zh' ? '医疗保健与护理' : 'Healthcare & Caregiving',
      description: language === 'en' ? 'Home care aides, nursing assistants, and patient care' : language === 'vi' ? 'Nhân viên chăm sóc tại nhà, trợ lý điều dưỡng và chăm sóc bệnh nhân' : language === 'zh' ? '家庭护理、护理助理和患者护理' : 'Home care aides, nursing assistants, and patient care',
      image: healthcareImage,
    },
    {
      title: language === 'en' ? 'Food & Retail' : language === 'vi' ? 'Ẩm thực & Bán lẻ' : language === 'zh' ? '餐饮与零售' : 'Food & Retail',
      description: language === 'en' ? 'Restaurant staff, food processing, and retail positions' : language === 'vi' ? 'Nhân viên nhà hàng, chế biến thực phẩm và vị trí bán lẻ' : language === 'zh' ? '餐厅员工、食品加工和零售职位' : 'Restaurant staff, food processing, and retail positions',
      image: foodImage,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'en' ? 'Job Categories' : language === 'vi' ? 'Ngành nghề' : language === 'zh' ? '工作类别' : 'Job Categories'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' ? 'Explore opportunities in high-demand industries' : language === 'vi' ? 'Khám phá cơ hội trong các ngành có nhu cầu cao' : language === 'zh' ? '探索高需求行业的机会' : 'Explore opportunities in high-demand industries'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <Card key={index} className="overflow-hidden" data-testid={`card-job-category-${index}`}>
              <div className="h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
