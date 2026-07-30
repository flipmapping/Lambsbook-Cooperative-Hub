import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Percent, Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

type CommissionRuleSet = {
  id: string;
  set_name: string;
  program_id: string | null;
  apply_to_subprograms: boolean;
  remainder_recipient: string;
  is_active: boolean;
  rules?: CommissionRule[];
};

type CommissionRule = {
  id: string;
  rule_set_id: string;
  rule_name: string;
  recipient_role: string;
  commission_type: string;
  commission_value: number;
  priority: number;
  is_active: boolean;
};

type Program = {
  program_id: string;
  name: string;
};

const roleLabels: Record<string, string> = {
  collaborator_tier1: 'Collaborator Tier 1 (15%)',
  collaborator_tier2: 'Collaborator Tier 2 (15%)',
  partner: 'Partner (10%)',
  charity: 'Charity Reserve (10%)',
  tutor: 'Tutor',
  platform: 'Platform',
};

const roleColors: Record<string, string> = {
  collaborator_tier1: 'bg-blue-500',
  collaborator_tier2: 'bg-indigo-500',
  partner: 'bg-purple-500',
  charity: 'bg-pink-500',
  tutor: 'bg-green-500',
  platform: 'bg-gray-500',
};

export function CommissionRulesManagement() {
  const { toast } = useToast();
  const [isRuleSetDialogOpen, setIsRuleSetDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedRuleSet, setSelectedRuleSet] = useState<CommissionRuleSet | null>(null);
  const [ruleSetForm, setRuleSetForm] = useState<Partial<CommissionRuleSet>>({
    remainder_recipient: 'platform',
    apply_to_subprograms: true,
    is_active: true,
  });
  const [ruleForm, setRuleForm] = useState<Partial<CommissionRule>>({
    commission_type: 'percentage',
    priority: 100,
    is_active: true,
  });

  const { data: ruleSets = [], isLoading } = useQuery<CommissionRuleSet[]>({
    queryKey: ['/api/hub/commission-rule-sets'],
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ['/api/hub/programs'],
  });

  const createRuleSetMutation = useMutation({
    mutationFn: async (data: Partial<CommissionRuleSet>) => {
      return apiRequest('POST', '/api/hub/commission-rule-sets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/commission-rule-sets'] });
      toast({ title: 'Rule set created successfully' });
      setIsRuleSetDialogOpen(false);
      setRuleSetForm({ remainder_recipient: 'platform', apply_to_subprograms: true, is_active: true });
    },
    onError: () => {
      toast({ title: 'Failed to create rule set', variant: 'destructive' });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: Partial<CommissionRule>) => {
      return apiRequest('POST', '/api/hub/commission-rules', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/commission-rule-sets'] });
      toast({ title: 'Rule added successfully' });
      setIsRuleDialogOpen(false);
      setRuleForm({ commission_type: 'percentage', priority: 100, is_active: true });
    },
    onError: () => {
      toast({ title: 'Failed to add rule', variant: 'destructive' });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/hub/commission-rules/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/commission-rule-sets'] });
      toast({ title: 'Rule deleted' });
    },
  });

  const getProgramName = (programId: string | null) => {
    if (!programId) return 'Global (all programs)';
    const program = programs.find(p => p.program_id === programId);
    return program ? program.name : programId;
  };

  const handleAddRule = (ruleSet: CommissionRuleSet) => {
    setSelectedRuleSet(ruleSet);
    setRuleForm({ 
      rule_set_id: ruleSet.id,
      commission_type: 'percentage', 
      priority: 100, 
      is_active: true 
    });
    setIsRuleDialogOpen(true);
  };

  const handleCreateRuleSet = () => {
    if (!ruleSetForm.set_name) {
      toast({ title: 'Please enter a rule set name', variant: 'destructive' });
      return;
    }
    createRuleSetMutation.mutate(ruleSetForm);
  };

  const handleCreateRule = () => {
    if (!ruleForm.rule_name || !ruleForm.recipient_role || !ruleForm.commission_value) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    createRuleMutation.mutate(ruleForm);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Commission Rules</h2>
          <p className="text-muted-foreground">Configure commission structures for each program</p>
        </div>
        <Button onClick={() => setIsRuleSetDialogOpen(true)} data-testid="button-add-rule-set">
          <Plus className="h-4 w-4 mr-2" />
          New Rule Set
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Rule Sets</CardTitle>
          <CardDescription>Each program can have its own commission structure</CardDescription>
        </CardHeader>
        <CardContent>
          {ruleSets.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No commission rule sets yet. Create one to define how earnings are split.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {ruleSets.map((ruleSet) => (
                <AccordionItem key={ruleSet.id} value={ruleSet.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div>
                        <span className="font-medium">{ruleSet.set_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({getProgramName(ruleSet.program_id)})
                        </span>
                      </div>
                      <Badge variant={ruleSet.is_active ? 'default' : 'secondary'}>
                        {ruleSet.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        Remainder → {ruleSet.remainder_recipient}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Commission Rules</h4>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddRule(ruleSet)}
                          data-testid={`button-add-rule-${ruleSet.id}`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Rule
                        </Button>
                      </div>
                      
                      {ruleSet.rules && ruleSet.rules.length > 0 ? (
                        <div className="space-y-2">
                          {ruleSet.rules.sort((a, b) => a.priority - b.priority).map((rule) => (
                            <div 
                              key={rule.id} 
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              data-testid={`rule-${rule.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${roleColors[rule.recipient_role] || 'bg-gray-400'}`} />
                                <div>
                                  <span className="font-medium">{rule.rule_name}</span>
                                  <div className="text-sm text-muted-foreground">
                                    {roleLabels[rule.recipient_role] || rule.recipient_role}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline">
                                  {rule.commission_type === 'percentage' 
                                    ? `${rule.commission_value}%` 
                                    : `$${rule.commission_value}`}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Priority: {rule.priority}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRuleMutation.mutate(rule.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No rules defined. Add rules to specify commission percentages.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRuleSetDialogOpen} onOpenChange={setIsRuleSetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Commission Rule Set</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Set Name *</Label>
              <Input
                placeholder="e.g., Tropicana Academy Commissions"
                value={ruleSetForm.set_name || ''}
                onChange={(e) => setRuleSetForm({ ...ruleSetForm, set_name: e.target.value })}
                data-testid="input-ruleset-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Program</Label>
              <Select
                value={ruleSetForm.program_id || ''}
                onValueChange={(value) => setRuleSetForm({ ...ruleSetForm, program_id: value || null })}
              >
                <SelectTrigger data-testid="select-ruleset-program">
                  <SelectValue placeholder="Select program (or leave empty for global)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global (all programs)</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.program_id} value={p.program_id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Remainder Recipient</Label>
              <Select
                value={ruleSetForm.remainder_recipient || 'platform'}
                onValueChange={(value) => setRuleSetForm({ ...ruleSetForm, remainder_recipient: value })}
              >
                <SelectTrigger data-testid="select-ruleset-remainder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform (Net Revenue)</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsRuleSetDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRuleSet} disabled={createRuleSetMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Create Rule Set
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Commission Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                placeholder="e.g., Collaborator Tier 1"
                value={ruleForm.rule_name || ''}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_name: e.target.value })}
                data-testid="input-rule-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Recipient Role *</Label>
              <Select
                value={ruleForm.recipient_role || ''}
                onValueChange={(value) => setRuleForm({ ...ruleForm, recipient_role: value })}
              >
                <SelectTrigger data-testid="select-rule-recipient">
                  <SelectValue placeholder="Who receives this commission?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator_tier1">Collaborator Tier 1</SelectItem>
                  <SelectItem value="collaborator_tier2">Collaborator Tier 2</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="charity">Charity Reserve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={ruleForm.commission_type || 'percentage'}
                  onValueChange={(value) => setRuleForm({ ...ruleForm, commission_type: value })}
                >
                  <SelectTrigger data-testid="select-rule-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input
                  type="number"
                  placeholder={ruleForm.commission_type === 'percentage' ? '15' : '100'}
                  value={ruleForm.commission_value || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, commission_value: parseFloat(e.target.value) })}
                  data-testid="input-rule-value"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority (lower = calculated first)</Label>
              <Input
                type="number"
                value={ruleForm.priority || 100}
                onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) })}
                data-testid="input-rule-priority"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule} disabled={createRuleMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
