export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface RegistrationConfirmationInput {
  fullName: string;
  program: string;
}

export function registrationConfirmationTemplate(
  input: RegistrationConfirmationInput,
): EmailTemplate {
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
