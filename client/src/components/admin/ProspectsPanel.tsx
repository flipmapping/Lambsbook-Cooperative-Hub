import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Prospect {
  id: string;
  full_name: string;
  phone: string | null;
  student_number: string | null;
  email: string | null;
  country: string | null;
  program_of_interest: string | null;
  school: string | null;
  province: string | null;
  external_reference: string | null;
  notes: string | null;
  campaign_source: string | null;
  import_status: string | null;
}
const columns = [
  ["full_name", "Full Name"], ["phone", "Phone"], ["student_number", "Student Number"],
  ["email", "Email"], ["country", "Country"], ["program_of_interest", "Program"],
  ["school", "School"], ["province", "Province"], ["external_reference", "External Reference"],
  ["notes", "Notes"], ["campaign_source", "Campaign Source"], ["import_status", "Import Status"],
] as const;

export function ProspectsPanel() {
  const [search, setSearch] = useState("");
  const query = useQuery<Prospect[]>({ queryKey: ["/api/admin/prospects"] });
  const needle = search.trim().toLowerCase();
  const filtered = (query.data ?? []).filter(row =>
    columns.some(([key]) => (row[key] ?? "").toLowerCase().includes(needle)));
  return (
    <Card data-testid="card-prospects">
      <CardHeader>
        <CardTitle>Prospects</CardTitle>
        <CardDescription>Browse prospect records and open their admissions workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Input aria-label="Search prospects" placeholder="Search prospects…" value={search}
            onChange={e => setSearch(e.target.value)} className="max-w-md" data-testid="input-prospect-search" />
          <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>Refresh</Button>
        </div>
        {query.isLoading ? <p role="status">Loading prospects…</p> : query.isError ?
          <p role="alert" className="text-destructive">Failed to load prospects. Check your administrator access and try again.</p> : <>
            <p className="text-sm text-muted-foreground">{filtered.length} of {query.data?.length ?? 0} prospects</p>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">{columns.map(([key, label]) =>
                  <th key={key} className="p-3 text-left font-medium whitespace-nowrap">{label}</th>)}</tr></thead>
                <tbody data-testid="table-prospects-body">
                  {filtered.map(row => <tr key={row.id} className="border-b" data-testid={`prospect-row-${row.id}`}>
                    {columns.map(([key]) => <td key={key} className="p-3 align-top">
                      {key === "full_name" ? <Link href={`/hub/admin/prospects/${encodeURIComponent(row.id)}`}
                        className="font-medium underline">{row.full_name}</Link> :
                        key === "import_status" ? <Badge variant="outline">{row[key] || "—"}</Badge> :
                          <span className="block max-w-xs break-words">{row[key] || "—"}</span>}
                    </td>)}
                  </tr>)}
                  {!filtered.length && <tr><td colSpan={columns.length} className="p-6 text-center text-muted-foreground">
                    {needle ? "No prospects match your search." : "No prospects found."}
                  </td></tr>}
                </tbody>
              </table>
            </div>
          </>}
      </CardContent>
    </Card>
  );
}
