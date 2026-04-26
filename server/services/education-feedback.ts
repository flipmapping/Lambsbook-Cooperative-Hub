// Education Feedback Agent Service
// Reads Google Docs from Lambsbook Master Templates and generates AI feedback

import OpenAI from "openai";
import { 
  findFolderByName, 
  listDocsInFolder, 
  readDocContent, 
  writeFeedbackToDoc,
  parseDocumentMetadata,
  extractSubmissionSections
} from './google-drive';
import { extractYoutubeTranscript } from './youtube-transcript';

// Remove timestamps from transcripts for cleaner analysis
function removeTimestamps(text: string): string {
  // Remove common timestamp formats:
  // [00:00] or [0:00] or [00:00:00]
  // (00:00) or (0:00) or (00:00:00)
  // 00:00 or 0:00 or 00:00:00 at start of lines
  // 0:00 - or 00:00 - patterns
  return text
    .replace(/\[?\(?\d{1,2}:\d{2}(?::\d{2})?\)?\]?\s*[-–—]?\s*/g, '')
    .replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*[-–—]?\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// REMOVED: unsafe top-level init
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MASTER_TEMPLATES_FOLDER = 'Lambsbook – Master Templates';

// Master prompt for the feedback agent
const FEEDBACK_AGENT_PROMPT = `You are an AI Feedback Agent for English learning.

Your task is to analyze the student submission and generate structured, professional feedback.

You must behave as a professional English teacher and examiner, not as a chatbot.

EVALUATION GUIDELINES:

For SPEAKING tasks:
- Treat transcript as raw spoken language
- Do NOT penalize fillers excessively
- Focus on: Coherence & organization, Lexical choice and range, Grammar patterns, Task relevance and idea development

For WRITING tasks:
- Evaluate structure, clarity, tone, and task fulfillment
- Focus on: Paragraphing and logic, Lexical precision, Grammar patterns, Register and audience awareness

ASSESSMENT FRAMEWORKS:

If IELTS Academic or IELTS General:
- Use official IELTS criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation (speaking), Task Achievement/Response (writing)

If Business Communication or Workplace English:
- Evaluate: Clarity and intent, Tone and professionalism, Structure and efficiency, Practical effectiveness

If Presentation Skills:
- Evaluate: Structure and signposting, Message clarity, Language control, Persuasiveness and impact

OUTPUT STRUCTURE (You MUST follow this exactly):

A. OVERALL PERFORMANCE SNAPSHOT
- Estimated level or band
- Key strengths (2-3 points)
- Key weaknesses (2-3 points)
- Top 3 priorities for improvement

B. DETAILED FEEDBACK TABLE
Create a PROPERLY FORMATTED markdown table. The table MUST:
- Have consistent column alignment
- Use proper markdown syntax with | separators
- Include the header separator row with dashes (e.g., |---|---|---|)

Format EXACTLY like this:
| Original Excerpt | Improved Version | Explanation & Upgrade Strategy |
|------------------|------------------|--------------------------------|
| "example text" | "improved text" | Explanation here |

Rules:
- Use the student's original ideas
- Improve only to the target level, not beyond
- Explain patterns and strategies, not just corrections
- Prioritize high-impact improvements
- Include 5-8 rows
- Keep each cell content concise (under 100 characters when possible)
- Use quotation marks around excerpts for clarity

C. MODEL RESPONSE (TARGET LEVEL)
- Provide a full model response at the target band/level
- Use the student's ideas with improved structure, vocabulary, and coherence
- Clearly label the level (e.g., "Band 7 Model Response")

D. ACTION PLAN (STUDENT-FRIENDLY)
- What to keep doing (2-3 items)
- What to stop doing (2-3 items)
- What to practice next (3-5 specific, repeatable actions)

QUALITY RULES:
- Preserve the student's voice
- Be encouraging but honest
- Avoid generic feedback
- Avoid rewriting everything unnecessarily
- Avoid examiner jargon for lower-level students`;

export interface DocumentInfo {
  id: string;
  name: string;
  modifiedTime: string;
}

export interface FeedbackResult {
  docId: string;
  docName: string;
  success: boolean;
  feedback?: string;
  error?: string;
  metadata?: Record<string, string>;
}

// Find the Master Templates folder
export async function findMasterTemplatesFolder(): Promise<string | null> {
  return await findFolderByName(MASTER_TEMPLATES_FOLDER);
}

// List all documents in the Master Templates folder
export async function listMasterTemplates(): Promise<DocumentInfo[]> {
  const folderId = await findMasterTemplatesFolder();
  if (!folderId) {
    throw new Error(`Folder "${MASTER_TEMPLATES_FOLDER}" not found in Google Drive`);
  }
  return await listDocsInFolder(folderId);
}

// Required metadata fields for a valid template
const REQUIRED_METADATA_FIELDS = ['Assessment Framework'];
const RECOMMENDED_METADATA_FIELDS = ['Skill Focus', 'Target Level', 'Learning Context'];

// Validate a document before processing
export function validateDocument(content: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for document type marker
  if (!content.includes('DOCUMENT TYPE: MASTER TEMPLATE') && !content.includes('DOCUMENT TYPE')) {
    errors.push('Missing "DOCUMENT TYPE: MASTER TEMPLATE" field');
  }
  
  // Check for required Assessment Framework field
  if (!content.includes('Assessment Framework:')) {
    errors.push('Missing "Assessment Framework:" field');
  }
  
  // Check for feedback section heading
  if (!content.includes('AI GENERATED FEEDBACK')) {
    errors.push('Missing feedback section heading (must contain "AI GENERATED FEEDBACK")');
  }
  
  // Validate metadata values
  const metadata = parseDocumentMetadata(content);
  
  for (const field of REQUIRED_METADATA_FIELDS) {
    if (!metadata[field] || metadata[field].trim() === '') {
      errors.push(`${field} field has no value`);
    }
  }
  
  // Add warnings for recommended fields
  for (const field of RECOMMENDED_METADATA_FIELDS) {
    if (!metadata[field] || metadata[field].trim() === '') {
      warnings.push(`Recommended field "${field}" is missing or empty`);
    }
  }
  
  // Validate Assessment Framework has a known value
  const validFrameworks = [
    'IELTS Academic',
    'IELTS General',
    'Business Communication',
    'Workplace English',
    'Presentation Skills',
    'General English'
  ];
  
  if (metadata['Assessment Framework']) {
    const framework = metadata['Assessment Framework'].trim();
    const isKnown = validFrameworks.some(
      f => framework.toLowerCase().includes(f.toLowerCase())
    );
    if (!isKnown) {
      warnings.push(`Unknown Assessment Framework: "${framework}". Known frameworks: ${validFrameworks.join(', ')}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Generate feedback for a single document
export async function generateFeedbackForDocument(docId: string): Promise<FeedbackResult> {
  try {
    // Read the document
    const docData = await readDocContent(docId);
    const content = docData.content;
    
    // Validate document structure
    const validation = validateDocument(content);
    if (!validation.valid) {
      const errorMessage = `Document validation failed:\n${validation.errors.join('\n')}\n\nPlease ensure this document is a copy of a Master Template with all required fields.`;
      
      // Write error to the feedback section
      await writeFeedbackToDoc(docId, errorMessage);
      
      return {
        docId,
        docName: docData.title,
        success: false,
        error: errorMessage
      };
    }
    
    // Extract metadata
    const metadata = parseDocumentMetadata(content);
    
    // Extract submission sections
    const submissions = extractSubmissionSections(content);
    
    if (!submissions.speaking && !submissions.writing) {
      const errorMessage = 'No student submission found in Speaking Task or Writing Task sections.';
      await writeFeedbackToDoc(docId, errorMessage);
      
      return {
        docId,
        docName: docData.title,
        success: false,
        error: errorMessage,
        metadata
      };
    }
    
    // Build the prompt for OpenAI
    const taskType = submissions.speaking ? 'SPEAKING' : 'WRITING';
    const submission = submissions.speaking || submissions.writing;
    
    const userPrompt = `
DOCUMENT METADATA:
- Assessment Framework: ${metadata['Assessment Framework'] || 'General English'}
- Skill Focus: ${metadata['Skill Focus'] || 'Not specified'}
- Target Level/Band: ${metadata['Target Level'] || metadata['Target Band'] || 'Not specified'}
- Learning Context: ${metadata['Learning Context'] || 'Not specified'}
- Focus Areas: ${metadata['Focus Areas'] || 'Not specified'}

TASK TYPE: ${taskType}

STUDENT SUBMISSION:
${submission}

Please generate comprehensive feedback following the exact output structure specified.`;

    // Call OpenAI to generate feedback
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: FEEDBACK_AGENT_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const feedback = response.choices[0]?.message?.content || 'Unable to generate feedback';
    
    // Write feedback back to the document
    const writeResult = await writeFeedbackToDoc(docId, feedback);
    
    if (!writeResult.success) {
      return {
        docId,
        docName: docData.title,
        success: false,
        error: writeResult.message,
        metadata
      };
    }
    
    return {
      docId,
      docName: docData.title,
      success: true,
      feedback,
      metadata
    };
    
  } catch (error) {
    console.error('Error generating feedback:', error);
    return {
      docId,
      docName: 'Unknown',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Process all pending documents in the folder
export async function processAllPendingDocuments(): Promise<FeedbackResult[]> {
  const documents = await listMasterTemplates();
  const results: FeedbackResult[] = [];
  
  for (const doc of documents) {
    // Check if document needs processing (could add logic to skip already processed)
    const result = await generateFeedbackForDocument(doc.id);
    results.push(result);
  }
  
  return results;
}

// Get a single document's content for preview
export async function getDocumentPreview(docId: string): Promise<{
  title: string;
  metadata: Record<string, string>;
  hasSubmission: boolean;
  submissionType?: 'speaking' | 'writing' | 'both';
  validation: { valid: boolean; errors: string[]; warnings: string[] };
}> {
  const docData = await readDocContent(docId);
  const content = docData.content;
  const metadata = parseDocumentMetadata(content);
  const submissions = extractSubmissionSections(content);
  const validation = validateDocument(content);
  
  let submissionType: 'speaking' | 'writing' | 'both' | undefined;
  if (submissions.speaking && submissions.writing) {
    submissionType = 'both';
  } else if (submissions.speaking) {
    submissionType = 'speaking';
  } else if (submissions.writing) {
    submissionType = 'writing';
  }
  
  return {
    title: docData.title,
    metadata,
    hasSubmission: !!(submissions.speaking || submissions.writing),
    submissionType,
    validation
  };
}

// ========================================
// Direct Transcript Processing (MVP UI)
// ========================================

export interface TranscriptFeedbackRequest {
  task_prompt?: string;
  transcript_text?: string;
  youtube_url?: string;
  assessment_framework: string;
  skill_type: string;
  speaking_part?: string;
  current_level?: string;
  target_level?: string;
}

export interface TranscriptFeedbackResult {
  status: 'success' | 'error';
  feedback?: string;
  google_doc_url?: string;
  error?: string;
  message?: string;
}

// Valid assessment frameworks
const VALID_FRAMEWORKS = [
  'ielts_academic',
  'ielts_general',
  'business_communication',
  'workplace_english',
  'presentation_skills'
];

// Valid skill types
const VALID_SKILL_TYPES = ['speaking', 'writing'];

// Framework display names
const FRAMEWORK_DISPLAY_NAMES: Record<string, string> = {
  'ielts_academic': 'IELTS Academic',
  'ielts_general': 'IELTS General',
  'business_communication': 'Business Communication',
  'workplace_english': 'Workplace English',
  'presentation_skills': 'Presentation Skills'
};

// Level display names
const LEVEL_DISPLAY_NAMES: Record<string, string> = {
  'band_3_4': 'Band 3-4',
  'band_5_6': 'Band 5-6',
  'band_6_7': 'Band 6-7',
  'band_5': 'Band 5',
  'band_6_5': 'Band 6.5',
  'band_7': 'Band 7',
  'band_8': 'Band 8'
};

// Validate transcript feedback request
export function validateTranscriptRequest(request: TranscriptFeedbackRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.transcript_text && !request.youtube_url) {
    errors.push('Please provide either a transcript or a YouTube URL');
  }

  if (!request.assessment_framework) {
    errors.push('Assessment framework is required');
  } else if (!VALID_FRAMEWORKS.includes(request.assessment_framework)) {
    errors.push(`Invalid assessment framework. Valid options: ${VALID_FRAMEWORKS.join(', ')}`);
  }

  if (!request.skill_type) {
    errors.push('Skill type is required');
  } else if (!VALID_SKILL_TYPES.includes(request.skill_type)) {
    errors.push(`Invalid skill type. Valid options: ${VALID_SKILL_TYPES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Speaking part display names
const SPEAKING_PART_DISPLAY_NAMES: Record<string, string> = {
  'part_1': 'Part 1 - Introduction',
  'part_2': 'Part 2 - Cue Card',
  'part_3': 'Part 3 - Discussion'
};

// Generate feedback from direct transcript input (MVP UI)
export async function generateFeedbackFromTranscript(
  request: TranscriptFeedbackRequest
): Promise<TranscriptFeedbackResult> {
  try {
    // Validate request
    const validation = validateTranscriptRequest(request);
    if (!validation.valid) {
      return {
        status: 'error',
        error: validation.errors.join('; ')
      };
    }

    // If YouTube URL provided but no transcript, extract the transcript
    let transcriptText = request.transcript_text || '';
    let youtubeNote = '';
    
    if (request.youtube_url && !transcriptText.trim()) {
      console.log('Extracting transcript from YouTube:', request.youtube_url);
      const youtubeResult = await extractYoutubeTranscript(request.youtube_url);
      
      if (youtubeResult.success && youtubeResult.transcript) {
        transcriptText = youtubeResult.transcript;
        youtubeNote = '(Transcript extracted from YouTube video)\n\n';
        console.log('Successfully extracted transcript, length:', transcriptText.length);
      } else {
        return {
          status: 'error',
          error: youtubeResult.error || 'Failed to extract transcript from YouTube video. Please paste the transcript manually.'
        };
      }
    }

    // Remove timestamps from transcript for cleaner analysis
    transcriptText = removeTimestamps(transcriptText);
    console.log('Transcript after timestamp removal, length:', transcriptText.length);

    // Ensure we have content to analyze
    if (!transcriptText.trim()) {
      return {
        status: 'error',
        error: 'No transcript content available. Please provide a transcript or a valid YouTube video with captions.'
      };
    }

    // Build metadata for the prompt
    const frameworkName = FRAMEWORK_DISPLAY_NAMES[request.assessment_framework] || request.assessment_framework;
    const currentLevelName = request.current_level ? LEVEL_DISPLAY_NAMES[request.current_level] || request.current_level : 'Not specified';
    const targetLevelName = request.target_level ? LEVEL_DISPLAY_NAMES[request.target_level] || request.target_level : 'Not specified';
    const skillTypeName = request.skill_type.charAt(0).toUpperCase() + request.skill_type.slice(1);
    const speakingPartName = request.speaking_part ? SPEAKING_PART_DISPLAY_NAMES[request.speaking_part] || request.speaking_part : null;

    // Determine if task prompt is missing for IELTS tasks
    const isIELTS = request.assessment_framework === 'ielts_academic' || request.assessment_framework === 'ielts_general';
    const hasTaskPrompt = request.task_prompt && request.task_prompt.trim().length > 0;
    const taskPromptMissingNote = isIELTS && !hasTaskPrompt 
      ? "Task prompt not provided. Feedback focuses on language quality.\n\n"
      : "";

    // Build the task prompt section
    const taskPromptSection = hasTaskPrompt 
      ? `\nEXAMINER QUESTION / TASK PROMPT:\n${request.task_prompt}\n` 
      : "";

    // Build user prompt with metadata
    const userPrompt = `
DOCUMENT METADATA:
- Assessment Framework: ${frameworkName}
- Skill Focus: ${skillTypeName}${speakingPartName ? ` (${speakingPartName})` : ''}
- Target Level/Band: ${targetLevelName}
- Current Level: ${currentLevelName}
- Task Prompt Provided: ${hasTaskPrompt ? 'Yes' : 'No'}
${taskPromptSection}
TASK TYPE: ${request.skill_type.toUpperCase()}

STUDENT SUBMISSION:
${youtubeNote}${transcriptText}

${!hasTaskPrompt && isIELTS ? `IMPORTANT: No task prompt was provided. Focus your feedback primarily on:
- Fluency & Coherence
- Lexical Resource  
- Grammar & Accuracy
- Organisation
Reduce confidence in any Task Response/Achievement judgments and note this limitation.` : ''}

Please generate comprehensive feedback following the exact output structure specified.`;

    // Call OpenAI using the same prompt as the document-based engine
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: FEEDBACK_AGENT_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const rawFeedback = response.choices[0]?.message?.content || 'Unable to generate feedback';
    
    // Prepend the task prompt missing note if applicable
    const feedback = taskPromptMissingNote + rawFeedback;

    // Try to create a Google Doc with the feedback
    let googleDocUrl: string | undefined;
    try {
      googleDocUrl = await createFeedbackGoogleDoc(feedback, {
        framework: frameworkName,
        skillType: skillTypeName,
        targetLevel: targetLevelName
      });
    } catch (docError) {
      console.warn('Could not create Google Doc, returning feedback directly:', docError);
      // Continue without Google Doc URL if creation fails
    }

    return {
      status: 'success',
      feedback,
      message: googleDocUrl 
        ? 'Feedback generated and saved to Google Docs' 
        : 'Feedback generated successfully',
      google_doc_url: googleDocUrl
    };

  } catch (error) {
    console.error('Error generating transcript feedback:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to generate feedback'
    };
  }
}

// Create a new Google Doc with the generated feedback
async function createFeedbackGoogleDoc(
  feedbackContent: string,
  metadata: { framework: string; skillType: string; targetLevel: string }
): Promise<string> {
  const { getUncachableGoogleDriveClient, getGoogleDocsClient } = await import('./google-drive');
  
  const drive = await getUncachableGoogleDriveClient();
  const docs = await getGoogleDocsClient();
  
  // Generate a timestamp for the document title
  const timestamp = new Date().toISOString().split('T')[0];
  const title = `Feedback - ${metadata.framework} ${metadata.skillType} - ${timestamp}`;
  
  // Create a new document in Google Drive
  const fileMetadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document'
  };
  
  const file = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink'
  });
  
  const docId = file.data.id;
  const docUrl = file.data.webViewLink;
  
  if (!docId) {
    throw new Error('Failed to create Google Doc');
  }
  
  // Build the document content
  const documentContent = `
LAMBSBOOK EDUCATION FEEDBACK
Generated: ${new Date().toLocaleString()}

Framework: ${metadata.framework}
Skill Type: ${metadata.skillType}
Target Level: ${metadata.targetLevel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${feedbackContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Lambsbook Education Feedback Engine
`;

  // Insert the content into the document
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: documentContent
          }
        }
      ]
    }
  });
  
  return docUrl || `https://docs.google.com/document/d/${docId}/edit`;
}
