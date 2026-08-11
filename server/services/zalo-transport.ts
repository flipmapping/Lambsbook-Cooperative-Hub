/**
 * GE-EXEC-004B-REV3 — Zalo campaign send transport.
 *
 * HONEST SCOPE NOTE (read before treating this as "done"):
 *
 * This calls Zalo's real ZNS (Zalo Notification Service) template-send
 * API — https://business.openapi.zalo.me/message/template — which is
 * the only Zalo API that can send to an arbitrary phone number without
 * the recipient having first messaged/followed an Official Account.
 * (Zalo's other API, the OA "Send Consultation Message" API, requires a
 * Zalo-internal `user_id` obtained from that user having interacted
 * with the OA — it cannot target a phone number directly. Since this
 * repository's prospect records only ever store `phone`, ZNS is the
 * correct API family here.)
 *
 * To actually send anything, this repository needs, at minimum:
 *   - ZALO_ZNS_ACCESS_TOKEN  (OA access token, refreshed per Zalo's OAuth flow)
 *   - ZALO_ZNS_TEMPLATE_ID   (a template pre-approved by Zalo for this OA)
 *
 * Neither exists in this environment, so this module cannot be runtime-
 * verified here. Without them, sendZaloBroadcast() below returns a
 * per-recipient "failed" result with an explicit "not configured"
 * reason — it does NOT report false success. If real credentials are
 * added, the request shape below is Zalo's documented ZNS contract, but
 * it still can't be verified against Zalo's servers or the approved
 * template's actual parameter names from inside this sandbox.
 */

import { createHash, createHmac } from "node:crypto";

export interface ZaloRecipient {
  id: string;
  full_name?: string | null;
  phone?: string | null;
}

export interface ZaloSendResult {
  prospectId: string;
  success: boolean;
  reason?: string;
}

export interface ZaloBroadcastResult {
  sent: number;
  failed: number;
  results: ZaloSendResult[];
}

const ZNS_ENDPOINT = 'https://business.openapi.zalo.me/message/template/hashphone';

function getConfig(): {
  accessToken: string;
  templateId: string;
  appSecret: string;
} | null {
  const accessToken = process.env.ZALO_ZNS_ACCESS_TOKEN;
  const templateId = process.env.ZALO_ZNS_TEMPLATE_ID;
  const appSecret = process.env.ZALO_APP_SECRET;

  if (!accessToken || !templateId || !appSecret) return null;

  return { accessToken, templateId, appSecret };
}

/** Normalizes to Zalo's expected phone format: no leading 0, no separators, no country code prefix char. */
function normalizePhoneForZalo(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('0') ? `84${digits.slice(1)}` : digits;
}

async function sendOne(
  recipient: ZaloRecipient,
  accessToken: string,
  templateId: string,
  appSecret: string,
): Promise<ZaloSendResult> {
  if (!recipient.phone) {
    return { prospectId: recipient.id, success: false, reason: 'No phone number on record' };
  }

  try {
    const response = await fetch(ZNS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: accessToken,
          appsecret_proof: createHmac('sha256', appSecret)
            .update(accessToken)
            .digest('hex'),
      
      },
      body: JSON.stringify({
        hash_phone: createHash('sha256')
          .update(normalizePhoneForZalo(recipient.phone))
          .digest('hex'),
        template_id: templateId,
        template_data: {
          student_name: recipient.full_name ?? '',
          phone_number: normalizePhoneForZalo(recipient.phone),
          student_id: recipient.id,
        },
        tracking_id: `zalo-test-${recipient.id}`.slice(0, 48),
      }),
    });

    const body = await response.json().catch(() => null);

    // Zalo's ZNS API reports application-level errors as error !== 0
    // inside a 200 response, not via HTTP status.
    if (!response.ok || !body || body.error !== 0) {
      const reason = body?.message || `Zalo API returned HTTP ${response.status}`;
      return { prospectId: recipient.id, success: false, reason };
    }

    return { prospectId: recipient.id, success: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Zalo API request failed';
    return { prospectId: recipient.id, success: false, reason };
  }
}

/**
 * Sends the campaign message to each recipient via Zalo ZNS.
 * Never throws for individual recipient failures — each is reported in
 * `results`. Returns a "not configured" failure for every recipient if
 * ZALO_ZNS_ACCESS_TOKEN / ZALO_ZNS_TEMPLATE_ID are unset, rather than
 * silently pretending to have sent anything.
 */
export async function sendZaloBroadcast(
  recipients: ZaloRecipient[],
): Promise<ZaloBroadcastResult> {
  const config = getConfig();

  if (!config) {
    const results: ZaloSendResult[] = recipients.map((r) => ({
      prospectId: r.id,
      success: false,
      reason: 'Zalo ZNS is not configured (missing ZALO_ZNS_ACCESS_TOKEN / ZALO_ZNS_TEMPLATE_ID)',
    }));
    return { sent: 0, failed: results.length, results };
  }

  const results: ZaloSendResult[] = [];
  for (const recipient of recipients) {
    // Sent sequentially (not Promise.all) to stay well under Zalo's
    // per-second rate limit for template sends.
    const result = await sendOne(
      recipient,
      config.accessToken,
      config.templateId,
      config.appSecret,
    );
    results.push(result);
  }

  const sent = results.filter((r) => r.success).length;
  return { sent, failed: results.length - sent, results };
}
