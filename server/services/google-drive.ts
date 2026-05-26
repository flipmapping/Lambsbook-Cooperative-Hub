// Google Drive Integration for Lambsbook Agentic Hub
// Connects to Google Drive to manage files and documents

import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Get Google Docs client for document operations
export async function getGoogleDocsClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

// Find a folder by name
export async function findFolderByName(folderName: string): Promise<string | null> {
  const drive = await getUncachableGoogleDriveClient();
  
  const response = await drive.files.list({
    q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id || null;
  }
  return null;
}

// List all Google Docs in a folder
export async function listDocsInFolder(folderId: string): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
  const drive = await getUncachableGoogleDriveClient();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
    fields: 'files(id, name, modifiedTime)',
    orderBy: 'modifiedTime desc',
    spaces: 'drive'
  });

  return (response.data.files || []).map(file => ({
    id: file.id || '',
    name: file.name || '',
    modifiedTime: file.modifiedTime || ''
  }));
}

// Read a Google Doc content
export async function readDocContent(docId: string): Promise<{ title: string; content: string; structuredContent: any }> {
  const docs = await getGoogleDocsClient();
  
  const response = await docs.documents.get({
    documentId: docId
  });

  const document = response.data;
  let textContent = '';
  
  // Extract text from document body
  if (document.body?.content) {
    for (const element of document.body.content) {
      if (element.paragraph?.elements) {
        for (const textElement of element.paragraph.elements) {
          if (textElement.textRun?.content) {
            textContent += textElement.textRun.content;
          }
        }
      }
    }
  }

  return {
    title: document.title || '',
    content: textContent,
    structuredContent: document.body?.content || []
  };
}

// Feedback section markers for reliable detection
const FEEDBACK_SECTION_START = 'AI GENERATED FEEDBACK';
const FEEDBACK_SECTION_END_MARKERS = [
  'END OF AI FEEDBACK',
  '--- END FEEDBACK ---',
  '7️⃣',
  '8️⃣',
  '9️⃣'
];

// Write feedback to a specific section in a Google Doc
export async function writeFeedbackToDoc(
  docId: string, 
  feedbackContent: string,
  sectionHeading: string = 'AI GENERATED FEEDBACK (DRAFT – EDITABLE)'
): Promise<{ success: boolean; sectionFound: boolean; message: string }> {
  const docs = await getGoogleDocsClient();
  
  // First, read the document to find the target section
  const document = await docs.documents.get({
    documentId: docId
  });

  let sectionStartIndex = -1;
  let sectionEndIndex = -1;
  let sectionHeadingEndIndex = -1;
  
  // Find the feedback section by looking for the heading
  if (document.data.body?.content) {
    for (let i = 0; i < document.data.body.content.length; i++) {
      const element = document.data.body.content[i];
      if (element.paragraph?.elements) {
        const paragraphText = element.paragraph.elements
          .map(e => e.textRun?.content || '')
          .join('');
        
        // Check if this paragraph contains the feedback section heading
        if (paragraphText.includes(FEEDBACK_SECTION_START) || 
            paragraphText.includes(sectionHeading)) {
          sectionStartIndex = element.startIndex || -1;
          sectionHeadingEndIndex = element.endIndex || -1;
          
          // Find the end of the feedback section
          for (let j = i + 1; j < document.data.body.content.length; j++) {
            const nextElement = document.data.body.content[j];
            if (nextElement.paragraph?.elements) {
              const nextParagraphText = nextElement.paragraph.elements
                .map(e => e.textRun?.content || '')
                .join('');
              
              // Check for explicit end markers or next numbered section
              const isEndMarker = FEEDBACK_SECTION_END_MARKERS.some(
                marker => nextParagraphText.includes(marker)
              );
              
              // Also check for next major section (numbered headings like "7️⃣ NEXT STEPS")
              const isNextSection = /^[7-9]️⃣|^[7-9]\.|^[7-9]\)/.test(nextParagraphText.trim());
              
              if (isEndMarker || isNextSection) {
                sectionEndIndex = nextElement.startIndex || -1;
                break;
              }
            }
          }
          break;
        }
      }
    }
  }

  // If section not found, return error instead of appending to wrong location
  if (sectionStartIndex === -1) {
    return {
      success: false,
      sectionFound: false,
      message: `Feedback section "${sectionHeading}" not found in document. Please ensure the document is a valid Master Template with the feedback section.`
    };
  }

  // If no end marker found, use a safe default: insert after the heading only
  const insertIndex = sectionHeadingEndIndex;
  
  // Prepare the insert request
  const requests = [];
  
  // If there's existing content in the section, delete it first
  if (sectionEndIndex > sectionHeadingEndIndex) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: sectionHeadingEndIndex,
          endIndex: sectionEndIndex - 1
        }
      }
    });
  }

  // Insert the new feedback content with clear formatting
  const formattedFeedback = '\n\n' + feedbackContent + '\n\n--- END FEEDBACK ---\n';
  
  requests.push({
    insertText: {
      location: {
        index: insertIndex
      },
      text: formattedFeedback
    }
  });

  // Execute the batch update
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests
    }
  });

  return {
    success: true,
    sectionFound: true,
    message: 'Feedback written successfully'
  };
}

// Parse document to extract metadata fields
export function parseDocumentMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  
  const fieldPatterns = [
    'DOCUMENT TYPE',
    'Assessment Framework',
    'Skill Focus',
    'Target Level',
    'Target Band',
    'Learning Context',
    'Focus Areas'
  ];

  for (const field of fieldPatterns) {
    const regex = new RegExp(`${field}:\\s*(.+?)(?=\\n|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      metadata[field] = match[1].trim();
    }
  }

  return metadata;
}

// Extract student submission sections
export function extractSubmissionSections(content: string): { speaking?: string; writing?: string } {
  const sections: { speaking?: string; writing?: string } = {};
  
  // Look for Speaking Task section
  const speakingMatch = content.match(/Speaking Task[\s\S]*?(?=Writing Task|AI GENERATED|$)/i);
  if (speakingMatch && speakingMatch[0].trim().length > 50) {
    sections.speaking = speakingMatch[0].trim();
  }
  
  // Look for Writing Task section
  const writingMatch = content.match(/Writing Task[\s\S]*?(?=AI GENERATED|$)/i);
  if (writingMatch && writingMatch[0].trim().length > 50) {
    sections.writing = writingMatch[0].trim();
  }

  return sections;
}
