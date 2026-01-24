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

const openai = new OpenAI({
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
Create a markdown table with columns:
| Original Excerpt | Improved Version | Explanation & Upgrade Strategy |

Rules:
- Use the student's original ideas
- Improve only to the target level, not beyond
- Explain patterns and strategies, not just corrections
- Prioritize high-impact improvements
- Include 5-8 rows

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
