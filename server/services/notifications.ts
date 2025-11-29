import { storage } from "../storage";

export interface NotificationPayload {
  recipientId: string;
  recipientType: 'member' | 'partner' | 'admin';
  type: 'new_enquiry' | 'enquiry_assigned' | 'follow_up_reminder' | 'status_change';
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  message: string;
  enquiryId?: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const notification = await storage.createNotification({
      recipientId: payload.recipientId,
      recipientType: payload.recipientType,
      type: payload.type,
      channel: payload.channel,
      subject: payload.subject,
      message: payload.message,
      status: 'pending',
    });

    if (payload.channel === 'email' || payload.channel === 'both') {
      await sendEmail(payload);
    }

    if (payload.channel === 'sms' || payload.channel === 'both') {
      await sendSMS(payload);
    }

    await storage.updateNotification(notification.id, {
      status: 'sent',
      sentAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: String(error) };
  }
}

async function sendEmail(payload: NotificationPayload): Promise<void> {
  console.log(`[Email] Would send to ${payload.recipientId}: ${payload.subject} - ${payload.message}`);
}

async function sendSMS(payload: NotificationPayload): Promise<void> {
  console.log(`[SMS] Would send to ${payload.recipientId}: ${payload.message}`);
}

export async function notifyNewEnquiry(enquiryId: string, enquiry: {
  name: string;
  email: string;
  inquiryType: string;
  countryOfInterest?: string;
}): Promise<void> {
  const members = await storage.getMembers();
  
  const relevantMembers = members.filter(m => {
    if (!m.isActive) return false;
    if (!enquiry.countryOfInterest) return m.role === 'admin' || m.role === 'manager';
    return m.countryIds?.includes(enquiry.countryOfInterest) || m.role === 'admin';
  });

  for (const member of relevantMembers) {
    await sendNotification({
      recipientId: member.id,
      recipientType: 'member',
      type: 'new_enquiry',
      channel: 'email',
      subject: `New ${enquiry.inquiryType} Enquiry from ${enquiry.name}`,
      message: `New enquiry received:\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nType: ${enquiry.inquiryType}\nCountry: ${enquiry.countryOfInterest || 'Not specified'}`,
      enquiryId,
    });
  }
}

export async function notifyEnquiryAssigned(enquiryId: string, memberId: string, enquiry: {
  name: string;
  inquiryType: string;
}): Promise<void> {
  await sendNotification({
    recipientId: memberId,
    recipientType: 'member',
    type: 'enquiry_assigned',
    channel: 'both',
    subject: `Enquiry Assigned: ${enquiry.name}`,
    message: `You have been assigned to handle the ${enquiry.inquiryType} enquiry from ${enquiry.name}. Please follow up within 24 hours.`,
    enquiryId,
  });
}
