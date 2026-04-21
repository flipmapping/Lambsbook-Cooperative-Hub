import { MOCK_CONTRIBUTIONS } from "@/lib/contributions/mock-data";
import ContributionCard from "@/components/contributions/ContributionCard";

export default function ContributionActivity() {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold">Program Contributions</h2>

      <div className="space-y-3">
        {MOCK_CONTRIBUTIONS.map((c) => (
          <ContributionCard key={c.id} contribution={c} />
        ))}
      </div>
    </div>
  );
}
