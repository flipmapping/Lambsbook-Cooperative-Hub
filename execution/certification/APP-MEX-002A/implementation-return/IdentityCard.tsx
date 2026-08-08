/**
 * IdentityCard
 * Authority: APP-MEX-002A
 *
 * Presents the IdentityProjection to the member.
 * Answers: "Who am I becoming?"
 *
 * - Accepts an IdentityProjection (pre-computed by useMemberPurpose).
 * - Owns no data fetching. No API calls.
 * - Tab navigation via onNavigate callback — no direct routing dependency.
 * - Composable into any surface: MemberHub, Community Graph, AI Assistant.
 */

import type { IdentityProjection } from "@/lib/member-purpose/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, ArrowRight } from "lucide-react";

interface IdentityCardProps {
  projection:   IdentityProjection;
  /** Called when the member taps the primary action CTA */
  onNavigate?:  (destination: string) => void;
  className?:   string;
}

export function IdentityCard({
  projection,
  onNavigate,
  className = "",
}: IdentityCardProps) {
  const { primaryAction } = projection;

  function handleAction() {
    if (primaryAction.destination && onNavigate) {
      onNavigate(primaryAction.destination);
    }
  }

  return (
    <Card
      className={className}
      data-testid="card-identity"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base leading-snug" data-testid="identity-tier-label">
              {projection.tierLabel}
            </CardTitle>
            <CardDescription
              className="text-xs mt-1 leading-snug"
              data-testid="identity-tier-description"
            >
              {projection.tierDescription}
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0 text-[11px]">
            Identity
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Progress toward next tier */}
        {projection.nextTierLabel && (
          <div className="space-y-2" data-testid="identity-progress-section">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress toward {projection.nextTierLabel}</span>
              <span data-testid="identity-progress-score">
                {projection.progressScore}%
              </span>
            </div>
            <Progress
              value={projection.progressScore}
              className="h-1.5"
              data-testid="identity-progress-bar"
            />
            {projection.nextTierNarrative && (
              <p
                className="text-xs text-muted-foreground leading-relaxed"
                data-testid="identity-next-tier-narrative"
              >
                {projection.nextTierNarrative}
              </p>
            )}
          </div>
        )}

        {!projection.nextTierLabel && (
          <div
            className="rounded-lg bg-muted/30 border px-4 py-3 text-xs text-muted-foreground"
            data-testid="identity-ceiling"
          >
            You have reached the highest cooperative identity tier.
          </div>
        )}

        {/* Network stats */}
        <div
          className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3"
          data-testid="identity-network-stats"
        >
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span
              className="font-semibold text-foreground"
              data-testid="identity-network-depth"
            >
              {projection.networkDepth}
            </span>{" "}
            {projection.networkDepth === 1
              ? "member welcomed"
              : "members welcomed"}{" "}
            · {projection.hasInvitor ? "Joined via invitation" : "Founding-path member"}
          </div>
        </div>

        {/* Primary action CTA */}
        <div
          className="rounded-lg border bg-muted/10 px-4 py-4 space-y-2"
          data-testid="identity-primary-action"
        >
          <div className="text-xs font-semibold text-foreground">
            {primaryAction.label}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {primaryAction.description}
          </div>
          {primaryAction.destination && onNavigate && (
            <Button
              variant="outline"
              onClick={handleAction}
              className="mt-2 h-8 text-xs px-3 gap-1.5"
              data-testid="identity-action-button"
            >
              {primaryAction.label}
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
