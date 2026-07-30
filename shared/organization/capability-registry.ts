export interface CapabilityDefinition {
  id: string;
  displayName: string;
  authority: string;
  runtimeSurface: string;
  workspace: string;
  implemented: boolean;
  description: string;
}

export const CapabilityRegistry: CapabilityDefinition[] = [
  {
    id: "prospects",
    displayName: "Prospect Recruitment",
    authority: "Growth Engine",
    runtimeSurface: "/api/prospects",
    workspace: "growth",
    implemented: true,
    description: "Recruit, register, and manage prospects.",
  },
  {
    id: "journeys",
    displayName: "Journey Management",
    authority: "Growth Engine",
    runtimeSurface: "/api/journeys",
    workspace: "growth",
    implemented: true,
    description: "Manage prospect lifecycle journeys.",
  },
  {
    id: "members",
    displayName: "Membership",
    authority: "Membership",
    runtimeSurface: "/api/member",
    workspace: "membership",
    implemented: true,
    description: "Invite and manage organization members.",
  },
  {
    id: "notifications",
    displayName: "Communications",
    authority: "Notifications",
    runtimeSurface: "/api/notifications",
    workspace: "communications",
    implemented: true,
    description: "Deliver messages through configured channels.",
  },
];
