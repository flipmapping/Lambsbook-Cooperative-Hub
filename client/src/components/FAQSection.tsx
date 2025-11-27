import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/lib/LanguageContext';

export function FAQSection() {
  const { t, language } = useLanguage();

  // todo: remove mock functionality
  const faqs = [
    {
      question: language === 'en' ? 'What is the EB-3 visa?' : language === 'vi' ? 'Visa EB-3 là gì?' : language === 'zh' ? '什么是EB-3签证？' : 'What is the EB-3 visa?',
      answer: language === 'en' 
        ? 'The EB-3 visa is an employment-based immigrant visa that allows foreign nationals to obtain permanent residency (green card) in the United States through a job offer. It covers three categories: skilled workers, professionals, and other workers.'
        : language === 'vi'
        ? 'Visa EB-3 là visa di trú dựa trên việc làm cho phép công dân nước ngoài có được quyền thường trú (thẻ xanh) tại Hoa Kỳ thông qua một công việc. Nó bao gồm ba loại: lao động lành nghề, chuyên gia và lao động khác.'
        : language === 'zh'
        ? 'EB-3签证是一种基于就业的移民签证，允许外国公民通过工作机会获得美国永久居留权（绿卡）。它涵盖三个类别：技术工人、专业人士和其他工人。'
        : 'The EB-3 visa is an employment-based immigrant visa.',
    },
    {
      question: language === 'en' ? 'What are the basic requirements?' : language === 'vi' ? 'Các yêu cầu cơ bản là gì?' : language === 'zh' ? '基本要求是什么？' : 'What are the basic requirements?',
      answer: language === 'en'
        ? 'Basic requirements include: at least 18 years old, good health, no criminal record, basic English communication skills, and some training or work experience (preferred but not always required).'
        : language === 'vi'
        ? 'Các yêu cầu cơ bản bao gồm: ít nhất 18 tuổi, sức khỏe tốt, không có tiền án, kỹ năng giao tiếp tiếng Anh cơ bản và một số kinh nghiệm đào tạo hoặc làm việc (được ưu tiên nhưng không phải lúc nào cũng bắt buộc).'
        : language === 'zh'
        ? '基本要求包括：至少18岁、身体健康、无犯罪记录、基本英语沟通能力，以及一些培训或工作经验（优先但不总是必需的）。'
        : 'Basic requirements include: at least 18 years old, good health, no criminal record.',
    },
    {
      question: language === 'en' ? 'Can my family come with me?' : language === 'vi' ? 'Gia đình tôi có thể đi cùng không?' : language === 'zh' ? '我的家人可以和我一起吗？' : 'Can my family come with me?',
      answer: language === 'en'
        ? 'Yes! EB-3 visa holders can bring their spouse and unmarried children under 21 years of age. They will receive derivative green cards and can work, study, and live in the United States.'
        : language === 'vi'
        ? 'Có! Người có visa EB-3 có thể mang theo vợ/chồng và con chưa kết hôn dưới 21 tuổi. Họ sẽ nhận được thẻ xanh phái sinh và có thể làm việc, học tập và sinh sống tại Hoa Kỳ.'
        : language === 'zh'
        ? '可以！EB-3签证持有人可以携带配偶和21岁以下未婚子女。他们将获得衍生绿卡，可以在美国工作、学习和生活。'
        : 'Yes! EB-3 visa holders can bring their spouse and children.',
    },
    {
      question: language === 'en' ? 'How long does the process take?' : language === 'vi' ? 'Quá trình mất bao lâu?' : language === 'zh' ? '流程需要多长时间？' : 'How long does the process take?',
      answer: language === 'en'
        ? 'The timeline varies depending on the country of origin and visa availability. Generally, the process takes 2-4 years from start to green card approval. We will provide you with a realistic timeline based on your specific situation.'
        : language === 'vi'
        ? 'Thời gian phụ thuộc vào quốc gia xuất xứ và tình trạng visa. Thông thường, quá trình mất 2-4 năm từ khi bắt đầu đến khi được phê duyệt thẻ xanh. Chúng tôi sẽ cung cấp cho bạn một lịch trình thực tế dựa trên tình huống cụ thể của bạn.'
        : language === 'zh'
        ? '时间因原籍国和签证可用性而异。通常，从开始到绿卡批准需要2-4年。我们将根据您的具体情况为您提供实际的时间表。'
        : 'The process generally takes 2-4 years.',
    },
    {
      question: language === 'en' ? 'What types of jobs are available?' : language === 'vi' ? 'Có những loại công việc nào?' : language === 'zh' ? '有哪些类型的工作？' : 'What types of jobs are available?',
      answer: language === 'en'
        ? 'We have partnerships with employers in various industries including hospitality (hotels, resorts), healthcare (home care, nursing facilities), food service (restaurants, food processing), and retail. We match you with positions that fit your skills and experience.'
        : language === 'vi'
        ? 'Chúng tôi có đối tác với các nhà tuyển dụng trong nhiều ngành bao gồm khách sạn (khách sạn, resort), y tế (chăm sóc tại nhà, cơ sở điều dưỡng), dịch vụ ẩm thực (nhà hàng, chế biến thực phẩm) và bán lẻ. Chúng tôi kết nối bạn với các vị trí phù hợp với kỹ năng và kinh nghiệm của bạn.'
        : language === 'zh'
        ? '我们与各行业雇主建立了合作关系，包括酒店业（酒店、度假村）、医疗保健（家庭护理、护理机构）、餐饮服务（餐厅、食品加工）和零售业。我们将您匹配到适合您技能和经验的职位。'
        : 'We have partnerships with employers in hospitality, healthcare, food service, and retail.',
    },
    {
      question: language === 'en' ? 'Do I need to know English?' : language === 'vi' ? 'Tôi có cần biết tiếng Anh không?' : language === 'zh' ? '我需要会英语吗？' : 'Do I need to know English?',
      answer: language === 'en'
        ? 'Basic English communication skills are required. We provide language training as part of our preparation program to help you improve your English before you arrive in the United States.'
        : language === 'vi'
        ? 'Cần có kỹ năng giao tiếp tiếng Anh cơ bản. Chúng tôi cung cấp đào tạo ngôn ngữ như một phần của chương trình chuẩn bị để giúp bạn cải thiện tiếng Anh trước khi đến Hoa Kỳ.'
        : language === 'zh'
        ? '需要基本的英语沟通能力。我们在准备计划中提供语言培训，帮助您在抵达美国之前提高英语水平。'
        : 'Basic English is required. We provide language training.',
    },
  ];

  return (
    <section className="py-20" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('faq_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('faq_subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
