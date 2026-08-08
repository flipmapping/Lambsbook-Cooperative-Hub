export interface CampaignContent {
  title?: string;
  subject?: string;
  message?: string;

  templateData?: Record<string, string>;
}

export interface CampaignRecipient {
  id: string;

  full_name?: string | null;

  email?: string | null;

  phone?: string | null;
}

export interface CampaignRequest {
  recipients: CampaignRecipient[];

  content: CampaignContent;
}
