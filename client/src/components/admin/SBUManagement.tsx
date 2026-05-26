import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Building2, Edit2, Save, X, Users, DollarSign } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

type SBU = {
  id: string;
  sbu_number: number;
  sbu_code: string;
  name: string;
  description: string | null;
  lead_name: string | null;
  lead_email: string | null;
  entity_name: string | null;
  status: string;
  financial_status: string | null;
  notes: string | null;
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  planning: 'bg-yellow-500',
  inactive: 'bg-gray-500',
  future: 'bg-blue-500',
};

export function SBUManagement() {
  const { toast } = useToast();
  const [selectedSBU, setSelectedSBU] = useState<SBU | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SBU>>({});

  const { data: sbus = [], isLoading } = useQuery<SBU[]>({
    queryKey: ['/api/hub/sbus'],
  });

  const updateSBUMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SBU> }) => {
      return apiRequest('PATCH', `/api/hub/sbus/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hub/sbus'] });
      toast({ title: 'SBU updated successfully' });
      setIsEditing(false);
      setSelectedSBU(null);
    },
    onError: () => {
      toast({ title: 'Failed to update SBU', variant: 'destructive' });
    },
  });

  const handleEdit = (sbu: SBU) => {
    setSelectedSBU(sbu);
    setEditForm(sbu);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedSBU && editForm) {
      updateSBUMutation.mutate({ id: selectedSBU.id, data: editForm });
    }
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
          <h2 className="text-2xl font-bold">Strategic Business Units</h2>
          <p className="text-muted-foreground">Manage the 5 SBUs of Lambsbook Agentic Hub</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sbus.map((sbu) => (
          <Card key={sbu.id} className="hover-elevate" data-testid={`card-sbu-${sbu.sbu_number}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge className={statusColors[sbu.status] || 'bg-gray-500'}>
                  {sbu.status}
                </Badge>
                <span className="text-sm text-muted-foreground">SBU {sbu.sbu_number}</span>
              </div>
              <CardTitle className="text-lg mt-2">{sbu.name}</CardTitle>
              <CardDescription>{sbu.sbu_code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sbu.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{sbu.description}</p>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{sbu.lead_name || 'No lead assigned'}</span>
              </div>
              
              {sbu.entity_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{sbu.entity_name}</span>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => handleEdit(sbu)}
                data-testid={`button-edit-sbu-${sbu.sbu_number}`}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sbus.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No SBUs found</h3>
            <p className="text-muted-foreground">
              Run the master schema SQL in Supabase to create the 5 SBUs
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit SBU {selectedSBU?.sbu_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                data-testid="input-sbu-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                data-testid="input-sbu-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lead Name</Label>
                <Input
                  value={editForm.lead_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, lead_name: e.target.value })}
                  data-testid="input-sbu-lead"
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Email</Label>
                <Input
                  type="email"
                  value={editForm.lead_email || ''}
                  onChange={(e) => setEditForm({ ...editForm, lead_email: e.target.value })}
                  data-testid="input-sbu-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entity Name</Label>
                <Input
                  value={editForm.entity_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, entity_name: e.target.value })}
                  data-testid="input-sbu-entity"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status || 'planning'}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger data-testid="select-sbu-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateSBUMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
