import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface TemplateFields {
  templateKey: string; version: number; status: string;
  enSubject: string; enMessage: string;
  viSubject: string | null; viMessage: string | null;
  zhSubject: string | null; zhMessage: string | null;
  approvedVariables: string[];
}
interface Template extends TemplateFields {
  id: string; updatedAt: string | null; updatedBy: string | null;
}
const empty: TemplateFields = {
  templateKey: "", version: 1, status: "draft", enSubject: "", enMessage: "",
  viSubject: null, viMessage: null, zhSubject: null, zhMessage: null, approvedVariables: [],
};
// Preserve nulls, whitespace, variables and all languages unless explicitly edited.
export function changedTemplateFields(original: TemplateFields, edited: TemplateFields) {
  return Object.fromEntries(Object.keys(empty).filter(key =>
    JSON.stringify(original[key as keyof TemplateFields]) !== JSON.stringify(edited[key as keyof TemplateFields]))
    .map(key => [key, edited[key as keyof TemplateFields]]));
}

export function NotificationTemplatesPanel() {
  const { toast } = useToast();
  const query = useQuery<Template[]>({ queryKey: ["/api/admin/notification-templates"] });
  const [selected, setSelected] = useState<Template | null>(null);
  const [form, setForm] = useState<TemplateFields | null>(null);
  const [variables, setVariables] = useState("");
  const [variablesChanged, setVariablesChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const edit = (row: Template | null) => {
    setSelected(row);
    setForm(row ? { ...row, approvedVariables: [...row.approvedVariables] } : { ...empty });
    setVariables(row?.approvedVariables.join(", ") ?? "");
    setVariablesChanged(false);
    setError(null);
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!form) throw new Error("No template selected.");
      const edited = { ...form, approvedVariables: variablesChanged
        ? variables.split(",").map(value => value.trim()).filter(Boolean) : form.approvedVariables };
      const payload = selected ? changedTemplateFields(selected, edited) :
        Object.fromEntries(Object.keys(empty).map(key => [key, edited[key as keyof TemplateFields]]));
      if (selected && !Object.keys(payload).length) return;
      await apiRequest(selected ? "PATCH" : "POST",
        `/api/admin/notification-templates${selected ? `/${encodeURIComponent(selected.id)}` : ""}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notification-templates"] });
      setForm(null); setSelected(null); setError(null);
      toast({ title: "Notification template saved" });
    },
    onError: (err: Error) => setError(err.message),
  });
  const update = (key: keyof TemplateFields, value: string | number) =>
    setForm(current => current ? { ...current, [key]: value } : null);
  return (
    <Card data-testid="card-notification-templates">
      <CardHeader>
        <CardTitle>Notification Templates</CardTitle>
        <CardDescription>Registered notification templates and their approved variables. Changes are saved only when you choose Save.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button onClick={() => edit(null)} disabled={form !== null} data-testid="button-new-notification-template">Create template</Button>
          <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching || form !== null}>Refresh</Button>
        </div>
        {query.isLoading && <p role="status">Loading notification templates…</p>}
        {query.isError && <p role="alert" className="text-destructive">Failed to load notification templates. Check your administrator access and try again.</p>}
        {form && <form className="rounded-lg border p-4 space-y-4" onSubmit={e => { e.preventDefault(); setError(null); save.mutate(); }}>
          <h3 className="font-semibold">{selected ? "Edit Notification Template" : "Create Notification Template"}</h3>
          <fieldset disabled={save.isPending} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm">Template key<Input required value={form.templateKey} onChange={e => update("templateKey", e.target.value)} /></label>
              <label className="text-sm">Version<Input required type="number" min={1} step={1} value={form.version} onChange={e => update("version", Number(e.target.value))} /></label>
              <label className="text-sm">Status<select className="block w-full h-9 rounded-md border bg-background px-3"
                value={form.status} onChange={e => update("status", e.target.value)}>
                {!["draft", "active", "retired"].includes(form.status) && <option value={form.status}>{form.status}</option>}
                <option value="draft">Draft</option><option value="active">Active</option><option value="retired">Retired</option>
              </select></label>
            </div>
            {(["en", "vi", "zh"] as const).map((locale, index) => <div key={locale} className="space-y-2 rounded-md border p-3">
              <h4 className="font-medium">{["English", "Vietnamese", "Chinese"][index]}</h4>
              <label className="block text-sm">Subject<Input value={form[`${locale}Subject`] ?? ""}
                aria-label={`${locale} subject`} onChange={e => update(`${locale}Subject`, e.target.value)} /></label>
              <label className="block text-sm">Message<Textarea rows={5} value={form[`${locale}Message`] ?? ""}
                aria-label={`${locale} message`} onChange={e => update(`${locale}Message`, e.target.value)} /></label>
            </div>)}
            <label className="block text-sm">Approved variables (comma separated)
              <Input value={variables} onChange={e => { setVariables(e.target.value); setVariablesChanged(true); }} />
            </label>
            {error && <p role="alert" className="text-destructive break-words">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" data-testid="button-save-notification-template">{save.isPending ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="outline" onClick={() => { setForm(null); setSelected(null); setError(null); }}>Cancel</Button>
            </div>
          </fieldset>
        </form>}
        {!query.isError && !query.isLoading && <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">{["Template key", "Version", "Status", "Languages", "Approved variables", "Actions"].map(label =>
              <th key={label} className="text-left p-3">{label}</th>)}</tr></thead>
            <tbody>{query.data?.map(row => <tr key={row.id} className="border-b" data-testid={`notification-template-${row.id}`}>
              <td className="p-3 font-medium">{row.templateKey}</td><td className="p-3">{row.version}</td>
              <td className="p-3"><Badge variant="outline">{row.status}</Badge></td>
              <td className="p-3">{(["en", "vi", "zh"] as const).filter(locale => row[`${locale}Subject`] || row[`${locale}Message`]).map(locale => locale.toUpperCase()).join(", ") || "—"}</td>
              <td className="p-3">{row.approvedVariables.join(", ") || "—"}</td>
              <td className="p-3"><Button variant="outline" size="sm" disabled={form !== null} onClick={() => edit(row)}>View / Edit</Button></td>
            </tr>)}
              {!query.data?.length && <tr><td colSpan={6} className="p-6 text-center">No notification templates found.</td></tr>}
            </tbody>
          </table>
        </div>}
      </CardContent>
    </Card>
  );
}
