import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Pencil, X, Check, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProspectDocument {
  id: string;
  prospect_id: string;
  document_type: string;
  file_name: string;
  storage_path: string | null;
  description: string | null;
  archived: boolean;
  created_at: string;
}

const DOCUMENT_TYPES = [
  "transcript",
  "passport",
  "visa",
  "recommendation_letter",
  "personal_statement",
  "cv_resume",
  "language_certificate",
  "financial_statement",
  "offer_letter",
  "other",
] as const;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

function formatDocType(docType: string): string {
  return docType.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface ProspectDocumentWorkspaceProps {
  prospectId: string;
}

export function ProspectDocumentWorkspace({
  prospectId,
}: ProspectDocumentWorkspaceProps) {
  const { toast } = useToast();
  const queryKey = [`/api/admissions/prospects/${prospectId}/documents`];

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);

  const [cType, setCType]          = useState("");
  const [cName, setCName]          = useState("");
  const [cUrl, setCUrl]            = useState("");
  const [cNotes, setCNotes]        = useState("");

  const [eType, setEType]          = useState("");
  const [eName, setEName]          = useState("");
  const [eUrl, setEUrl]            = useState("");
  const [eNotes, setENotes]        = useState("");

  const { data: documents = [], isLoading, isError } =
    useQuery<ProspectDocument[]>({
      queryKey,
      queryFn: async () => {
        const res = await apiRequest(
          "GET",
          `/api/admissions/prospects/${prospectId}/documents`,
        );
        if (!res.ok) throw new Error("Failed to load documents");
        return res.json();
      },
      enabled: !!prospectId,
    });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!cType)         throw new Error("Document type is required");
      if (!cName.trim())  throw new Error("File name is required");
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/documents`,
        {
          document_type: cType,
          file_name:     cName.trim(),
          storage_path:   cUrl.trim() || null,
          description:         cNotes.trim() || null,
        },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Document registered" });
      setCType(""); setCName(""); setCUrl(""); setCNotes("");
      setShowCreate(false);
    },
    onError: (e: Error) =>
      toast({ title: "Register failed", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admissions/prospects/${prospectId}/documents/${documentId}`,
        {
          ...(eType               && { document_type: eType }),
          ...(eName.trim()        && { file_name: eName.trim() }),
          ...(eUrl !== undefined  && { storage_path: eUrl.trim() || null }),
          ...(eNotes !== undefined && { description: eNotes.trim() || null }),
        },
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Document updated" });
      setEditingId(null);
    },
    onError: (e: Error) =>
      toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const archiveMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admissions/prospects/${prospectId}/documents/${documentId}/archive`,
      );
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "Archive failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Document archived" });
    },
    onError: (e: Error) =>
      toast({ title: "Archive failed", description: e.message, variant: "destructive" }),
  });

  function startEdit(doc: ProspectDocument) {
    setEditingId(doc.id);
    setEType(doc.document_type);
    setEName(doc.file_name);
    setEUrl(doc.storage_path ?? "");
    setENotes(doc.description ?? "");
  }

  const active   = documents.filter((d) => !d.archived);
  const archived = documents.filter((d) => d.archived);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
            <CardDescription className="text-xs">
              Register and manage prospect document metadata.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            Register
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create form */}
        {showCreate && (
          <div className="rounded-md border p-3 space-y-2 bg-muted/30">
            <p className="text-xs font-medium">Register document</p>
            <select
              value={cType}
              onChange={(e) => setCType(e.target.value)}
              className="w-full h-8 text-xs rounded-md border border-input bg-background px-3 py-1"
            >
              <option value="">Select document type…</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{formatDocType(t)}</option>
              ))}
            </select>
            <Input
              placeholder="File name (required)"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Storage URL (optional)"
              value={cUrl}
              onChange={(e) => setCUrl(e.target.value)}
              className="h-8 text-xs"
            />
            <Textarea
              placeholder="Notes (optional)"
              value={cNotes}
              onChange={(e) => setCNotes(e.target.value)}
              className="text-xs min-h-[48px]"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs"
                onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!cType || !cName.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Registering…" : "Register"}
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading documents…</p>}
        {isError   && <p className="text-sm text-destructive">Failed to load documents.</p>}

        {!isLoading && !isError && documents.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents registered yet.</p>
        )}

        {/* Active documents */}
        {active.map((doc) => (
          <div key={doc.id} className="rounded-md border p-3 space-y-2">
            {editingId === doc.id ? (
              <div className="space-y-2">
                <select
                  value={eType}
                  onChange={(e) => setEType(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-3 py-1"
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{formatDocType(t)}</option>
                  ))}
                </select>
                <Input value={eName} onChange={(e) => setEName(e.target.value)}
                  placeholder="File name" className="h-8 text-xs" />
                <Input value={eUrl} onChange={(e) => setEUrl(e.target.value)}
                  placeholder="Storage URL" className="h-8 text-xs" />
                <Textarea value={eNotes} onChange={(e) => setENotes(e.target.value)}
                  className="text-xs min-h-[48px]" placeholder="Notes" />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="h-7 text-xs"
                    onClick={() => setEditingId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 text-xs"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate(doc.id)}>
                    <Check className="h-3 w-3 mr-1" />
                    {updateMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {formatDocType(doc.document_type)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1 leading-tight truncate">
                      {doc.file_name}
                    </p>
                    {doc.storage_path && (
                      <a
                        href={doc.storage_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-0.5 block truncate"
                      >
                        {doc.storage_path}
                      </a>
                    )}
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 justify-end">
                  <Button size="sm" variant="ghost"
                    className="h-6 text-xs px-2 gap-1 text-muted-foreground"
                    onClick={() => startEdit(doc)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost"
                    className="h-6 text-xs px-2 gap-1 text-muted-foreground"
                    disabled={archiveMutation.isPending}
                    onClick={() => archiveMutation.mutate(doc.id)}>
                    <Archive className="h-3 w-3" /> Archive
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Archived documents */}
        {archived.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Archived</p>
            {archived.map((doc) => (
              <div key={doc.id}
                className="rounded-md border p-3 bg-muted/20 opacity-70">
                <div className="flex items-start gap-2">
                  <Archive className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <Badge variant="outline" className="text-xs mb-1">
                      {formatDocType(doc.document_type)}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-through leading-tight">
                      {doc.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registered {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
