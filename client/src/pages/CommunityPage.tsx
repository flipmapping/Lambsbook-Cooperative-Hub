import { useState } from 'react';

// NOTE: Placeholder content. Replace with real data once the CTBC community
// roster, updates feed, and contribution log sources are available.
const COMMUNITY_STORY = `CTBC began as a small group of members supporting one another
through the education and immigration process. Today it has grown into a
cooperative that shares resources, mentorship, and opportunity across the
community it serves.`;

const UPDATES = [
  { id: 'u1', title: 'New scholarship cycle opens', date: '2026-08-01' },
  { id: 'u2', title: 'Partner onboarding cohort completed', date: '2026-07-18' },
];

const CONTRIBUTIONS = [
  { id: 'c1', name: 'Member-led tutoring session', detail: 'Hosted by a volunteer member' },
  { id: 'c2', name: 'Community fundraiser', detail: 'Supported this quarter\'s program costs' },
];

export interface CommunityInvitationContext {
  inviter?: string;
  targetName?: string;
  targetPurpose?: string;
  message?: string;
}

interface CommunityPageProps {
  invitation?: CommunityInvitationContext;
  onRecipientAction?: (
    outcome: "join" | "express_interest" | "declined",
  ) => void;
}

export default function CommunityPage({
  invitation,
  onRecipientAction,
}: CommunityPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleExpressInterest = (e: React.FormEvent) => {
    e.preventDefault();
    onRecipientAction?.("express_interest");
    // Wire this up to the real intake endpoint once available.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {invitation?.targetName ?? "CTBC Community"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {invitation?.targetPurpose ??
              "The people and story behind the cooperative."}
          </p>
          {invitation?.inviter && (
            <p className="mt-3 text-sm text-muted-foreground">
              Invited by {invitation.inviter}
            </p>
          )}
          {invitation?.message && (
            <p className="mt-2 text-sm text-muted-foreground">
              {invitation.message}
            </p>
          )}
        </header>

        <section id="story" className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Community Story</h2>
          <p className="leading-relaxed text-muted-foreground">{COMMUNITY_STORY}</p>
        </section>

        <section id="updates" className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Community Updates</h2>
          <ul className="space-y-2">
            {UPDATES.map((update) => (
              <li
                key={update.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
              >
                <span>{update.title}</span>
                <span className="text-sm text-muted-foreground">{update.date}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="contributions" className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Contribution Highlights</h2>
          <ul className="space-y-2">
            {CONTRIBUTIONS.map((c) => (
              <li key={c.id} className="rounded-md border border-border bg-card px-4 py-3">
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.detail}</div>
              </li>
            ))}
          </ul>
        </section>

        <section id="express-interest" className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-xl font-semibold">Express Interest</h2>
          {submitted ? (
            <p className="text-muted-foreground">
              Thanks for reaching out — someone from the team will follow up soon.
            </p>
          ) : (
            <form onSubmit={handleExpressInterest} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Express Interest
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
