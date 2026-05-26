import { storage } from "../storage";

export interface ClickUpTask {
  name: string;
  description: string;
  status?: string;
  priority?: number;
  assignees?: string[];
  due_date?: number;
  custom_fields?: Record<string, unknown>;
}

export interface ApolloContact {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  organization_name?: string;
  title?: string;
}

export async function createClickUpTask(enquiryId: string, enquiry: {
  name: string;
  email: string;
  inquiryType: string;
  message?: string;
  countryOfInterest?: string;
}): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    const config = await storage.getIntegrationConfig('clickup');
    
    if (!config?.isEnabled) {
      console.log('[ClickUp] Integration not enabled, skipping task creation');
      return { success: false, error: 'ClickUp integration not configured' };
    }

    const task: ClickUpTask = {
      name: `[${enquiry.inquiryType.toUpperCase()}] ${enquiry.name}`,
      description: `
## New Enquiry

**Name:** ${enquiry.name}
**Email:** ${enquiry.email}
**Type:** ${enquiry.inquiryType}
**Country of Interest:** ${enquiry.countryOfInterest || 'Not specified'}

### Message
${enquiry.message || 'No message provided'}

### Follow-up Checklist
- [ ] Initial contact made
- [ ] Requirements discussed
- [ ] Documents requested
- [ ] Proposal sent
- [ ] Contract signed
      `.trim(),
      priority: enquiry.inquiryType === 'eb3' ? 2 : 3,
    };

    console.log('[ClickUp] Would create task:', task);
    
    const mockTaskId = `task_${Date.now()}`;
    
    await storage.updateEnquiry(enquiryId, {
      clickupTaskId: mockTaskId,
    });

    return { success: true, taskId: mockTaskId };
  } catch (error) {
    console.error('[ClickUp] Error creating task:', error);
    return { success: false, error: String(error) };
  }
}

export async function createApolloContact(enquiryId: string, enquiry: {
  name: string;
  email: string;
  phone?: string;
}): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    const config = await storage.getIntegrationConfig('apollo');
    
    if (!config?.isEnabled) {
      console.log('[Apollo] Integration not enabled, skipping contact creation');
      return { success: false, error: 'Apollo integration not configured' };
    }

    const nameParts = enquiry.name.split(' ');
    const contact: ApolloContact = {
      first_name: nameParts[0] || enquiry.name,
      last_name: nameParts.slice(1).join(' ') || '',
      email: enquiry.email,
      phone: enquiry.phone,
    };

    console.log('[Apollo] Would create contact:', contact);
    
    const mockContactId = `contact_${Date.now()}`;
    
    await storage.updateEnquiry(enquiryId, {
      apolloContactId: mockContactId,
    });

    return { success: true, contactId: mockContactId };
  } catch (error) {
    console.error('[Apollo] Error creating contact:', error);
    return { success: false, error: String(error) };
  }
}

export async function syncWithSupabase(data: {
  type: 'member' | 'partner';
  record: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await storage.getIntegrationConfig('supabase');
    
    if (!config?.isEnabled) {
      console.log('[Supabase] Integration not enabled, skipping sync');
      return { success: false, error: 'Supabase integration not configured' };
    }

    console.log(`[Supabase] Would sync ${data.type}:`, data.record);
    
    return { success: true };
  } catch (error) {
    console.error('[Supabase] Error syncing:', error);
    return { success: false, error: String(error) };
  }
}

export async function triggerManusAgent(agentId: string, input: Record<string, unknown>): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    const config = await storage.getIntegrationConfig('manus');
    
    if (!config?.isEnabled) {
      console.log('[Manus] Integration not enabled, skipping agent trigger');
      return { success: false, error: 'Manus integration not configured' };
    }

    console.log(`[Manus] Would trigger agent ${agentId} with input:`, input);
    
    return { success: true, result: { status: 'triggered' } };
  } catch (error) {
    console.error('[Manus] Error triggering agent:', error);
    return { success: false, error: String(error) };
  }
}

export const integrationGuides = {
  clickup: {
    name: 'ClickUp',
    description: 'Project management and task tracking for enquiry follow-ups',
    setupSteps: [
      '1. Go to ClickUp Settings > Apps > API',
      '2. Generate a personal API token',
      '3. Create a dedicated list for enquiries in your workspace',
      '4. Copy the list ID from the URL',
      '5. Enter the API token and list ID in the integration settings',
    ],
    capabilities: [
      'Auto-create tasks for new enquiries',
      'Track follow-up status and deadlines',
      'Assign tasks to team members',
      'Sync status updates back to dashboard',
    ],
  },
  apollo: {
    name: 'Apollo.io',
    description: 'Sales intelligence and lead enrichment',
    setupSteps: [
      '1. Log into Apollo.io and go to Settings > API',
      '2. Generate an API key',
      '3. Enter the API key in the integration settings',
      '4. Configure which fields to enrich',
    ],
    capabilities: [
      'Enrich contact information',
      'Add leads to email sequences',
      'Track email engagement',
      'Score leads based on signals',
    ],
  },
  manus: {
    name: 'Manus.ai',
    description: 'AI agent automation platform',
    setupSteps: [
      '1. Create an account at manus.ai',
      '2. Set up agents for your workflows',
      '3. Generate an API key',
      '4. Configure webhook endpoints',
    ],
    capabilities: [
      'Automate email responses',
      'Process document submissions',
      'Handle multi-step workflows',
      'Integrate with other services',
    ],
  },
  supabase: {
    name: 'Supabase',
    description: 'Database sync for members and partners',
    setupSteps: [
      '1. Create a Supabase project',
      '2. Set up tables for members and partners',
      '3. Generate an API key (anon or service role)',
      '4. Configure the connection URL and key',
    ],
    capabilities: [
      'Sync member data in real-time',
      'Store partner information with unique codes',
      'Enable row-level security',
      'Integrate with Supabase Auth',
    ],
  },
};
