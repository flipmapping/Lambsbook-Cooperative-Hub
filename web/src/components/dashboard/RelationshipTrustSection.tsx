import type { RelationshipContext } from "@/components/dashboard/types";

type RelationshipTrustSectionProps = {
  relationshipContext: RelationshipContext;
};

export function RelationshipTrustSection({
  relationshipContext,
}: RelationshipTrustSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Relationship and Trust
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Cooperative belonging is relational
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">Membership</p>
          <p className="mt-2 text-sm text-slate-300">
            {relationshipContext.membershipLabel}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">Invitation Boundary</p>
          <p className="mt-2 text-sm text-slate-300">
            {relationshipContext.invitationContextLabel ?? "Invitation acceptance remains separate from dashboard participation."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">Trust Context</p>
          <p className="mt-2 text-sm text-slate-300">
            {relationshipContext.trustMessage}
          </p>
        </div>
      </div>
    </section>
  );
}
