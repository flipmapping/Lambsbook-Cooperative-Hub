import { useState } from 'react';
import { Link } from 'wouter';

interface OrgUnit {
  id: string;
  name: string;
  role: string;
  children?: OrgUnit[];
}

const ORG_HIERARCHY: OrgUnit[] = [
  {
    id: 'founder',
    name: 'Founder',
    role: 'Executive Direction',
    children: [
      {
        id: 'programs',
        name: 'Programs',
        role: 'Program Leads',
        children: [
          { id: 'education', name: 'Education', role: 'Program Manager' },
          { id: 'immigration', name: 'Immigration Services', role: 'Program Manager' },
        ],
      },
      {
        id: 'operations',
        name: 'Operations',
        role: 'Operations Leads',
        children: [
          { id: 'admissions', name: 'Admissions', role: 'Coordinator' },
          { id: 'partnerships', name: 'Partnerships', role: 'Coordinator' },
        ],
      },
    ],
  },
];

function OrgNode({ unit, depth = 0 }: { unit: OrgUnit; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 20 }} className="mb-2">
      <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
        <span className="font-medium">{unit.name}</span>
        <span className="text-sm text-muted-foreground">{unit.role}</span>
      </div>
      {unit.children?.map((child) => (
        <OrgNode key={child.id} unit={child} depth={depth + 1} />
      ))}
    </div>
  );
}

const WORKSPACES = [
  { id: 'education-hub', label: 'Education Hub', href: '/hub' },
  { id: 'admin-dashboard', label: 'Admin Dashboard', href: '/hub/admin' },
  { id: 'revenue-console', label: 'Revenue Console', href: '/hub/admin/revenue' },
  { id: 'governance', label: 'Governance', href: '/hub/admin/governance' },
];

const MANAGEMENT_ACTIONS = [
  { id: 'invite-member', label: 'Invite Member' },
  { id: 'review-partners', label: 'Review Partner Onboarding' },
  { id: 'export-report', label: 'Export Organization Report' },
];

export default function OrganizationStudio() {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Organization Studio</h1>
          <p className="mt-1 text-muted-foreground">
            Overview, structure, and management for the cooperative.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Organization Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Active Programs</div>
              <div className="text-2xl font-semibold">2</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Workspaces</div>
              <div className="text-2xl font-semibold">{WORKSPACES.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Open Actions</div>
              <div className="text-2xl font-semibold">{MANAGEMENT_ACTIONS.length}</div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Organization Hierarchy</h2>
          <div className="rounded-lg border border-border p-4">
            {ORG_HIERARCHY.map((unit) => (
              <OrgNode key={unit.id} unit={unit} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Workspace Launcher</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WORKSPACES.map((ws) => (
              <a
                key={ws.id}
                href={ws.href}
                className="rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
              >
                {ws.label}
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Management Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/organization/community/start">
              <a className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Start a Community
              </a>
            </Link>
            {MANAGEMENT_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => setActiveAction(action.id)}
                className="rounded-md border border-border bg-card px-4 py-2 transition-colors hover:bg-accent"
              >
                {action.label}
              </button>
            ))}
          </div>
          {activeAction && (
            <p className="mt-4 text-sm text-muted-foreground">
              Selected action: {MANAGEMENT_ACTIONS.find((a) => a.id === activeAction)?.label}.
              Wire this up to your actual backend/service layer when ready.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
