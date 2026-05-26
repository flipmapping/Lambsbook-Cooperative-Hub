import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { fetchTotalEarnings } from "../services/earningsService";

export default function Dashboard() {
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawSession = localStorage.getItem("supabase.auth.token") || "null";
    try {
      const parsedSession = JSON.parse(rawSession);
    } catch (e) {
    }
    async function loadEarnings() {
      try {
        const total = await fetchTotalEarnings();
        setTotalEarnings(total);
      } catch (err: any) {
        setError(err.message || "Failed to load earnings");
      } finally {
        setLoading(false);
      }
    }

    loadEarnings();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: "24px" }}>SBU Overview</h2>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <KpiCard
          title="Total Earnings"
          value={
            loading
              ? "Loading data..."
              : error
              ? "Unavailable"
              : `${totalEarnings?.toLocaleString()} VND`
          }
        />

        <KpiCard title="Active Members" value="245" />
        <KpiCard title="Active Tutors" value="18" />
        <KpiCard title="Open Settlement Periods" value="2" />
      </div>
    </div>
  );
}
