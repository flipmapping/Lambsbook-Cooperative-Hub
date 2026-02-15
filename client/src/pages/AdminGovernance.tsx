import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getQueryFn } from '@/lib/queryClient';

interface GovernanceData {
  capital_adequacy: Record<string, any> | null;
  liquidity_status: Record<string, any> | null;
  clearing_aging: Record<string, any>[] | null;
  integrity_check: Record<string, any> | null;
  system_config: {
    minimum_capital_adequacy_threshold: number;
    financial_override_enabled: boolean;
  } | null;
}

function DataCard({ title, data }: { title: string; data: any }) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const entries = Array.isArray(data) ? data : [data];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.map((entry, idx) => (
          <div key={idx} className="mb-3 last:mb-0">
            {Object.entries(entry).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 py-1 text-sm border-b last:border-b-0">
                <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                <span className="font-mono text-right" data-testid={`value-${key}`}>
                  {value === null ? '—' : String(value)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AdminGovernance() {
  const { data, isLoading, error } = useQuery<GovernanceData>({
    queryKey: ['/api/member/admin/governance-status'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    const is403 = error.message?.includes('403');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4" data-testid="error-state">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-medium">
          {is403 ? 'Access Denied' : 'Failed to load governance data'}
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {is403
            ? 'You do not have super admin privileges to view this page.'
            : error.message}
        </p>
        <Link href="/hub/dashboard">
          <Button variant="outline" data-testid="button-back-dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/hub/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Governance Panel</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 space-y-4 max-w-4xl">
        <DataCard title="Capital Adequacy" data={data?.capital_adequacy} />
        <DataCard title="Liquidity Status" data={data?.liquidity_status} />
        <DataCard title="Clearing Aging" data={data?.clearing_aging} />
        <DataCard title="Integrity Check" data={data?.integrity_check} />
        <DataCard title="System Configuration" data={data?.system_config} />
      </div>
    </div>
  );
}
