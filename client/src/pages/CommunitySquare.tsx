import { Link } from 'wouter';

interface SquareTile {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

// NOTE: Content below is placeholder scaffolding. Wire each tile to the
// real data source (Growth Engine programs/events API, CMS, etc.) when
// those modules are available in this workspace.
const SQUARE_TILES: SquareTile[] = [
  {
    id: 'ctbc-community',
    title: 'CTBC Community',
    description: 'Meet the cooperative and see who is part of it.',
    href: '/organization/community',
    cta: 'Visit Community',
  },
  {
    id: 'community-story',
    title: 'Community Story',
    description: 'How the cooperative came together and where it is headed.',
    href: '/organization/community#story',
    cta: 'Read the Story',
  },
  {
    id: 'programs',
    title: 'Programs',
    description: 'Active education and support programs from the Growth Engine.',
    href: '/growth',
    cta: 'View Programs',
  },
  {
    id: 'webinar',
    title: 'Upcoming Webinar',
    description: 'Details on the next live session will appear here.',
    href: '/growth',
    cta: 'See Schedule',
  },
  {
    id: 'updates',
    title: 'Community Updates',
    description: 'The latest news and announcements from the cooperative.',
    href: '/organization/community#updates',
    cta: 'Read Updates',
  },
  {
    id: 'contribution-highlights',
    title: 'Contribution Highlights',
    description: 'Recent contributions from members worth celebrating.',
    href: '/organization/community#contributions',
    cta: 'See Highlights',
  },
];

export default function CommunitySquare() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Community Square</h1>
          <p className="mt-1 text-muted-foreground">
            The gathering point for the CTBC community — programs, updates, and ways to
            get involved.
          </p>
        </header>

        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SQUARE_TILES.map((tile) => (
            <Link key={tile.id} href={tile.href}>
              <a className="block rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent">
                <h2 className="text-lg font-semibold">{tile.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tile.description}</p>
                <span className="mt-3 inline-block text-sm font-medium text-primary">
                  {tile.cta} →
                </span>
              </a>
            </Link>
          ))}
        </section>

        <section className="rounded-lg border border-border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold">Want to get involved?</h2>
          <p className="mt-1 text-muted-foreground">
            Express interest and a member of the team will follow up with next steps.
          </p>
          <Link href="/organization/community#express-interest">
            <a className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Express Interest
            </a>
          </Link>
        </section>
      </main>
    </div>
  );
}
