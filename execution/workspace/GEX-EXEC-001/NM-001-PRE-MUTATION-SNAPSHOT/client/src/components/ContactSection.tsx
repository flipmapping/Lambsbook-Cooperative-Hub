import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';
import { SiWhatsapp, SiFacebook, SiTiktok } from 'react-icons/si';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function ContactSection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiry: '',
    message: '',
  });

  const contactChannels = [
    {
      name: 'WhatsApp',
      icon: SiWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      href: 'https://wa.me/1234567890',
    },
    {
      name: 'Zalo',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: 'https://zalo.me/1234567890',
    },
    {
      name: 'TikTok',
      icon: SiTiktok,
      color: 'bg-black hover:bg-gray-800',
      href: 'https://tiktok.com/@otherpathtravel',
    },
    {
      name: 'Messenger',
      icon: SiFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: 'https://m.me/otherpathtravel',
    },
  ];

  const submitEnquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/enquiries', {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        inquiryType: data.inquiry || 'general',
        message: data.message || undefined,
        source: 'website',
        status: 'new',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent!',
        description: 'We will get back to you within 24 hours.',
      });
      setFormData({ name: '', email: '', phone: '', inquiry: '', message: '' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitEnquiryMutation.mutate(formData);
  };

  return (
    <section className="py-20 bg-muted/30" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('contact_title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact_subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t('hero_consultation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {contactChannels.map((channel, index) => (
                    <a
                      key={index}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        className={`w-full ${channel.color} text-white`}
                        data-testid={`button-contact-${channel.name.toLowerCase()}`}
                      >
                        <channel.icon className="h-5 w-5 mr-2" />
                        {channel.name}
                      </Button>
                    </a>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('contact_subtitle')}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Email:</span>
                    <a href="mailto:info@otherpathtravel.com" className="text-primary hover:underline">
                      info@otherpathtravel.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t('contact_form_submit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact_form_name')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact_form_email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('contact_form_phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        data-testid="input-contact-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiry">{t('contact_form_inquiry')}</Label>
                    <Select
                      value={formData.inquiry}
                      onValueChange={(value) => setFormData({ ...formData, inquiry: value })}
                    >
                      <SelectTrigger data-testid="select-contact-inquiry">
                        <SelectValue placeholder={t('contact_form_inquiry')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eb3">{t('contact_inquiry_eb3')}</SelectItem>
                        <SelectItem value="study">{t('contact_inquiry_study')}</SelectItem>
                        <SelectItem value="work">{t('contact_inquiry_work')}</SelectItem>
                        <SelectItem value="job">{t('contact_inquiry_job')}</SelectItem>
                        <SelectItem value="general">{t('contact_inquiry_general')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact_form_message')}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      data-testid="textarea-contact-message"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitEnquiryMutation.isPending} data-testid="button-contact-submit">
                    {submitEnquiryMutation.isPending ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('contact_form_submit')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
