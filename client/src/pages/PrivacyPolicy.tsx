import { Link } from "wouter";

const sections = [
  {
    title: "1. Our commitment to privacy",
    paragraphs: [
      "Skyhub Edu Co., Ltd operates Lambsbook Cooperative Hub. We respect the privacy of our members, partners, students, and other platform users.",
      "We do not sell, rent, or trade members' private personal information to third parties. We do not disclose private information for third-party marketing purposes.",
    ],
  },
  {
    title: "2. Information we may collect",
    paragraphs: [
      "Depending on how you use the platform, we may collect account details such as your name, email address, and login information; membership, program, learning, and participation records; information you submit through forms, messages, or platform activities; payment or transaction records needed to administer services; and technical information needed to operate, secure, and troubleshoot the platform.",
      "We aim to collect only information reasonably necessary for legitimate platform purposes.",
    ],
  },
  {
    title: "3. How we use information",
    paragraphs: [
      "We may use information to create and administer accounts and memberships; deliver educational programs, cooperative activities, and requested services; process and record applicable fees or transactions; communicate important account, service, and security information; maintain security and prevent misuse; resolve technical problems; and meet applicable legal obligations.",
      "We will not use personal information for an unrelated purpose without an appropriate legal basis.",
    ],
  },
  {
    title: "4. When information may be shared",
    paragraphs: [
      "We do not sell, rent, or trade personal information. We may share limited information only when reasonably necessary with service providers supporting hosting, storage, communications, payment processing, security, or technical operations; with other users when you deliberately publish information or use a feature designed to share it; when required by applicable law or a lawful request from a competent authority; or when necessary to protect users' or the platform's rights, safety, or security, subject to applicable law.",
      "We seek to limit disclosure to the information necessary for the relevant purpose.",
    ],
  },
  {
    title: "5. Security and retention",
    paragraphs: [
      "We use reasonable technical and organizational safeguards to protect personal information. No internet-based system can guarantee absolute security.",
      "We retain information only for as long as reasonably necessary for the purposes described in this policy, including applicable legal, accounting, dispute-resolution, and security requirements.",
    ],
  },
  {
    title: "6. Your privacy rights",
    paragraphs: [
      "Subject to applicable law, you may have rights to request access to, correction of, deletion of, or restrictions on the processing of your personal information, and to withdraw consent where processing relies on consent.",
      "To submit a privacy request, contact us using the details below. We may need to verify your identity before responding.",
    ],
  },
  {
    title: "7. International processing",
    paragraphs: [
      "Some service providers may process or store information outside Vietnam. Where applicable, we will take steps required by relevant data-protection laws.",
    ],
  },
  {
    title: "8. Children",
    paragraphs: [
      "Where the platform serves children or students, we will handle their information in accordance with applicable law and any required parental or guardian authorization.",
    ],
  },
  {
    title: "9. Changes to this policy",
    paragraphs: [
      "We may update this policy as the platform and applicable requirements change. We will publish the updated version on this page and revise the effective date.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <nav className="mb-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="underline underline-offset-4">Lambsbook home</Link>
          <Link href="/terms" className="underline underline-offset-4">Terms of Use</Link>
        </nav>
        <header className="mb-10 border-b pb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Lambsbook Cooperative Hub
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Effective date: 26 October 2026</p>
          <p className="mt-5 max-w-3xl leading-7">
            This policy explains how Skyhub Edu Co., Ltd handles personal information when you use Lambsbook Cooperative Hub.
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
            <h2 className="mb-3 text-xl font-semibold">10. Contact and responsible entity</h2>
            <address className="not-italic leading-7 text-muted-foreground">
              <strong className="text-foreground">Skyhub Edu Co., Ltd</strong><br />
              Operator of Lambsbook Cooperative Hub<br />
              Business registration number: 0108798514<br />
              Incorporated in Vietnam on 1 July 2019<br />
              Tầng 2, tòa nhà Trung Yên 1, khu đô thị Trung Yên, Phường Trung Hoà, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam<br />
              Email: <a className="underline underline-offset-4" href="mailto:lambsbooknet@gmail.com">lambsbooknet@gmail.com</a><br />
              Website: <a className="underline underline-offset-4" href="https://lambsbookcoop.com/">https://lambsbookcoop.com/</a>
            </address>
            <p className="mt-4 leading-7 text-muted-foreground">
              This policy is intended to explain our privacy practices in plain language. It does not replace any additional notices or procedures required by applicable law.
            </p>
          </section>
        </div>
        <footer className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          <Link href="/terms" className="underline underline-offset-4">Read the Terms of Use</Link>
        </footer>
      </div>
    </main>
  );
}
