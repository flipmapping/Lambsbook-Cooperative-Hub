import { Link } from "wouter";

const sections = [
  {
    title: "1. Acceptance of these terms",
    paragraphs: [
      "These Terms of Use govern your access to and use of Lambsbook Cooperative Hub, operated by Skyhub Edu Co., Ltd.",
      "By accessing or using the platform, you agree to these terms and applicable law. If you do not agree, please discontinue use of the platform.",
    ],
  },
  {
    title: "2. Accounts and memberships",
    paragraphs: [
      "You agree to provide accurate information when creating an account, maintain the security of your login credentials, and notify us of suspected unauthorized access.",
      "Some services, programs, or features may require a particular membership level or payment. Applicable fees and membership conditions should be disclosed before you commit to them.",
    ],
  },
  {
    title: "3. Acceptable use",
    paragraphs: [
      "You must not use the platform for unlawful, fraudulent, or deceptive activities; attempt to access another user's account or private information without authorization; interfere with platform security, availability, or normal operation; upload malicious code or misuse platform features; or publish content that unlawfully infringes another person's rights.",
      "We may investigate suspected misuse and take proportionate action consistent with applicable law.",
    ],
  },
  {
    title: "4. User content and privacy",
    paragraphs: [
      "You retain ownership of content you create, subject to rights you grant us to operate the platform. By submitting content, you grant Skyhub Edu Co., Ltd permission to host, process, and display it as necessary to provide the service and according to your settings and the applicable privacy notice.",
      "Do not publish confidential or sensitive information unless the relevant feature is appropriate for that information. Our handling of personal information is described in our Privacy Policy.",
    ],
  },
  {
    title: "5. Fees, contributions, and financial activities",
    paragraphs: [
      "Fees, donations, cooperative contributions, investments, and other financial arrangements may be governed by separate terms or agreements.",
      "A membership or contribution does not, by itself, guarantee financial returns, ownership rights, investment status, or eligibility for a particular benefit. Those rights, if any, depend on the relevant written agreement and applicable law.",
      "Nothing in these terms overrides a separate signed agreement or mandatory legal requirement.",
    ],
  },
  {
    title: "6. Platform availability and third-party services",
    paragraphs: [
      "We aim to maintain a reliable platform but do not guarantee uninterrupted or error-free availability. We may update, maintain, suspend, or discontinue features where reasonably necessary.",
      "The platform may rely on third-party services. Their own terms and privacy practices may apply to your use of those services.",
    ],
  },
  {
    title: "7. Suspension and termination",
    paragraphs: [
      "We may restrict or suspend access where reasonably necessary to protect users, investigate misuse, maintain security, or comply with law. Where appropriate and lawful, we will provide notice and an opportunity to address the issue.",
      "You may stop using the platform and request account closure through the published contact channel, subject to applicable retention requirements.",
    ],
  },
  {
    title: "8. Intellectual property",
    paragraphs: [
      "The platform's software, branding, design, and other materials are protected by applicable intellectual-property laws. You may not copy, distribute, or commercially exploit protected materials without permission, except where permitted by law.",
    ],
  },
  {
    title: "9. Disclaimers and liability",
    paragraphs: [
      "To the extent permitted by applicable law, the platform is provided on an as-available basis. Nothing in these terms excludes a consumer right, statutory protection, or liability that cannot lawfully be excluded.",
    ],
  },
  {
    title: "10. Changes to these terms",
    paragraphs: [
      "We may update these terms as the platform evolves. The current version and effective date will be published on this page. Where required, we will provide additional notice or seek consent.",
    ],
  },
  {
    title: "11. Governing law",
    paragraphs: [
      "These terms are governed by the laws of Vietnam, subject to any mandatory rules or protections that apply to the user. Disputes will be handled by the competent authorities or courts in accordance with applicable Vietnamese law.",
    ],
  },
];

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <nav className="mb-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="underline underline-offset-4">Lambsbook home</Link>
          <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>
        </nav>
        <header className="mb-10 border-b pb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Lambsbook Cooperative Hub
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Use</h1>
          <p className="mt-4 text-sm text-muted-foreground">Effective date: 26 October 2026</p>
          <p className="mt-5 max-w-3xl leading-7">
            These terms govern access to and use of Lambsbook Cooperative Hub, operated by Skyhub Edu Co., Ltd.
          </p>
        </header>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-3 leading-7 text-muted-foreground">{paragraph}</p>
              ))}
            </section>
          ))}
          <section>
            <h2 className="mb-3 text-xl font-semibold">12. Contact and responsible entity</h2>
            <address className="not-italic leading-7 text-muted-foreground">
              <strong className="text-foreground">Skyhub Edu Co., Ltd</strong><br />
              Operator of Lambsbook Cooperative Hub<br />
              Business registration number: 0108798514<br />
              Incorporated in Vietnam on 1 July 2019<br />
              Tầng 2, tòa nhà Trung Yên 1, khu đô thị Trung Yên, Phường Trung Hoà, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam<br />
              Email: <a className="underline underline-offset-4" href="mailto:lambsbooknet@gmail.com">lambsbooknet@gmail.com</a><br />
              Website: <a className="underline underline-offset-4" href="https://lambsbookcoop.com/">https://lambsbookcoop.com/</a>
            </address>
          </section>
        </div>
        <footer className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="underline underline-offset-4">Read the Privacy Policy</Link>
        </footer>
      </div>
    </main>
  );
}
