import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, Send, Mail, Phone } from 'lucide-react';
import { SiWhatsapp, SiFacebook } from 'react-icons/si';
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
import { useHubTranslation } from '@/lib/hubTranslations';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface InquiryOption {
  value: string;
  labelKey: string;
}

interface HubConsultationFormProps {
  inquiryOptions: InquiryOption[];
  source: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  zaloNumber?: string;
  facebookUrl?: string;
}

export function HubConsultationForm({
  inquiryOptions,
  source,
  contactEmail = 'support@lambsbook.net',
  contactPhone = '+84 363 192 508',
  whatsappNumber = '84363192508',
  zaloNumber = '84363192508',
  facebookUrl = 'https://www.facebook.com/lambsbook.net/',
}: HubConsultationFormProps) {
  const { language } = useLanguage();
  const { t } = useHubTranslation(language);
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
      href: `https://wa.me/${whatsappNumber}`,
    },
    {
      name: 'Zalo',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: `https://zalo.me/${zaloNumber}`,
    },
    {
      name: 'Messenger',
      icon: SiFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: facebookUrl.includes('m.me') ? facebookUrl : `https://m.me/${facebookUrl.split('/').pop()}`,
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
        source: source,
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
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('hub_connect_with_us')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div className="pt-6 border-t space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-medium">Email: </span>
                <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                  {contactEmail}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-medium">WhatsApp/Zalo: </span>
                <a href={`tel:${contactPhone}`} className="text-primary hover:underline">
                  {contactPhone}
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('hub_or_message_us')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('hub_full_name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-hub-name"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('hub_email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-hub-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('hub_phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-hub-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inquiry">{t('hub_inquiry_type')}</Label>
              <Select
                value={formData.inquiry}
                onValueChange={(value) => setFormData({ ...formData, inquiry: value })}
              >
                <SelectTrigger data-testid="select-hub-inquiry">
                  <SelectValue placeholder={t('hub_inquiry_type')} />
                </SelectTrigger>
                <SelectContent>
                  {inquiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t('hub_message')}</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                data-testid="textarea-hub-message"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitEnquiryMutation.isPending} data-testid="button-hub-submit">
              {submitEnquiryMutation.isPending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('hub_send_message')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
