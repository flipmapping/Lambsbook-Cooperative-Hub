"use client";

import { useEffect, useMemo, useState } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useRouter } from "next/navigation";
import { DashboardHeroCurrentPosition } from "@/components/dashboard/DashboardHeroCurrentPosition";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { IdeaPipelineSection } from "@/components/dashboard/IdeaPipelineSection";
import { MyContributionsSection } from "@/components/dashboard/MyContributionsSection";
import { CooperativeActivitySection } from "@/components/dashboard/CooperativeActivitySection";
import { ProgramsSection } from "@/components/dashboard/ProgramsSection";
import { RelationshipTrustSection } from "@/components/dashboard/RelationshipTrustSection";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferencesPanel";
import ContributionActivity from "@/components/contributions/ContributionActivity";
import { PipelineDetailPanel } from "@/components/dashboard/PipelineDetailPanel";
import { SubmitIdeaModal } from "@/components/dashboard/SubmitIdeaModal";
import { dashboardMockData, groupPipelineByStage } from "@/components/dashboard/mockData";
import type {
  CooperativeActivityItem,
  DashboardEntryState,
  HeroFeedback,
  InteractionCapability,
  LocalFeedback,
  PipelineItem,
  PipelineViewMode,
} from "@/components/dashboard/types";

const HUB_API_BASE = process.env.NEXT_PUBLIC_HUB_API_BASE_URL ?? "";

