import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Plus, RefreshCw } from "lucide-react";

interface Member {
  id: string;
  member_type: string;
}

interface Program {
  id: string;
  name: string;
  sbu: string;
  is_active: boolean;
}

interface ProgramEligibility {
  id: string;
  member_id: string;
  program_id: string;
  eligible: boolean;
}

interface EnrollmentWorkflowProps {
  members: Member[];
  programs: Program[];
}

export function EnrollmentWorkflow({ members, programs }: EnrollmentWorkflowProps) {
  const { toast } = useToast();

  const [enrollMemberId, setEnrollMemberId] = useState<string>("");
  const [enrollProgramId, setEnrollProgramId] = useState<string>("");
  const [enrollAmount, setEnrollAmount] = useState<string>("");
  const [enrollReference, setEnrollReference] = useState<string>("");
  const [enrollDraftResult, setEnrollDraftResult] = useState<Record<string, any> | null>(null);

  const { data: memberEligibility = [], isLoading: eligibilityLoading } = useQuery<ProgramEligibility[]>({
    queryKey: ["/api/admin/program-eligibility", enrollMemberId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/program-eligibility?member_id=${enrollMemberId}`);
      if (!res.ok) throw new Error("Failed to fetch eligibility");
      return res.json();
    },
    enabled: !!enrollMemberId,
  });

  const assignEligibilityMutation = useMutation({
    mutationFn: async ({ member_id, program_id }: { member_id: string; program_id: string }) => {
      const res = await apiRequest("POST", "/api/admin/program-eligibility", {
        member_id,
        program_id,
        eligible: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/program-eligibility", enrollMemberId] });
      toast({ title: "Eligibility assigned" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to assign eligibility", description: err.message, variant: "destructive" });
    },
  });

  const createEnrollmentPaymentMutation = useMutation({
    mutationFn: async ({
      member_id,
      program_id,
      amount,
      reference,
    }: {
      member_id: string;
      program_id: string;
      amount: number;
      reference?: string;
    }) => {
      const res = await apiRequest("POST", "/api/admin/enrollment-payment", {
        member_id,
        program_id,
        amount,
        reference: reference || null,
      });
      return res.json();
    },
    onSuccess: (result: any) => {
      setEnrollDraftResult(result?.data ?? result);
      toast({ title: "Enrollment payment draft created" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create enrollment payment", description: err.message, variant: "destructive" });
    },
  });

  const isEligible =
    enrollMemberId && enrollProgramId
      ? memberEligibility.some((e) => e.program_id === enrollProgramId && e.eligible)
      : null;

  const parsedAmount = parseFloat(enrollAmount);
  const canSubmit =
    !!enrollMemberId &&
    !!enrollProgramId &&
    parsedAmount > 0 &&
    isEligible === true &&
    !createEnrollmentPaymentMutation.isPending;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create Enrollment Payment Draft</CardTitle>
          <CardDescription>
            Select a member and program, confirm eligibility, then create the payment draft event.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Member selector */}
          <div className="space-y-1">
            <Label htmlFor="enroll-member">Member</Label>
            <Select
              value={enrollMemberId}
              onValueChange={(v) => {
                setEnrollMemberId(v);
                setEnrollDraftResult(null);
              }}
            >
              <SelectTrigger id="enroll-member" data-testid="select-enroll-member">
                <SelectValue placeholder="Select a member..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id} data-testid={`option-member-${m.id}`}>
                    {m.member_type} — {m.id.slice(0, 8)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Program selector */}
          <div className="space-y-1">
            <Label htmlFor="enroll-program">Program</Label>
            <Select
              value={enrollProgramId}
              onValueChange={(v) => {
                setEnrollProgramId(v);
                setEnrollDraftResult(null);
              }}
            >
              <SelectTrigger id="enroll-program" data-testid="select-enroll-program">
                <SelectValue placeholder="Select a program..." />
              </SelectTrigger>
              <SelectContent>
                {programs.filter((p) => p.is_active).map((p) => (
                  <SelectItem key={p.id} value={p.id} data-testid={`option-program-${p.id}`}>
                    {p.name} ({p.sbu})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <Label htmlFor="enroll-amount">Amount (USD)</Label>
            <Input
              id="enroll-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={enrollAmount}
              onChange={(e) => setEnrollAmount(e.target.value)}
              data-testid="input-enroll-amount"
            />
          </div>

          {/* Reference input */}
          <div className="space-y-1">
            <Label htmlFor="enroll-reference">Reference (optional)</Label>
            <Input
              id="enroll-reference"
              type="text"
              placeholder="Invoice number, order ID, etc."
              value={enrollReference}
              onChange={(e) => setEnrollReference(e.target.value)}
              data-testid="input-enroll-reference"
            />
          </div>

          {/* Eligibility status */}
          <div className="space-y-2">
            <Label>Eligibility Status</Label>
            <div className="flex items-center gap-3">
              {!enrollMemberId || !enrollProgramId ? (
                <Badge variant="secondary" data-testid="badge-eligibility-status">
                  Select member and program first
                </Badge>
              ) : eligibilityLoading ? (
                <Badge variant="secondary" data-testid="badge-eligibility-status">
                  Checking...
                </Badge>
              ) : isEligible ? (
                <Badge className="bg-green-600 text-white" data-testid="badge-eligibility-status">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Eligible
                </Badge>
              ) : (
                <>
                  <Badge variant="destructive" data-testid="badge-eligibility-status">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not yet eligible
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      assignEligibilityMutation.mutate({
                        member_id: enrollMemberId,
                        program_id: enrollProgramId,
                      })
                    }
                    disabled={assignEligibilityMutation.isPending}
                    data-testid="button-assign-eligibility"
                  >
                    {assignEligibilityMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Assign Eligibility
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Create enrollment payment draft */}
          <div className="border-t pt-4">
            <Button
              onClick={() =>
                createEnrollmentPaymentMutation.mutate({
                  member_id: enrollMemberId,
                  program_id: enrollProgramId,
                  amount: parsedAmount,
                  reference: enrollReference || undefined,
                })
              }
              disabled={!canSubmit}
              data-testid="button-create-enrollment-payment"
            >
              {createEnrollmentPaymentMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Enrollment Payment Draft
            </Button>
            {!canSubmit && (
              <p className="text-xs text-muted-foreground mt-2">
                Requires: member, program, amount &gt; 0, and confirmed eligibility.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Draft result display */}
      {enrollDraftResult && (
        <Card data-testid="card-enrollment-draft-result">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Draft Event Created
            </CardTitle>
            <CardDescription>The following event was created in draft status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              {typeof enrollDraftResult === "object" && enrollDraftResult !== null ? (
                Object.entries(enrollDraftResult).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-4 border-b pb-1 last:border-0">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-xs break-all text-right max-w-xs">
                      {val === null ? "null" : String(val)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs break-all" data-testid="text-enrollment-draft-id">
                  {String(enrollDraftResult)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
