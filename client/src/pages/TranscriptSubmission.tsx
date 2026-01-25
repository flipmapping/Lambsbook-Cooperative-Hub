import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, FileText, ExternalLink, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface FeedbackResponse {
  status: "success" | "error";
  google_doc_url?: string;
  feedback?: string;
  error?: string;
  message?: string;
}

export default function TranscriptSubmission() {
  const { toast } = useToast();
  const [taskPrompt, setTaskPrompt] = useState("");
  const [transcript, setTranscript] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [assessmentFramework, setAssessmentFramework] = useState("");
  const [skillType, setSkillType] = useState("");
  const [speakingPart, setSpeakingPart] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [result, setResult] = useState<FeedbackResponse | null>(null);

  // Check if task prompt warning should be shown
  const taskPromptWarning = useMemo(() => {
    const isIELTS = assessmentFramework === "ielts_academic" || assessmentFramework === "ielts_general";
    const hasTaskPrompt = taskPrompt.trim().length > 0;
    
    if (!isIELTS) return null;
    
    // Writing always needs task prompt
    if (skillType === "writing" && !hasTaskPrompt) {
      return "For accurate IELTS scoring and task-response evaluation, please include the original examiner question or task prompt. Feedback will otherwise focus mainly on language quality.";
    }
    
    // Speaking Part 2 & 3 only - strongly recommend task prompt
    // No warning for Part 1 or when part is not selected
    if (skillType === "speaking" && (speakingPart === "part_2" || speakingPart === "part_3") && !hasTaskPrompt) {
      return "For accurate IELTS scoring and task-response evaluation, please include the original examiner question or task prompt. Feedback will otherwise focus mainly on language quality.";
    }
    
    return null;
  }, [assessmentFramework, skillType, speakingPart, taskPrompt]);

  // Show speaking part selector only for IELTS speaking
  const showSpeakingPart = useMemo(() => {
    const isIELTS = assessmentFramework === "ielts_academic" || assessmentFramework === "ielts_general";
    return isIELTS && skillType === "speaking";
  }, [assessmentFramework, skillType]);

  const generateFeedbackMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        task_prompt: taskPrompt.trim() || null,
        transcript_text: transcript.trim(),
        youtube_url: youtubeUrl.trim() || null,
        assessment_framework: assessmentFramework,
        skill_type: skillType,
        speaking_part: speakingPart || null,
        current_level: currentLevel || null,
        target_level: targetLevel || null,
      };
      
      const response = await apiRequest("POST", "/api/education/generate-feedback", payload);
      return response.json();
    },
    onSuccess: (data: FeedbackResponse) => {
      setResult(data);
      if (data.status === "success") {
        toast({
          title: "Feedback Generated",
          description: "Your feedback document is ready.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate feedback",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setResult({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to generate feedback"
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate feedback",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!transcript.trim() && !youtubeUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide either a transcript or a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!assessmentFramework) {
      toast({
        title: "Validation Error",
        description: "Please select an Assessment Framework",
        variant: "destructive",
      });
      return;
    }

    if (!skillType) {
      toast({
        title: "Validation Error",
        description: "Please select a Skill Type",
        variant: "destructive",
      });
      return;
    }

    setResult(null);
    generateFeedbackMutation.mutate();
  };

  const handleReset = () => {
    setTaskPrompt("");
    setTranscript("");
    setYoutubeUrl("");
    setAssessmentFramework("");
    setSkillType("");
    setSpeakingPart("");
    setCurrentLevel("");
    setTargetLevel("");
    setResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Education Feedback Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          Submit student transcripts for AI-powered feedback generation
        </p>
      </div>

      <Card data-testid="card-submission-form">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcript Submission
          </CardTitle>
          <CardDescription>
            Paste a student transcript or provide a YouTube video URL for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Prompt Section - NEW */}
          <div className="space-y-2">
            <Label htmlFor="task-prompt" data-testid="label-task-prompt">
              Examiner Question(s) / Task Prompt
            </Label>
            <Textarea
              id="task-prompt"
              placeholder="Paste the exact IELTS question(s), cue card, or writing task..."
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-task-prompt"
            />
            <p className="text-xs text-muted-foreground" data-testid="text-task-prompt-helper">
              Paste the exact IELTS question(s), cue card, or writing task. Required for IELTS Writing and Speaking Part 2 & 3.
            </p>
          </div>

          {/* Task Prompt Warning */}
          {taskPromptWarning && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800" data-testid="alert-task-prompt-warning">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200" data-testid="text-warning-message">
                {taskPromptWarning}
              </AlertDescription>
            </Alert>
          )}

          {/* Student Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transcript" data-testid="label-transcript">
                {skillType === "writing" ? "Writing Submission" : "Speaking Transcript"} (paste full content here)
              </Label>
              <Textarea
                id="transcript"
                placeholder={skillType === "writing" 
                  ? "Paste the student's writing submission here..." 
                  : "Paste the student's speaking transcript here..."}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[150px]"
                data-testid="input-transcript"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube-url" data-testid="label-youtube">
                YouTube Video URL (extract transcript automatically)
              </Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                data-testid="input-youtube-url"
              />
              <p className="text-xs text-muted-foreground">
                Paste a YouTube link to automatically extract its transcript. This is optional if you've already pasted the transcript above.
              </p>
            </div>
          </div>

          {/* Assessment Configuration Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium" data-testid="text-config-heading">Assessment Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="framework" data-testid="label-framework">
                  Assessment Framework
                </Label>
                <Select value={assessmentFramework} onValueChange={setAssessmentFramework}>
                  <SelectTrigger id="framework" data-testid="select-framework">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ielts_academic" data-testid="option-ielts-academic">IELTS Academic</SelectItem>
                    <SelectItem value="ielts_general" data-testid="option-ielts-general">IELTS General</SelectItem>
                    <SelectItem value="business_communication" data-testid="option-business">Business Communication</SelectItem>
                    <SelectItem value="workplace_english" data-testid="option-workplace">Workplace English</SelectItem>
                    <SelectItem value="presentation_skills" data-testid="option-presentation">Presentation Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-type" data-testid="label-skill">
                  Skill Type
                </Label>
                <Select value={skillType} onValueChange={(value) => {
                  setSkillType(value);
                  if (value !== "speaking") setSpeakingPart("");
                }}>
                  <SelectTrigger id="skill-type" data-testid="select-skill">
                    <SelectValue placeholder="Select skill type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speaking" data-testid="option-speaking">Speaking</SelectItem>
                    <SelectItem value="writing" data-testid="option-writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speaking Part selector - only for IELTS Speaking */}
              {showSpeakingPart && (
                <div className="space-y-2">
                  <Label htmlFor="speaking-part" data-testid="label-speaking-part">
                    Speaking Part
                  </Label>
                  <Select value={speakingPart} onValueChange={setSpeakingPart}>
                    <SelectTrigger id="speaking-part" data-testid="select-speaking-part">
                      <SelectValue placeholder="Select speaking part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part_1" data-testid="option-part-1">Part 1 - Introduction</SelectItem>
                      <SelectItem value="part_2" data-testid="option-part-2">Part 2 - Cue Card</SelectItem>
                      <SelectItem value="part_3" data-testid="option-part-3">Part 3 - Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-level" data-testid="label-current">
                  Current Level (optional)
                </Label>
                <Select value={currentLevel} onValueChange={setCurrentLevel}>
                  <SelectTrigger id="current-level" data-testid="select-current-level">
                    <SelectValue placeholder="Select current level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="band_3_4" data-testid="option-band-3-4">Band 3–4</SelectItem>
                    <SelectItem value="band_5_6" data-testid="option-band-5-6">Band 5–6</SelectItem>
                    <SelectItem value="band_6_7" data-testid="option-band-6-7">Band 6–7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-level" data-testid="label-target">
                  Target Level (optional)
                </Label>
                <Select value={targetLevel} onValueChange={setTargetLevel}>
                  <SelectTrigger id="target-level" data-testid="select-target-level">
                    <SelectValue placeholder="Select target level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="band_5" data-testid="option-target-5">Band 5</SelectItem>
                    <SelectItem value="band_6_5" data-testid="option-target-6-5">Band 6.5</SelectItem>
                    <SelectItem value="band_7" data-testid="option-target-7">Band 7</SelectItem>
                    <SelectItem value="band_8" data-testid="option-target-8">Band 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={generateFeedbackMutation.isPending}
              className="flex-1"
              data-testid="button-generate"
            >
              {generateFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Structured Feedback"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={generateFeedbackMutation.isPending}
              data-testid="button-reset"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card className="mt-6" data-testid="card-result">
          <CardContent className="pt-6">
            {result.status === "success" ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle data-testid="text-success-title">Feedback Generated Successfully</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p data-testid="text-success-message">
                      {result.message || "Your structured feedback has been generated."}
                    </p>
                    {result.google_doc_url && (
                      <Button asChild variant="outline" className="mt-3" data-testid="link-google-doc">
                        <a href={result.google_doc_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Feedback Google Document
                        </a>
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
                
                {result.feedback && (
                  <div className="border rounded-lg p-4 bg-muted/30" data-testid="section-feedback">
                    <h3 className="font-semibold mb-3" data-testid="text-feedback-heading">Generated Feedback</h3>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none text-sm feedback-content"
                      data-testid="text-feedback-content"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4">
                              <table className="w-full border-collapse border border-border text-left text-sm">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-muted">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="border border-border px-3 py-2 font-semibold">{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-border px-3 py-2 align-top">{children}</td>
                          ),
                          tr: ({ children }) => (
                            <tr className="even:bg-muted/50">{children}</tr>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3">{children}</p>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold mt-6 mb-3">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold mt-5 mb-2">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {result.feedback}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive" data-testid="alert-error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle data-testid="text-error-title">Error</AlertTitle>
                <AlertDescription data-testid="text-error-message">
                  {result.error || "An unexpected error occurred. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
