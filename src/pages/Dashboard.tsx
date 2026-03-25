import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { fetchTotalEarnings } from "../services/earningsService";

export default function Dashboard() {
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawSession = localStorage.getItem("supabase.auth.token") || "null";
    console.log("RAW_LOCALSTORAGE_SESSION:", rawSession);
    try {
      const parsedSession = JSON.parse(rawSession);
      console.log("PARSED_LOCALSTORAGE_SESSION:", parsedSession);
      console.log("ACCESS_TOKEN:", parsedSession?.access_token || null);
    } catch (e) {
      console.log("SESSION_PARSE_ERROR:", e);
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
              ? "Loading..."
              : error
              ? "Error"
              : `${totalEarnings?.toLocaleString()} VND`
          }
        />

        <KpiCard title="Active Members" value="245" />
        <KpiCard title="Active Tutors" value="18" />
        <KpiCard title="Open Settlement Periods" value="2" />
        <button
          style={{
            marginTop: "24px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
          onClick={async () => {
            const session = JSON.parse(
              localStorage.getItem("supabase.auth.token") || "null"
            );

            const accessToken = session?.access_token;

            if (!accessToken) {
              console.log("No access token found.");
              return;
            }

            try {
              const response = await fetch(
                "/api/kpis/admin-bundle?sbu_id=3f8d00b4-2360-4e7f-b806-5d7d4fc5787f",
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              const json = await response.json();

              console.log("KPI BUNDLE DATA:", json.data);
              console.log("KPI BUNDLE ERROR:", json.error);
            } catch (err) {
              console.log("KPI BUNDLE FETCH ERROR:", err);
            }
          }}
        >
          Debug: Load KPIs
        </button>
      </div>
    </div>
  );
}
