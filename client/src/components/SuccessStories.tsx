import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/LanguageContext';

import familyImage from '@assets/generated_images/happy_immigrant_family_american_home.png';

export function SuccessStories() {
  const { t, language } = useLanguage();

  // todo: remove mock functionality
  const stories = [
    {
      name: 'Nguyen Family',
      country: 'Vietnam',
      flag: '🇻🇳',
      date: 'August 2023',
      quote: language === 'en' 
        ? 'After years of dreaming, we finally received our green cards. Other Path Travel made the entire process smooth and stress-free.'
        : language === 'vi'
        ? 'Sau nhiều năm mơ ước, chúng tôi cuối cùng đã nhận được thẻ xanh. Other Path Travel đã làm cho toàn bộ quá trình suôn sẻ và không căng thẳng.'
        : language === 'zh'
        ? '经过多年的梦想，我们终于拿到了绿卡。Other Path Travel使整个过程顺利且无压力。'
        : 'After years of dreaming, we finally received our green cards.',
      visa: 'EB-3C',
    },
    {
      name: 'Chen Wei',
      country: 'China',
      flag: '🇨🇳',
      date: 'July 2024',
      quote: language === 'en'
        ? 'The professional team guided us every step of the way. Now my whole family is living the American Dream in California!'
        : language === 'vi'
        ? 'Đội ngũ chuyên nghiệp đã hướng dẫn chúng tôi từng bước. Bây giờ cả gia đình tôi đang sống Giấc mơ Mỹ tại California!'
        : language === 'zh'
        ? '专业团队一路指导我们。现在我们全家在加州实现了美国梦！'
        : 'The professional team guided us every step of the way.',
      visa: 'EB-3B',
    },
    {
      name: 'Maria Santos',
      country: 'Brazil',
      flag: '🇧🇷',
      date: 'March 2024',
      quote: language === 'en'
        ? 'I never thought it would be possible for someone like me to get a U.S. green card. Thank you for making my dream come true!'
        : language === 'vi'
        ? 'Tôi không bao giờ nghĩ rằng có thể cho người như tôi nhận được thẻ xanh Mỹ. Cảm ơn vì đã biến giấc mơ của tôi thành hiện thực!'
        : language === 'zh'
        ? '我从没想过像我这样的人能拿到美国绿卡。谢谢让我的梦想成真！'
        : 'I never thought it would be possible for someone like me to get a U.S. green card.',
      visa: 'EB-3C',
    },
  ];

  return (
    <section className="py-20 bg-muted/30" id="success">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('success_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('success_subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={familyImage}
              alt="Success story"
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-lg md:text-xl font-medium mb-2">
                {language === 'en' ? '"Our journey to America was made possible by the dedicated team at Other Path Travel."' : language === 'vi' ? '"Hành trình đến Mỹ của chúng tôi trở nên khả thi nhờ đội ngũ tận tâm tại Other Path Travel."' : language === 'zh' ? '"我们的美国之旅得以实现，多亏了Other Path Travel的专业团队。"' : '"Our journey to America was made possible by the dedicated team."'}
              </p>
              <p className="text-white/80">— The Tran Family, EB-3C Approval 2024</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stories.map((story, index) => (
            <Card key={index} className="relative" data-testid={`card-success-story-${index}`}>
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {story.flag} {story.country}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4 italic">"{story.quote}"</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary font-medium">{story.visa}</span>
                  <span className="text-muted-foreground">{story.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
