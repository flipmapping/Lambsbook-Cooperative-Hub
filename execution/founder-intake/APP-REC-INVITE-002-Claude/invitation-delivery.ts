/**
 * Invitation Delivery Adapter
 * server/services/invitation-delivery.ts
 *
 * Authority: FAB-APP-REC-INVITE-002Q
 * Task: APP-REC-INVITE-002
 *
 * Canonical adapter for invitation share payload generation.
 * Pure functions only — no side effects, no persistence, no network calls.
 * The adapter is language-aware and produces the canonical invitation share
 * message in the authorized dashboard language (EN / VI / ZH).
 *
 * Protected invariants:
 * - Invitation identity and link semantics are never altered.
 * - Canonical message is the starting point; member personalization occurs
 *   before sending and is outside this adapter's scope.
 * - No second language authority is introduced.
 * - Adapter does not persist, send, or route the message.
 */

// ── Supported languages (FIX-07 / FIX-08) ────────────────────────────────────

export type DashboardLanguage = "en" | "vi" | "zh";

export const DASHBOARD_LANGUAGES: { code: DashboardLanguage; label: string }[] =
  [
    { code: "en", label: "English" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "zh", label: "中文" },
  ];

// ── InvitationSharePayload ────────────────────────────────────────────────────

/**
 * InvitationSharePayload
 *
 * Delivery representation of an invitation for the share surface.
 * Distinct from the invitation domain resource.
 *
 * invitationLink: the canonical invitation link (must be preserved verbatim
 *                 in the generated message).
 * language:       the dashboard language selected by the member.
 * memberName:     optional personalization; if absent, the canonical message
 *                 is returned without a name placeholder.
 */
export interface InvitationSharePayload {
  readonly invitationLink: string;
  readonly language: DashboardLanguage;
  readonly memberName?: string;
}

// ── Canonical message templates ───────────────────────────────────────────────
// Each template uses the placeholder {{LINK}} which is replaced with the
// canonical invitationLink before delivery.

const CANONICAL_MESSAGES: Record<DashboardLanguage, string> = {
  en: [
    "I'd like to invite you to join me on Lambsbook Cooperative as a member.",
    "",
    "I'm inviting you because I trust you and think you may be interested in what we're building together.",
    "",
    "Join through my invitation:",
    "{{LINK}}",
  ].join("\n"),

  vi: [
    "Tôi muốn mời bạn tham gia Lambsbook Cooperative với tư cách là thành viên.",
    "",
    "Tôi mời bạn vì tôi tin tưởng bạn và nghĩ rằng bạn có thể quan tâm đến những gì chúng tôi đang xây dựng cùng nhau.",
    "",
    "Tham gia qua lời mời của tôi:",
    "{{LINK}}",
  ].join("\n"),

  zh: [
    "我想邀请您以会员身份加入 Lambsbook Cooperative。",
    "",
    "我邀请您是因为我信任您，并认为您可能会对我们共同构建的事物感兴趣。",
    "",
    "通过我的邀请加入：",
    "{{LINK}}",
  ].join("\n"),
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * generateInvitationShareMessage
 *
 * Returns the canonical invitation share message for the given payload.
 * The invitation link is substituted verbatim — its semantics are never
 * altered by this function.
 *
 * Invariant: if invitationLink is empty or invalid, the function still
 * returns the template with the placeholder replaced by the supplied value.
 * Validation of the link is the caller's responsibility.
 */
export function generateInvitationShareMessage(
  payload: InvitationSharePayload,
): string {
  const template =
    CANONICAL_MESSAGES[payload.language] ?? CANONICAL_MESSAGES["en"];

  return template.replace("{{LINK}}", payload.invitationLink);
}

/**
 * resolveLanguage
 *
 * Normalizes an arbitrary string to a supported DashboardLanguage.
 * Falls back to English when the input is unrecognized.
 */
export function resolveLanguage(raw: string | undefined | null): DashboardLanguage {
  if (raw === "vi" || raw === "zh") return raw;
  return "en";
}
