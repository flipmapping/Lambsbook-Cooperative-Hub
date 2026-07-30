export interface OrganizationManifest {
  organization: {
    name: string;
    type: string;
    mission?: string;
  };

  capabilities: string[];
  channels: string[];
  workspaces: string[];
}
