# GP-EXEC-009M-07

Generated: 2026-07-25T16:29:12.619644Z

## SHA256

HEAD     : e1f5b3962e3989a5203f0b7c20016c7954a55f183852a7bacfecc64f252f965e
WORKTREE : ec9779d5ae34e62ac0c80721c1f91836e67a0480df4ae8943ee6a01534dbf2a6

## Exported Functions

HEAD
['notifyEnquiryAssigned', 'notifyFollowUpReminder', 'notifyNewEnquiry', 'sendNotification']

WORKTREE
['notifyEnquiryAssigned', 'notifyFollowUpReminder', 'notifyNewEnquiry', 'sendNotification']

## Exported Constants

HEAD
[]

WORKTREE
[]

## Imports

HEAD
../storage
resend

WORKTREE
../storage
nodemailer

## Environment Variables

HEAD
['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'RESEND_FROM_NAME', 'SMTP_FROM_EMAIL']

WORKTREE
['SMTP_FROM_EMAIL', 'SMTP_FROM_NAME', 'SMTP_HOST', 'SMTP_PASSWORD', 'SMTP_PORT', 'SMTP_USER', 'ZALO_OA_ACCESS_TOKEN']

## Capability Matrix

EMAIL                HEAD=True WORKTREE=True
ZALO                 HEAD=False WORKTREE=True
fetch(               HEAD=False WORKTREE=True
nodemailer           HEAD=False WORKTREE=True
openapi.zalo.me      HEAD=False WORKTREE=True
resend               HEAD=True WORKTREE=False
sendEmail            HEAD=True WORKTREE=True
sendInApp            HEAD=False WORKTREE=False
sendNotification     HEAD=True WORKTREE=True
sendZalo             HEAD=False WORKTREE=True

## Unified Diff

--- HEAD
+++ WORKTREE
@@ -1,52 +1,67 @@
-import { Resend } from "resend";
+import nodemailer from "nodemailer";
 import { storage } from "../storage";
 
-// GE-RMP-014 — Resend transport (replaces Nodemailer)
-// Authorized surface: server/services/notifications.ts
-// Public contracts preserved: sendNotification(), sendEmail(), NotificationPayload
-// Callers unchanged: admissions.ts, all existing callers
-
-let resendClient: Resend | null = null;
-
-function getResendClient(): Resend | null {
-  if (!resendClient) {
-    const apiKey = process.env.RESEND_API_KEY;
-
-    if (!apiKey) {
+let transporter: nodemailer.Transporter | null = null;
+
+function getTransporter() {
+  if (!transporter) {
+    const smtpHost = process.env.SMTP_HOST;
+    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
+    const smtpUser = process.env.SMTP_USER;
+    const smtpPass = process.env.SMTP_PASSWORD;
+    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
+
+    if (!smtpHost || !smtpUser || !smtpPass || !smtpFromEmail) {
       console.warn(
-        "[Email] RESEND_API_KEY not configured. Email notifications will not be sent."
+        "SMTP configuration incomplete. Email notifications will not be sent.",
+        { host: !!smtpHost, user: !!smtpUser, pass: !!smtpPass, from: !!smtpFromEmail }
       );
       return null;
     }
 
-    resendClient = new Resend(apiKey);
-  }
-  return resendClient;
+    transporter = nodemailer.createTransport({
+      host: smtpHost,
+      port: smtpPort,
+      secure: smtpPort === 465,
+      auth: {
+        user: smtpUser,
+        pass: smtpPass,
+      },
+    });
+  }
+  return transporter;
 }
 
 export interface NotificationPayload {
   recipientEmail: string;
   recipientId: string;
-  recipientType: "member" | "partner" | "admin" | "prospect";
-  type: "new_enquiry" | "enquiry_assigned" | "follow_up_reminder" | "status_change" | "registration_confirmation" | "campaign_email";
+  recipientType: "member" | "partner" | "admin";
+  type: "new_enquiry" | "enquiry_assigned" | "follow_up_reminder" | "status_change" | "prospect_registered";
   subject: string;
   message: string;
   enquiryId?: string;
+  // WP-3: Zalo channel fields
+  channel?: "email" | "in_app" | "zalo";
+  zaloPhone?: string;
 }
 
 export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
   try {
+    const resolvedChannel = payload.channel ?? "email";
     const notification = await storage.createNotification({
       recipientId: payload.recipientId,
       recipientType: payload.recipientType,
       type: payload.type,
-      channel: "email",
+      channel: resolvedChannel,
       subject: payload.subject,
       message: payload.message,
       status: "pending",
     });
 
-    const result = await sendEmail(payload);
+    // WP-3: Channel-aware dispatch
+    const result = resolvedChannel === "zalo"
+      ? await sendZalo(payload)
+      : await sendEmail(payload);
 
     if (result.success) {
       await storage.updateNotification(notification.id, {
@@ -69,39 +84,23 @@
 
 async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
   try {
-    const client = getResendClient();
-    if (!client) {
-      return { success: false, error: "Resend not configured" };
-    }
-
-    const fromName = process.env.RESEND_FROM_NAME || "Other Path Travel";
-    const fromEmail =
-    process.env.RESEND_FROM_EMAIL ??
-    process.env.SMTP_FROM_EMAIL;
-
-    if (!fromEmail) {
-      return {
-        success: false,
-        error: "No sender email configured",
-      };
-    }
-
-    const { data, error } = await client.emails.send({
-      from: `${fromName} <${fromEmail}>`,
-      to: [payload.recipientEmail],
+    const transporter = getTransporter();
+    if (!transporter) {
+      return { success: false, error: "SMTP not configured" };
+    }
+
+    const fromEmail = process.env.SMTP_FROM_EMAIL!;
+    const fromName = process.env.SMTP_FROM_NAME || "Other Path Travel";
+
+    await transporter.sendMail({
+      from: `"${fromName}" <${fromEmail}>`,
+      to: payload.recipientEmail,
       subject: payload.subject,
       text: payload.message,
       html: `<p>${payload.message.replace(/\n/g, "<br>")}</p>`,
     });
 
-    if (error) {
-      console.error(`[Email] Failed to send to ${payload.recipientEmail}:`, error.message);
-      return { success: false, error: error.message };
-    }
-
-    console.log(
-      `[Email] Sent ${data?.id ?? "(no id)"} -> ${payload.recipientEmail}: ${payload.subject}`
-    );
+    console.log(`[Email] Sent to ${payload.recipientEmail}: ${payload.subject}`);
     return { success: true };
   } catch (error) {
     const errorMsg = error instanceof Error ? error.message : String(error);
@@ -181,3 +180,51 @@
     enquiryId,
   }).catch((err) => console.error("Failed to send reminder:", err));
 }
+
+
+// WP-4: Zalo adapter
+// Sends a notification via the Zalo OA Message API.
+// Requires ZALO_OA_ACCESS_TOKEN environment variable.
+// No Zalo SDK is installed; messages are sent via the official REST API.
+// If the access token is absent, the call is a no-op and returns success:false.
+async function sendZalo(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
+  try {
+    const accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
+    if (!accessToken) {
+      console.warn("[Zalo] ZALO_OA_ACCESS_TOKEN not configured. Zalo notification skipped.");
+      return { success: false, error: "Zalo OA access token not configured" };
+    }
+
+    const phone = payload.zaloPhone;
+    if (!phone) {
+      console.warn("[Zalo] No zaloPhone in payload. Zalo notification skipped.");
+      return { success: false, error: "No Zalo phone number in payload" };
+    }
+
+    // Zalo OA Sandbox / Production REST endpoint
+    const response = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
+      method: "POST",
+      headers: {
+        "Content-Type": "application/json",
+        "access_token": accessToken,
+      },
+      body: JSON.stringify({
+        recipient: { user_id: phone },
+        message: { text: `${payload.subject}\n\n${payload.message}` },
+      }),
+    });
+
+    const json = await response.json() as { error: number; message: string };
+    if (json.error !== 0) {
+      console.error(`[Zalo] API error ${json.error}: ${json.message}`);
+      return { success: false, error: `Zalo API error ${json.error}: ${json.message}` };
+    }
+
+    console.log(`[Zalo] Sent to ${phone}: ${payload.subject}`);
+    return { success: true };
+  } catch (error) {
+    const errorMsg = error instanceof Error ? error.message : String(error);
+    console.error(`[Zalo] Failed to send:`, errorMsg);
+    return { success: false, error: errorMsg };
+  }
+}