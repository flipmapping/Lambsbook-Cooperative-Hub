import nodemailer from "nodemailer";
import { storage } from "../storage";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFromEmail) {
      console.warn(
        "SMTP configuration incomplete. Email notifications will not be sent.",
        { host: !!smtpHost, user: !!smtpUser, pass: !!smtpPass, from: !!smtpFromEmail }
      );
      return null;
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return transporter;
}

export interface NotificationPayload {
  recipientEmail: string;
  recipientId: string;
  recipientType: "member" | "partner" | "admin";
  type: "new_enquiry" | "enquiry_assigned" | "follow_up_reminder" | "status_change" | "prospect_registered";
  subject: string;
  message: string;
  enquiryId?: string;
  // WP-3: Zalo channel fields
  channel?: "email" | "in_app" | "zalo";
  zaloPhone?: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const resolvedChannel = payload.channel ?? "email";
    const notification = await storage.createNotification({
      recipientId: payload.recipientId,
      recipientType: payload.recipientType,
      type: payload.type,
      channel: resolvedChannel,
      subject: payload.subject,
      message: payload.message,
      status: "pending",
    });

    // WP-3: Channel-aware dispatch
    const result = resolvedChannel === "zalo"
      ? await sendZalo(payload)
      : await sendEmail(payload);

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
    const transporter = getTransporter();
    if (!transporter) {
      return { success: false, error: "SMTP not configured" };
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL!;
    const fromName = process.env.SMTP_FROM_NAME || "Other Path Travel";

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: payload.recipientEmail,
      subject: payload.subject,
      text: payload.message,
      html: `<p>${payload.message.replace(/\n/g, "<br>")}</p>`,
    });

    console.log(`[Email] Sent to ${payload.recipientEmail}: ${payload.subject}`);
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


// WP-4: Zalo adapter
// Sends a notification via the Zalo OA Message API.
// Requires ZALO_OA_ACCESS_TOKEN environment variable.
// No Zalo SDK is installed; messages are sent via the official REST API.
// If the access token is absent, the call is a no-op and returns success:false.
async function sendZalo(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn("[Zalo] ZALO_OA_ACCESS_TOKEN not configured. Zalo notification skipped.");
      return { success: false, error: "Zalo OA access token not configured" };
    }

    const phone = payload.zaloPhone;
    if (!phone) {
      console.warn("[Zalo] No zaloPhone in payload. Zalo notification skipped.");
      return { success: false, error: "No Zalo phone number in payload" };
    }

    // Zalo OA Sandbox / Production REST endpoint
    const response = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": accessToken,
      },
      body: JSON.stringify({
        recipient: { user_id: phone },
        message: { text: `${payload.subject}\n\n${payload.message}` },
      }),
    });

    const json = await response.json() as { error: number; message: string };
    if (json.error !== 0) {
      console.error(`[Zalo] API error ${json.error}: ${json.message}`);
      return { success: false, error: `Zalo API error ${json.error}: ${json.message}` };
    }

    console.log(`[Zalo] Sent to ${phone}: ${payload.subject}`);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Zalo] Failed to send:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}
