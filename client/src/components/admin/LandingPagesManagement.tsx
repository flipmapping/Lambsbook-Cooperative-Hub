import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, ExternalLink, Eye, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Program = {
  program_id: string;
  name: string;
  description: string | null;
  program_type: string | null;
  base_price: number | null;
  price_currency: string | null;
  is_active: boolean;
  sbu_id: string | null;
};

type SBU = {
  id: string;
  sbu_number: number;
  sbu_code: string;
  name: string;
};

export function LandingPagesManagement() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ['/api/hub/programs'],
  });

  const { data: sbus = [] } = useQuery<SBU[]>({
    queryKey: ['/api/hub/sbus'],
  });

  const getSBU = (sbuId: string | null) => {
    if (!sbuId) return null;
    return sbus.find(s => s.id === sbuId);
  };

  const getLandingPageUrl = (programId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/program/${programId}`;
  };

  const copyToClipboard = (programId: string) => {
    const url = getLandingPageUrl(programId);
    navigator.clipboard.writeText(url);
    setCopiedId(programId);
    toast({ title: 'URL copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activePrograms = programs.filter(p => p.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Landing Pages</h2>
          <p className="text-muted-foreground">Auto-generated landing pages for each program</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Landing Pages</CardTitle>
          <CardDescription>
            Each program automatically gets a landing page. Share these URLs with your collaborators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activePrograms.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No active programs yet. Add programs to generate landing pages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePrograms.map((program) => {
                const sbu = getSBU(program.sbu_id);
                const url = getLandingPageUrl(program.program_id);
                
                return (
                  <div 
                    key={program.program_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`landing-page-${program.program_id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{program.name}</h3>
                        {sbu && (
                          <Badge variant="outline">SBU {sbu.sbu_number}</Badge>
                        )}
                        {program.program_type && (
                          <Badge variant="secondary">{program.program_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        /program/{program.program_id}
                      </p>
                      {program.base_price && (
                        <p className="text-sm mt-1">
                          {program.price_currency} {program.base_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(program.program_id)}
                        data-testid={`button-copy-${program.program_id}`}
                      >
                        {copiedId === program.program_id ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`/program/${program.program_id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Landing Page Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Multilingual Support</h4>
              <p className="text-sm text-muted-foreground">
                Landing pages support 7 languages: English, Vietnamese, Chinese, Japanese, Spanish, French, Portuguese
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Referral Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Add ?ref=COLLABORATOR_CODE to track referrals and attribute commissions
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Contact Form</h4>
              <p className="text-sm text-muted-foreground">
                Each landing page includes a contact form that creates enquiries in the dashboard
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">AI Chat Widget</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered chat widget helps visitors with questions about the program
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