function makeFeedback(message: string): LocalFeedback {
  return {
    id: `feedback-${Date.now()}`,
    message,
    tone: "success",
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [entryState, setEntryState] = useState<DashboardEntryState>("loading");
  const [pendingInvitationId, setPendingInvitationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<PipelineViewMode>("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>(dashboardMockData.pipelineItems);
  const [discussionJoinedIds, setDiscussionJoinedIds] = useState<string[]>([]);
  const [supportedIds, setSupportedIds] = useState<string[]>([]);
  const [adoptionConsideredIds, setAdoptionConsideredIds] = useState<string[]>([]);
  const [isSubmitIdeaOpen, setIsSubmitIdeaOpen] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<LocalFeedback | null>(null);
  const [localActivity, setLocalActivity] = useState<CooperativeActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("sb-access-token") ?? ""
        : "";

    if (!token) {
      setEntryState("unauthenticated");
      return;
    }

    fetch(`${HUB_API_BASE}/api/member/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 200) {
          if (!cancelled) {
            setErrorMessage(null);
            setEntryState("member");
          }
          return null;
        }

        if (res.status === 401 || res.status === 403) {
          if (!cancelled) {
            setErrorMessage(null);
            setEntryState("unauthenticated");
          }
          return null;
        }

        if (res.status === 404) {
          return fetch(`${HUB_API_BASE}/api/member/pending-invitation`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(async (r) => ({
            status: r.status,
            body: await r.json().catch(() => ({})),
          }));
        }

        if (!cancelled) {
          setErrorMessage("Unable to load dashboard state.");
          setEntryState("error");
        }
        return null;
      })
      .then((result) => {
        if (!result || cancelled) return;

        if (result.status !== 200) {
          setErrorMessage("Unable to load invitation state.");
          setEntryState("error");
          return;
        }

        if (result.body?.invitation?.id) {
          setPendingInvitationId(result.body.invitation.id);
          setEntryState("invited_pending_acceptance");
        } else {
          setPendingInvitationId(null);
          setEntryState("non_member_no_invitation");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage("Unable to load dashboard state.");
          setEntryState("error");
        }
      });

      return () => {
        cancelled = true;
      };
  }, []);


  useEffect(() => {
    if (!latestFeedback) return;

    const timeout = window.setTimeout(() => {
      setLatestFeedback(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [latestFeedback]);

  const grouped = useMemo(() => groupPipelineByStage(pipelineItems), [pipelineItems]);

  const filteredItems =
    viewMode === "all"
      ? pipelineItems
      : grouped[viewMode] || [];

  const selectedItem =
    pipelineItems.find((item) => item.id === selectedItemId) ?? null;

  const isMember = entryState === "member";

  const capability: InteractionCapability = isMember
    ? {
        canSubmitIdea: true,
        canJoinDiscussion: true,
        canShowSupport: true,
        canConsiderAdoption: true,
        explanation:
          "As a cooperative member, you can take part in the available dashboard actions in this view.",
      }
    : {
        canSubmitIdea: true,
        canJoinDiscussion: false,
        canShowSupport: false,
        canConsiderAdoption: false,
        explanation:
          "You can share a local idea here. Other cooperative actions stay read-only until membership is available.",
      };

  const contributionCards = [
    {
      label: "Ideas Submitted",
      value: pipelineItems.filter((item) => item.id.startsWith("idea-local-")).length,
      helper: "Local ideas added during this dashboard session.",
    },
    {
      label: "Discussions Joined",
      value: discussionJoinedIds.length,
      helper: "Local discussion participation toggled from the detail panel.",
    },
    {
      label: "Refinements Made",
      value: dashboardMockData.contributions.refinementsMade,
      helper: "Static mock refinement count for this slice.",
    },
    {
      label: "Supports Given",
      value: supportedIds.length,
      helper: "Local support actions reflected immediately in the workflow.",
    },
  ];

  const combinedActivity = [...localActivity, ...dashboardMockData.cooperativeActivity];

  const heroFeedback: HeroFeedback | null = latestFeedback
    ? {
        title: "Local workflow updated",
        summary: latestFeedback.message,
        chipLabel: "Local feedback",
      }
    : null;

  const pushActivity = (item: CooperativeActivityItem) => {
    setLocalActivity((current) => [item, ...current].slice(0, 8));
  };

  const handleSubmitIdea = (payload: {
    title: string;
    summary: string;
    authorLabel: string;
  }) => {
    const newId = `idea-local-${Date.now()}`;

    const newItem: PipelineItem = {
      id: newId,
      title: payload.title,
      summary: payload.summary,
      stage: "idea",
      authorLabel: payload.authorLabel,
      supportCount: 0,
      discussionCount: 0,
      isMemberActionable: isMember,
    };

    setPipelineItems((current) => [newItem, ...current]);
    setViewMode("all");
    setSelectedItemId(newId);
    setIsSubmitIdeaOpen(false);

    const feedback = makeFeedback(`Idea "${payload.title}" was added to the local pipeline.`);
    setLatestFeedback(feedback);

    pushActivity({
      id: `activity-idea-${Date.now()}`,
      type: "idea",
      title: "Local idea submitted",
      summary: `A new local idea, "${payload.title}", entered the Idea stage.`,
      timestampLabel: "Just now",
    });
  };

  const handleJoinDiscussion = (itemId: string) => {
    const item = pipelineItems.find((entry) => entry.id === itemId);
    if (!item || !capability.canJoinDiscussion) return;

    const hasJoined = discussionJoinedIds.includes(itemId);

    setDiscussionJoinedIds((current) =>
      hasJoined ? current.filter((id) => id !== itemId) : [...current, itemId]
    );

    setPipelineItems((current) =>
      current.map((entry) =>
        entry.id === itemId
          ? {
              ...entry,
              discussionCount: Math.max(
                0,
                entry.discussionCount + (hasJoined ? -1 : 1)
              ),
            }
          : entry
      )
    );

    const feedback = makeFeedback(
      hasJoined
        ? `Discussion participation removed from "${item.title}".`
        : `You joined discussion for "${item.title}".`
    );
    setLatestFeedback(feedback);

    pushActivity({
      id: `activity-discussion-${Date.now()}`,
      type: "discussion",
      title: hasJoined ? "Discussion participation removed" : "Discussion joined",
      summary: hasJoined
        ? `Local discussion participation was removed from "${item.title}".`
        : `Local discussion participation was added to "${item.title}".`,
      timestampLabel: "Just now",
    });
  };

  const handleToggleSupport = (itemId: string) => {
    const item = pipelineItems.find((entry) => entry.id === itemId);
    if (!item || !capability.canShowSupport) return;

    const hasSupported = supportedIds.includes(itemId);

    setSupportedIds((current) =>
      hasSupported ? current.filter((id) => id !== itemId) : [...current, itemId]
    );

    setPipelineItems((current) =>
      current.map((entry) =>
        entry.id === itemId
          ? {
              ...entry,
              supportCount: Math.max(0, entry.supportCount + (hasSupported ? -1 : 1)),
            }
          : entry
      )
    );

    const feedback = makeFeedback(
      hasSupported
        ? `Support was removed from "${item.title}".`
        : `Support was added to "${item.title}".`
    );
    setLatestFeedback(feedback);

    pushActivity({
      id: `activity-support-${Date.now()}`,
      type: "support",
      title: hasSupported ? "Support removed" : "Support added",
      summary: hasSupported
        ? `Local support was removed from "${item.title}".`
        : `Local support was added to "${item.title}".`,
      timestampLabel: "Just now",
    });
  };

  const handleToggleAdoption = (itemId: string) => {
    const item = pipelineItems.find((entry) => entry.id === itemId);
    if (!item || !capability.canConsiderAdoption) return;

    const hasConsidered = adoptionConsideredIds.includes(itemId);

    setAdoptionConsideredIds((current) =>
      hasConsidered ? current.filter((id) => id !== itemId) : [...current, itemId]
    );

    const feedback = makeFeedback(
      hasConsidered
        ? `Adoption consideration was removed from "${item.title}".`
        : `Adoption consideration was added to "${item.title}".`
    );
    setLatestFeedback(feedback);

    pushActivity({
      id: `activity-adoption-${Date.now()}`,
      type: "adoption",
      title: hasConsidered ? "Adoption consideration removed" : "Adoption considered",
      summary: hasConsidered
        ? `Local adoption consideration was removed from "${item.title}".`
        : `Local adoption consideration was added to "${item.title}".`,
      timestampLabel: "Just now",
    });
  };

  if (entryState === "loading") {
    return <p className="text-sm text-slate-400">Preparing your dashboard…</p>;
  }

  if (entryState === "unauthenticated") {
    return <p className="text-sm text-slate-400">Taking you to sign-in…</p>;
  }

  if (entryState === "invited_pending_acceptance") {
    return <p className="text-sm text-slate-400">Taking you to your invitation…</p>;
  }

  if (entryState === "error") {
    return <p className="text-sm text-red-400">{errorMessage ?? "We could not prepare your dashboard right now."}</p>;
  }

  if (entryState !== "member" && entryState !== "non_member_no_invitation") {
    return <p className="text-sm text-red-400">Dashboard state is not renderable.</p>;
  }

  return (
    <div className="space-y-8 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex items-center justify-end" data-notification-bell-mount>
        <NotificationBell />
      </div>

      <DashboardTopBar onOpenSubmitIdea={() => setIsSubmitIdeaOpen(true)} />

      {latestFeedback ? (
        <div className="rounded-xl border border-emerald-700/70 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-200">
          {latestFeedback.message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {["all", "idea", "discussion", "candidate", "refinement", "support", "adoption", "formalized"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode as PipelineViewMode)}
            className={`rounded border px-2 py-1 ${
              viewMode === mode
                ? "border-indigo-500 text-indigo-300"
                : "border-slate-700 text-slate-400"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap text-sm text-slate-400">
        <a href="#pipeline">Idea Pipeline</a>
        <a href="#contributions">My Contributions</a>
        <a href="#activity">Cooperative Activity</a>
        <a href="#programs">Programs</a>
      </div>

      <DashboardHeroCurrentPosition
        title={dashboardMockData.heroTitle}
        description={dashboardMockData.heroDescription}
        stateLabel={isMember ? "member" : "non_member_no_invitation"}
        feedback={heroFeedback}
      />

      <div className="mt-6">
        <ActivityFeed />
        <div className="mt-4">
          <NotificationPreferencesPanel />
        </div>
      </div>

      <ContributionActivity />

      <div id="pipeline">
        <IdeaPipelineSection
          items={filteredItems}
          onItemSelect={(item) => setSelectedItemId(item.id)}
          capability={capability}
          selectedItemId={selectedItemId}
        />
      </div>

      {isMember ? (
        <div id="contributions">
          <MyContributionsSection cards={contributionCards} />
        </div>
      ) : (
        <div id="contributions" className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            My Contributions
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Contribution visibility
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            You can explore the dashboard and share a local idea here. Other cooperative actions will become available once you are a member.
          </p>
        </div>
      )}

      <div id="activity">
        <CooperativeActivitySection items={combinedActivity} />
      </div>

      {isMember ? (
        <div id="programs">
          <ProgramsSection programs={dashboardMockData.programs} />
        </div>
      ) : (
        <div id="programs" className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Programs
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Program visibility
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Programs stay visible here so you can understand what is available. Full program actions become available in member view.
          </p>
        </div>
      )}

      <RelationshipTrustSection relationshipContext={dashboardMockData.relationshipContext} />

      <PipelineDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItemId(null)}
        onJoinDiscussion={handleJoinDiscussion}
        onToggleSupport={handleToggleSupport}
        onToggleAdoption={handleToggleAdoption}
        hasJoinedDiscussion={selectedItem ? discussionJoinedIds.includes(selectedItem.id) : false}
        hasSupported={selectedItem ? supportedIds.includes(selectedItem.id) : false}
        hasConsideredAdoption={
          selectedItem ? adoptionConsideredIds.includes(selectedItem.id) : false
        }
        capability={capability}
        latestFeedback={latestFeedback}
      />

      <SubmitIdeaModal
        open={isSubmitIdeaOpen}
        onClose={() => setIsSubmitIdeaOpen(false)}
        onSubmit={handleSubmitIdea}
      />
    </div>
  );
}
