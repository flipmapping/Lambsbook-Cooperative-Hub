import { useEffect, useState } from 'react';

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
  params: Record<string, string | undefined>;
  invitation?: CommunityInvitationContext;
  community?: { id: string; name: string; description?: string | null; matrix_room_id?: string; matrix_room_url?: string; };
  onRecipientAction?: (
    outcome: "join" | "express_interest" | "declined",
  ) => void;
}

export default function CommunityPage({
  invitation,
  community,
  onRecipientAction,
}: CommunityPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [resolvedCommunity, setResolvedCommunity] = useState<
    CommunityPageProps['community'] | null
  >(null);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (community) {
      setResolvedCommunity(community);
      setCommunityError(null);
      setLoadingCommunity(false);
      return () => {
        cancelled = true;
      };
    }

    const communityId = new URLSearchParams(window.location.search).get('id')?.trim();

    if (!communityId) {
      setResolvedCommunity(null);
      setCommunityError('Community ID is missing.');
      setLoadingCommunity(false);
      return () => {
        cancelled = true;
      };
    }

    setLoadingCommunity(true);
    setCommunityError(null);
    setResolvedCommunity(null);

    fetch(`/api/communities/${encodeURIComponent(communityId)}`, {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load Community');
        }

        const loadedCommunity = await response.json();
        const loadedCommunityId =
          typeof loadedCommunity?.id === 'string'
            ? loadedCommunity.id.trim()
            : '';

        if (!loadedCommunityId) {
          throw new Error(
            'Community retrieval succeeded but no canonical Community ID was returned',
          );
        }

        if (!cancelled) {
          setResolvedCommunity(loadedCommunity);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCommunityError(
            error instanceof Error
              ? error.message
              : 'Failed to load Community',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCommunity(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [community]);

  const displayCommunity = community ?? resolvedCommunity;

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
            {invitation?.targetName ?? displayCommunity?.name ?? "CTBC Community"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {invitation?.targetPurpose ??
              displayCommunity?.description ??
              "The people and story behind the cooperative."}
          </p>
          {loadingCommunity && (
            <p className="mt-3 text-sm text-muted-foreground">
              Loading Community…
            </p>
          )}
          {communityError && (
            <p className="mt-3 text-sm font-medium text-destructive">
              {communityError}
            </p>
          )}
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

        <section id="communication" className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Community Communication</h2>
          {displayCommunity?.matrix_room_id && displayCommunity.matrix_room_url ? (
            <a href={displayCommunity.matrix_room_url} target="_blank" rel="noreferrer" className="inline-flex rounded-md border border-border bg-card px-4 py-3 font-medium hover:opacity-90">
              Open Community Communication
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Community communication is not configured yet.</p>
          )}
        </section>

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
                type="button"
                onClick={() => onRecipientAction?.("join")}
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Join
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Express Interest
              </button>
              <button
                type="button"
                onClick={() => onRecipientAction?.("declined")}
                className="rounded-md border border-border px-5 py-2.5 font-medium transition-opacity hover:opacity-90"
              >
                Decline
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
