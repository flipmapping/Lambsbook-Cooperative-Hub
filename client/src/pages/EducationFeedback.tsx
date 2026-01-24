import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  FolderOpen,
  AlertTriangle,
  Loader2,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface DocumentInfo {
  id: string;
  name: string;
  modifiedTime: string;
}

interface DocumentPreview {
  title: string;
  metadata: Record<string, string>;
  hasSubmission: boolean;
  submissionType?: "speaking" | "writing" | "both";
  validation: { valid: boolean; errors: string[]; warnings: string[] };
}

interface FeedbackResult {
  docId: string;
  docName: string;
  success: boolean;
  feedback?: string;
  error?: string;
  metadata?: Record<string, string>;
}

interface ConnectionStatus {
  connected: boolean;
  folderId?: string;
  folderName: string;
  error?: string;
}

export default function EducationFeedback() {
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Check folder connection status
  const { data: status, isLoading: statusLoading } = useQuery<ConnectionStatus>({
    queryKey: ["/api/education/status"],
  });

  // List documents in the folder
  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = useQuery<DocumentInfo[]>({
    queryKey: ["/api/education/documents"],
    enabled: status?.connected === true,
  });

  // Get document preview
  const { data: preview, isLoading: previewLoading } = useQuery<DocumentPreview>({
    queryKey: ["/api/education/documents", selectedDoc, "preview"],
    enabled: !!selectedDoc && previewOpen,
  });

  // Generate feedback for a single document
  const generateFeedbackMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await apiRequest("POST", `/api/education/documents/${docId}/feedback`);
      return response.json();
    },
    onSuccess: (data: FeedbackResult) => {
      if (data.success) {
        toast({
          title: "Feedback Generated",
          description: `Successfully generated feedback for "${data.docName}"`,
        });
      } else {
        toast({
          title: "Feedback Generation Issue",
          description: data.error || "Document validation failed",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/education/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate feedback",
        variant: "destructive",
      });
    },
  });

  // Process all documents
  const processAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/education/process-all");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${data.total} documents: ${data.successful} successful, ${data.failed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/education/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process documents",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (docId: string) => {
    setSelectedDoc(docId);
    setPreviewOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (statusLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Education Feedback Agent
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered feedback generation for student submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchDocs()}
            disabled={!status?.connected}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => processAllMutation.mutate()}
            disabled={!status?.connected || processAllMutation.isPending}
            data-testid="button-process-all"
          >
            {processAllMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Process All
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card data-testid="card-connection-status">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Google Drive Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="flex items-center gap-2" data-testid="status-connected">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span data-testid="text-folder-name">Connected to folder: <strong>{status.folderName}</strong></span>
            </div>
          ) : (
            <Alert variant="destructive" data-testid="alert-not-connected">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Folder Not Found</AlertTitle>
              <AlertDescription>
                {status?.error || `Please create a folder named "Lambsbook – Master Templates" in your Google Drive.`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      {status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Student Documents</CardTitle>
            <CardDescription>
              Documents from your Master Templates folder ready for feedback generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`card-document-${doc.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium" data-testid={`text-doc-name-${doc.id}`}>
                          {doc.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Modified: {formatDate(doc.modifiedTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={previewOpen && selectedDoc === doc.id} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(doc.id)}
                            data-testid={`button-preview-${doc.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl" data-testid={`dialog-preview-${doc.id}`}>
                          <DialogHeader>
                            <DialogTitle data-testid="text-dialog-title">Document Preview</DialogTitle>
                            <DialogDescription>
                              Validation status and metadata for this document
                            </DialogDescription>
                          </DialogHeader>
                          {previewLoading ? (
                            <div className="space-y-3" data-testid="loading-preview">
                              <Skeleton className="h-6 w-full" />
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-6 w-1/2" />
                            </div>
                          ) : preview ? (
                            <div className="space-y-4" data-testid="content-preview">
                              <div>
                                <h4 className="font-medium mb-2">Validation Status</h4>
                                {preview.validation.valid ? (
                                  <Badge className="bg-green-500" data-testid="badge-valid">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Valid Template
                                  </Badge>
                                ) : (
                                  <div className="space-y-2">
                                    <Badge variant="destructive" data-testid="badge-invalid">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Invalid Template
                                    </Badge>
                                    <ul className="text-sm text-red-500 list-disc pl-5" data-testid="list-errors">
                                      {preview.validation.errors.map((err, i) => (
                                        <li key={i} data-testid={`text-error-${i}`}>{err}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              
                              <div data-testid="section-metadata">
                                <h4 className="font-medium mb-2">Metadata</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(preview.metadata).map(([key, value]) => (
                                    <div key={key} className="flex gap-2" data-testid={`metadata-${key.toLowerCase().replace(/\s+/g, '-')}`}>
                                      <span className="text-muted-foreground">{key}:</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div data-testid="section-submission">
                                <h4 className="font-medium mb-2">Submission Status</h4>
                                {preview.hasSubmission ? (
                                  <Badge data-testid="badge-submission-type">
                                    {preview.submissionType === "both" 
                                      ? "Speaking & Writing" 
                                      : preview.submissionType === "speaking" 
                                        ? "Speaking Task" 
                                        : "Writing Task"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" data-testid="badge-no-submission">No submission found</Badge>
                                )}
                              </div>
                              
                              {preview.validation.warnings && preview.validation.warnings.length > 0 && (
                                <div data-testid="section-warnings">
                                  <h4 className="font-medium mb-2 text-yellow-600">Warnings</h4>
                                  <ul className="text-sm text-yellow-600 list-disc pl-5" data-testid="list-warnings">
                                    {preview.validation.warnings.map((warn, i) => (
                                      <li key={i} data-testid={`text-warning-${i}`}>{warn}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        onClick={() => generateFeedbackMutation.mutate(doc.id)}
                        disabled={generateFeedbackMutation.isPending}
                        data-testid={`button-generate-${doc.id}`}
                      >
                        {generateFeedbackMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-1" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="empty-state-documents">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p data-testid="text-no-documents">No documents found in the Master Templates folder</p>
                <p className="text-sm mt-1" data-testid="text-add-docs-hint">
                  Add Google Docs to your "Lambsbook – Master Templates" folder
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card data-testid="card-how-it-works">
        <CardHeader>
          <CardTitle data-testid="text-how-it-works-title">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground" data-testid="list-instructions">
            <li data-testid="text-step-1">Copy a Master Template document in Google Drive</li>
            <li data-testid="text-step-2">Add student submission content to the Speaking or Writing Task section</li>
            <li data-testid="text-step-3">Fill in the Assessment Framework and other metadata fields</li>
            <li data-testid="text-step-4">Click "Generate" to have AI analyze and write feedback to the document</li>
            <li data-testid="text-step-5">Review and edit the AI-generated feedback in the document</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
