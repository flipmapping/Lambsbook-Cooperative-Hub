import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink, Archive } from "lucide-react";

interface ApplicantDocument {
  id: string;
  prospect_id: string;
  document_type: string;
  file_name: string;
  storage_url: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
}

function formatDocType(docType: string): string {
  return docType.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

export default function ApplicantDocumentCenter() {
  const [, params] = useRoute("/hub/applicant/documents/:id");
  const id = params?.id ?? "";

  const { data: documents = [], isLoading, isError } = useQuery<ApplicantDocument[]>({
    queryKey: [`/api/admissions/prospects/${id}/documents`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admissions/prospects/${id}/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      return res.json();
    },
    enabled: !!id,
  });

  const active   = documents.filter((d) => !d.archived);
  const archived = documents.filter((d) => d.archived);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-2xl flex items-center gap-3">
          <Link href={`/hub/applicant/status/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Status
            </Button>
          </Link>
          <span className="text-sm font-medium">My Documents</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Loading your documents\u2026
          </p>
        )}

        {isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load documents. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && documents.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No documents have been registered for your application yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Documents will appear here once your admissions advisor registers them.
              </p>
            </CardContent>
          </Card>
        )}

        {active.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              Active Documents ({active.length})
            </h2>
            {active.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Badge variant="outline" className="text-xs mb-1">
                            {formatDocType(doc.document_type)}
                          </Badge>
                          <p className="text-sm font-medium leading-tight truncate">
                            {doc.file_name}
                          </p>
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered {formatDate(doc.created_at)}
                          </p>
                        </div>
                        {doc.storage_url && (
                          <a
                            href={doc.storage_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              <ExternalLink className="h-3 w-3" />
                              View
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-1.5">
              <Archive className="h-3.5 w-3.5" />
              Archived ({archived.length})
            </h2>
            {archived.map((doc) => (
              <Card key={doc.id} className="opacity-60">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-xs mb-0.5">
                        {formatDocType(doc.document_type)}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-through truncate">
                        {doc.file_name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href={`/hub/applicant/appointments/${id}`}>
            <button className="text-xs text-primary underline hover:text-primary/80">
              View My Appointments
            </button>
          </Link>
        </div>
        <p className="text-xs text-center text-muted-foreground pt-2">
          Questions? Contact{" "}
          <a href="mailto:admissions@lambsbook.net" className="underline hover:text-foreground">
            admissions@lambsbook.net
          </a>
        </p>
      </div>
    </div>
  );
}
