import { Resend } from "resend";
import { storage } from "../storage";

// GE-RMP-014 — Resend transport (replaces Nodemailer)
// Authorized surface: server/services/notifications.ts
// Public contracts preserved: sendNotification(), sendEmail(), NotificationPayload
// Callers unchanged: admissions.ts, all existing callers

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn(
        "[Email] RESEND_API_KEY not configured. Email notifications will not be sent."
      );
      return null;
    }

    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface NotificationPayload {
  recipientEmail: string;
  recipientId: string;
  recipientType: "member" | "partner" | "admin";
  type: "new_enquiry" | "enquiry_assigned" | "follow_up_reminder" | "status_change";
  subject: string;
  message: string;
  enquiryId?: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const notification = await storage.createNotification({
      recipientId: payload.recipientId,
      recipientType: payload.recipientType,
      type: payload.type,
      channel: "email",
      subject: payload.subject,
      message: payload.message,
      status: "pending",
    });

    const result = await sendEmail(payload);

    if (result.success) {
      await storage.updateNotification(notification.id, {
        status: "sent",
        sentAt: new Date(),
      });
    } else {
      await storage.updateNotification(notification.id, {
        status: "failed",
        error: result.error,
      });
    }

    return result;
  } catch (error) {
    console.error("Notification error:", error);
    return { success: false, error: String(error) };
  }
}

async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getResendClient();
    if (!client) {
      return { success: false, error: "Resend not configured" };
    }

    const fromName = process.env.RESEND_FROM_NAME || "Other Path Travel";
    const fromEmail =
    process.env.RESEND_FROM_EMAIL ??
    process.env.SMTP_FROM_EMAIL;

    if (!fromEmail) {
      return {
        success: false,
        error: "No sender email configured",
      };
    }

    const { data, error } = await client.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [payload.recipientEmail],
      subject: payload.subject,
      text: payload.message,
      html: `<p>${payload.message.replace(/\n/g, "<br>")}</p>`,
    });

    if (error) {
      console.error(`[Email] Failed to send to ${payload.recipientEmail}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(
      `[Email] Sent ${data?.id ?? "(no id)"} -> ${payload.recipientEmail}: ${payload.subject}`
    );
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Email] Failed to send to ${payload.recipientEmail}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function notifyNewEnquiry(
  enquiryId: string,
  enquiry: {
    name: string;
    email: string;
    inquiryType: string;
    countryOfInterest?: string;
  }
): Promise<void> {
  const members = await storage.getMembers();

  const relevantMembers = members.filter((m) => {
    if (!m.isActive) return false;
    if (!enquiry.countryOfInterest) return m.role === "admin" || m.role === "manager";
    return m.countryIds?.includes(enquiry.countryOfInterest) || m.role === "admin";
  });

  for (const member of relevantMembers) {
    if (!member.email) continue;

    await sendNotification({
      recipientEmail: member.email,
      recipientId: member.id,
      recipientType: "member",
      type: "new_enquiry",
      subject: `New ${enquiry.inquiryType} Enquiry from ${enquiry.name}`,
      message: `New enquiry received:\n\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nInquiry Type: ${enquiry.inquiryType}\nCountry of Interest: ${enquiry.countryOfInterest || "Not specified"}\n\nPlease log in to the dashboard to view full details and follow up.`,
      enquiryId,
    }).catch((err) => console.error("Failed to notify member:", err));
  }
}

export async function notifyEnquiryAssigned(
  enquiryId: string,
  memberId: string,
  memberEmail: string,
  enquiry: {
    name: string;
    inquiryType: string;
  }
): Promise<void> {
  await sendNotification({
    recipientEmail: memberEmail,
    recipientId: memberId,
    recipientType: "member",
    type: "enquiry_assigned",
    subject: `Enquiry Assigned: ${enquiry.name}`,
    message: `You have been assigned to handle the ${enquiry.inquiryType} enquiry from ${enquiry.name}.\n\nPlease follow up within 24 hours.\n\nLog in to the dashboard to view the full enquiry details and manage your follow-ups.`,
    enquiryId,
  }).catch((err) => console.error("Failed to notify member:", err));
}

export async function notifyFollowUpReminder(
  enquiryId: string,
  memberId: string,
  memberEmail: string,
  enquiry: {
    name: string;
    inquiryType: string;
  }
): Promise<void> {
  await sendNotification({
    recipientEmail: memberEmail,
    recipientId: memberId,
    recipientType: "member",
    type: "follow_up_reminder",
    subject: `Follow-up Reminder: ${enquiry.name}`,
    message: `This is a reminder to follow up on the ${enquiry.inquiryType} enquiry from ${enquiry.name}.\n\nLog in to the dashboard to view the enquiry and update the status.`,
    enquiryId,
  }).catch((err) => console.error("Failed to send reminder:", err));
}
