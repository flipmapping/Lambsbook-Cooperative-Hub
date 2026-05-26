import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

export interface TranscriptResult {
  success: boolean;
  transcript?: string;
  error?: string;
}

export async function extractYoutubeTranscript(urlOrId: string): Promise<TranscriptResult> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(urlOrId);
    
    if (!segments || segments.length === 0) {
      return {
        success: false,
        error: 'No transcript available for this video. The video may not have captions enabled.'
      };
    }

    const transcript = segments
      .map((segment: TranscriptSegment) => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      transcript
    };
  } catch (error: any) {
    let errorMessage = 'Failed to extract transcript from YouTube video.';
    
    if (error.message?.includes('Transcript is disabled')) {
      errorMessage = 'Transcripts are disabled for this video.';
    } else if (error.message?.includes('Video unavailable')) {
      errorMessage = 'Video is unavailable or private.';
    } else if (error.message?.includes('Could not find')) {
      errorMessage = 'Could not find transcript. The video may not have captions.';
    }
    
    console.error('YouTube transcript extraction error:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}
