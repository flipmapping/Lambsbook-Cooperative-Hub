import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [closingPeriod, setClosingPeriod] = useState(false);
  const [togglingOverride, setTogglingOverride] = useState(false);

  const { data, isLoading, error } = useQuery<GovernanceData>({
    queryKey: ['/api/member/admin/governance-status'],
  });

  const handleClosePeriod = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to close the current financial period? This action is irreversible.'
    );
    if (!confirmed) return;

    setClosingPeriod(true);
    try {
      const res = await apiRequest('POST', '/api/member/admin/close-period');
      const result = await res.json();
      await queryClient.invalidateQueries({ queryKey: ['/api/member/admin/governance-status'] });
      toast({
        title: 'Period Closed',
        description: result.message || 'Financial period closed successfully.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close period';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setClosingPeriod(false);
    }
  };

  const overrideEnabled = data?.system_config?.financial_override_enabled ?? false;

  const handleToggleOverride = async () => {
    const action = overrideEnabled ? 'disable' : 'enable';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} the financial override? This changes capital enforcement protections.`
    );
    if (!confirmed) return;

    setTogglingOverride(true);
    try {
      const res = await apiRequest('POST', '/api/member/admin/toggle-override', {
        enabled: !overrideEnabled,
      });
      const result = await res.json();
      await queryClient.invalidateQueries({ queryKey: ['/api/member/admin/governance-status'] });
      toast({
        title: 'Override Updated',
        description: result.message || `Financial override ${!overrideEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle override';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setTogglingOverride(false);
    }
  };

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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Close Financial Period</CardTitle>
            <CardDescription className="text-sm">
              Finalize the current accounting period. All pending transactions will be settled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4" data-testid="text-close-warning">
              This action is irreversible.
            </p>
            <Button
              variant="destructive"
              onClick={handleClosePeriod}
              disabled={closingPeriod}
              data-testid="button-close-period"
            >
              {closingPeriod && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Close Financial Period
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Financial Override Control</CardTitle>
            <CardDescription className="text-sm">
              Toggle capital enforcement protections for the current SBU.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overrideEnabled && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3" data-testid="banner-override-active">
                <p className="text-sm font-medium text-destructive">
                  Financial override is ACTIVE. Capital enforcement protections are relaxed.
                </p>
              </div>
            )}
            <Button
              variant={overrideEnabled ? 'destructive' : 'outline'}
              onClick={handleToggleOverride}
              disabled={togglingOverride}
              data-testid="button-toggle-override"
            >
              {togglingOverride && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {overrideEnabled ? 'Disable Financial Override' : 'Enable Financial Override'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
