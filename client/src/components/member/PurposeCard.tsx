/**
 * PurposeCard
 * Authority: APP-MEX-002A
 *
 * Presents the PurposeProjection to the member.
 * Answers: "Why am I here?"
 *
 * - Accepts a PurposeProjection (pre-computed by useMemberPurpose).
 * - Owns no data fetching. No API calls. No routing.
 * - Composable into any surface: MemberHub, Organization Studio, AI Assistant.
 */

import type { PurposeProjection } from "@/lib/member-purpose/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PurposeCardProps {
  projection:   PurposeProjection;
  className?:   string;
}

export function PurposeCard({ projection, className = "" }: PurposeCardProps) {
  return (
    <Card
      className={className}
      data-testid="card-purpose"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug" data-testid="purpose-headline">
            {projection.headline}
          </CardTitle>
          <Badge
            variant="outline"
            className="shrink-0 text-[11px] whitespace-nowrap"
            data-testid="purpose-chapter"
          >
            {projection.chapter}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Purpose statement */}
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          data-testid="purpose-statement"
        >
          {projection.statement}
        </p>

        {/* Value proposition callout */}
        <div
          className="rounded-lg bg-muted/40 border px-4 py-3"
          data-testid="purpose-value-proposition"
        >
          <p className="text-xs font-medium text-foreground leading-relaxed">
            {projection.valueProposition}
          </p>
        </div>

        {/* Tenure + membership status row */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge
            variant={projection.isPaidMember ? "default" : "secondary"}
            className="text-[11px]"
            data-testid="purpose-badge-membership"
          >
            {projection.isPaidMember ? "Paid Member" : "Free Member"}
          </Badge>

          <Badge
            variant={projection.isActive ? "outline" : "secondary"}
            className="text-[11px]"
            data-testid="purpose-badge-activity"
          >
            {projection.isActive ? "Active" : "Inactive"}
          </Badge>

          {projection.tenureMonths > 0 && (
            <Badge
              variant="outline"
              className="text-[11px]"
              data-testid="purpose-badge-tenure"
            >
              {projection.tenureMonths === 1
                ? "1 month in"
                : `${projection.tenureMonths} months in`}
            </Badge>
          )}

          {projection.isOnboarding && (
            <Badge
              variant="outline"
              className="text-[11px] border-amber-300 text-amber-700 bg-amber-50"
              data-testid="purpose-badge-onboarding"
            >
              Onboarding
            </Badge>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
