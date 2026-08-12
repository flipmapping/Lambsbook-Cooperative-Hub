export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface RegistrationConfirmationInput {
  fullName: string;
  program: string;
  language?: "en" | "vi" | "zh";
}

export function registrationConfirmationTemplate(
  input: RegistrationConfirmationInput,
): EmailTemplate {
  const language = input.language ?? "vi";

  if (language === "zh") {
    const subject = "感谢您登记对 CTBC 大学的兴趣";

    const text =
`尊敬的 ${input.fullName}：

感谢您登记对 ${input.program} 的兴趣。

我们的招生团队已经收到您的登记信息，并将与您联系，告知下一步安排。

此致
CTBC 招生团队`;

    const html =
`<p>尊敬的 ${input.fullName}：</p>
<p>感谢您登记对 <strong>${input.program}</strong> 的兴趣。</p>
<p>我们的招生团队已经收到您的登记信息，并将与您联系，告知下一步安排。</p>
<p>此致<br>CTBC 招生团队</p>`;

    return { subject, text, html };
  }

  if (language === "en") {
    const subject = "Thank you for registering your interest in CTBC University";

    const text =
`Dear ${input.fullName},

Thank you for registering your interest in ${input.program}.

Our admissions team has received your registration and will contact you with the next steps.

Kind regards,
CTBC Admissions`;

    const html =
`<p>Dear ${input.fullName},</p>
<p>Thank you for registering your interest in <strong>${input.program}</strong>.</p>
<p>Our admissions team has received your registration and will contact you with the next steps.</p>
<p>Kind regards,<br>CTBC Admissions</p>`;

    return { subject, text, html };
  }

  const subject = "Cảm ơn bạn đã đăng ký quan tâm đến CTBC University";

  const text =
`Kính gửi ${input.fullName},

Cảm ơn bạn đã đăng ký quan tâm đến ${input.program}.

Đội ngũ tuyển sinh của chúng tôi đã nhận được thông tin đăng ký của bạn và sẽ liên hệ để thông báo các bước tiếp theo.

Trân trọng,
Đội ngũ Tuyển sinh CTBC`;

  const html =
`<p>Kính gửi ${input.fullName},</p>
<p>Cảm ơn bạn đã đăng ký quan tâm đến <strong>${input.program}</strong>.</p>
<p>Đội ngũ tuyển sinh của chúng tôi đã nhận được thông tin đăng ký của bạn và sẽ liên hệ để thông báo các bước tiếp theo.</p>
<p>Trân trọng,<br>Đội ngũ Tuyển sinh CTBC</p>`;

  return { subject, text, html };
}
