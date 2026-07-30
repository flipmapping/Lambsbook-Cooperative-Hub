export interface OrganizationBlueprintModel {
  name: string;
  purpose: string;
  members: number;
}

export const emptyOrganizationBlueprint: OrganizationBlueprintModel = {
  name: '',
  purpose: '',
  members: 0,
};
