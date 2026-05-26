import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Plus, Edit2, Save, X, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

type Program = {
  program_id: string;
  parent_program_id: string | null;
  sbu_id: string | null;
  program_type: string | null;
  name: string;
  description: string | null;
  base_price: number | null;
  price_currency: string | null;
  duration_value: number | null;
  duration_unit: string | null;
  remainder_recipient: string;
  is_active: boolean;
};

type SBU = {
  id: string;
  sbu_number: number;
  sbu_code: string;
  name: string;
};

const programTypeLabels: Record<string, string> = {
  course: 'Course',
  workshop: 'Workshop',
  service: 'Service',
  product: 'Product',
  package: 'Package',
  consultation: 'Consultation',
  tutoring: 'Tutoring',
};

export function ProgramsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [form, setForm] = useState<Partial<Program>>({
    remainder_recipient: 'platform',
    is_active: true,
    price_currency: 'USD',
  });

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ['/api/hub/programs'],
  });

  const { data: sbus = [] } = useQuery<SBU[]>({
    queryKey: ['/api/hub/sbus'],
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: Partial<Program>) => {
      return apiRequest('POST', '/api/hub/programs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/programs'] });
      toast({ title: 'Program created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to create program', variant: 'destructive' });
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Program> }) => {
      return apiRequest('PATCH', `/api/hub/programs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/programs'] });
      toast({ title: 'Program updated successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to update program', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setForm({
      remainder_recipient: 'platform',
      is_active: true,
      price_currency: 'USD',
    });
    setEditingProgram(null);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setForm(program);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.program_id || !form.name) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    if (editingProgram) {
      updateProgramMutation.mutate({ id: editingProgram.program_id, data: form });
    } else {
      createProgramMutation.mutate(form);
    }
  };

  const parentPrograms = programs.filter(p => !p.parent_program_id);
  const getSubPrograms = (parentId: string) => programs.filter(p => p.parent_program_id === parentId);
  const getSBUName = (sbuId: string | null) => {
    if (!sbuId) return 'Unassigned';
    const sbu = sbus.find(s => s.id === sbuId);
    return sbu ? `SBU ${sbu.sbu_number}: ${sbu.sbu_code}` : 'Unknown';
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
          <h2 className="text-2xl font-bold">Programs & Products</h2>
          <p className="text-muted-foreground">Manage courses, services, and products</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-program">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>Programs with their hierarchy and commission settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SBU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Remainder To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No programs yet. Add your first program.</p>
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((program) => (
                  <TableRow key={program.program_id} data-testid={`row-program-${program.program_id}`}>
                    <TableCell className="font-mono text-sm">
                      {program.parent_program_id && (
                        <ChevronRight className="h-3 w-3 inline mr-1 text-muted-foreground" />
                      )}
                      {program.program_id}
                    </TableCell>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {programTypeLabels[program.program_type || ''] || program.program_type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{getSBUName(program.sbu_id)}</TableCell>
                    <TableCell>
                      {program.base_price ? (
                        `${program.price_currency} ${program.base_price.toLocaleString()}`
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={program.remainder_recipient === 'tutor' ? 'default' : 'secondary'}>
                        {program.remainder_recipient}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={program.is_active ? 'default' : 'outline'}>
                        {program.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(program)}
                          data-testid={`button-edit-program-${program.program_id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                        >
                          <a href={`/program/${program.program_id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Add New Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program ID *</Label>
                <Input
                  placeholder="e.g., TROPICANA-6MO"
                  value={form.program_id || ''}
                  onChange={(e) => setForm({ ...form, program_id: e.target.value.toUpperCase() })}
                  disabled={!!editingProgram}
                  data-testid="input-program-id"
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Program name"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="input-program-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.program_type || ''}
                  onValueChange={(value) => setForm({ ...form, program_type: value })}
                >
                  <SelectTrigger data-testid="select-program-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SBU</Label>
                <Select
                  value={form.sbu_id || ''}
                  onValueChange={(value) => setForm({ ...form, sbu_id: value })}
                >
                  <SelectTrigger data-testid="select-program-sbu">
                    <SelectValue placeholder="Select SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    {sbus.map((sbu) => (
                      <SelectItem key={sbu.id} value={sbu.id}>
                        SBU {sbu.sbu_number}: {sbu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent Program</Label>
                <Select
                  value={form.parent_program_id || ''}
                  onValueChange={(value) => setForm({ ...form, parent_program_id: value || null })}
                >
                  <SelectTrigger data-testid="select-program-parent">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (top-level)</SelectItem>
                    {parentPrograms.filter(p => p.program_id !== form.program_id).map((p) => (
                      <SelectItem key={p.program_id} value={p.program_id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Program description"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                data-testid="input-program-description"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.base_price || ''}
                  onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || null })}
                  data-testid="input-program-price"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.price_currency || 'USD'}
                  onValueChange={(value) => setForm({ ...form, price_currency: value })}
                >
                  <SelectTrigger data-testid="select-program-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="MYR">MYR</SelectItem>
                    <SelectItem value="TWD">TWD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  type="number"
                  placeholder="e.g., 6"
                  value={form.duration_value || ''}
                  onChange={(e) => setForm({ ...form, duration_value: parseInt(e.target.value) || null })}
                  data-testid="input-program-duration"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={form.duration_unit || ''}
                  onValueChange={(value) => setForm({ ...form, duration_unit: value })}
                >
                  <SelectTrigger data-testid="select-program-duration-unit">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Remainder Recipient</Label>
                <Select
                  value={form.remainder_recipient || 'platform'}
                  onValueChange={(value) => setForm({ ...form, remainder_recipient: value })}
                >
                  <SelectTrigger data-testid="select-program-remainder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Platform (Net Revenue)</SelectItem>
                    <SelectItem value="tutor">Tutor (for tutoring programs)</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Who receives the remainder after commissions are deducted
                </p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setForm({ ...form, is_active: value === 'active' })}
                >
                  <SelectTrigger data-testid="select-program-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createProgramMutation.isPending || updateProgramMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingProgram ? 'Save Changes' : 'Create Program'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
