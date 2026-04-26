import OpenAI from "openai";

// REMOVED: unsafe top-level init
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const systemPrompt = `You are a helpful customer service assistant for Other Path Travel, a global partner of Glory International. 
You specialize in immigration services, particularly the EB3 Work Visa Program for the United States.

Key Information:
- EB-3A Professionals: For those with a U.S. bachelor's degree or foreign equivalent
- EB-3B Skilled Workers: For workers with at least 2 years of experience
- EB-3C Other Workers: For positions requiring less than 2 years of training

Services offered:
- Work Visa Assistance (EB3, H1B, etc.)
- Job Placement in hospitality, healthcare, food service
- Study Abroad programs
- Scholarship Applications
- Tourist and Business Visas

Countries served: USA, Canada, UK, Australia, Vietnam, Malaysia, Taiwan, China

Be helpful, professional, and encouraging. If someone seems like a good candidate, encourage them to fill out the contact form or reach out via WhatsApp/Zalo for a free consultation.

Keep responses concise and friendly. If you don't know specific details about timelines or costs, suggest they contact the team for personalized information.`;

export async function generateAIResponse(userMessage: string, conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []): Promise<{
  response: string;
  intent?: string;
  sentiment?: string;
}> {
  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I am unable to respond at the moment. Please try again or contact us directly.';

    const intent = detectIntent(userMessage);
    const sentiment = detectSentiment(userMessage);

    return { response, intent, sentiment };
  } catch (error) {
    console.error('AI response error:', error);
    return {
      response: 'I apologize, but I am experiencing technical difficulties. Please contact us directly via WhatsApp or email for immediate assistance.',
      intent: 'error',
      sentiment: 'neutral',
    };
  }
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('eb3') || lowerMessage.includes('green card') || lowerMessage.includes('work visa')) {
    return 'eb3_inquiry';
  }
  if (lowerMessage.includes('study') || lowerMessage.includes('university') || lowerMessage.includes('scholarship')) {
    return 'study_abroad';
  }
  if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment')) {
    return 'job_placement';
  }
  if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('fee')) {
    return 'pricing_inquiry';
  }
  if (lowerMessage.includes('how long') || lowerMessage.includes('timeline') || lowerMessage.includes('process')) {
    return 'timeline_inquiry';
  }
  if (lowerMessage.includes('requirement') || lowerMessage.includes('qualify') || lowerMessage.includes('eligible')) {
    return 'eligibility_inquiry';
  }
  
  return 'general_inquiry';
}

function detectSentiment(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  const positiveWords = ['thank', 'great', 'excellent', 'happy', 'excited', 'wonderful', 'amazing'];
  const negativeWords = ['frustrated', 'angry', 'disappointed', 'confused', 'worried', 'problem', 'issue'];
  
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export async function generateLeadScore(enquiry: {
  inquiryType: string;
  message?: string;
  countryOfInterest?: string;
}): Promise<number> {
  let score = 50;
  
  if (enquiry.inquiryType === 'eb3') score += 20;
  if (enquiry.inquiryType === 'work') score += 15;
  if (enquiry.inquiryType === 'job') score += 10;
  
  if (enquiry.countryOfInterest === 'USA') score += 10;
  
  if (enquiry.message && enquiry.message.length > 100) score += 10;
  
  return Math.min(score, 100);
}

export async function generateContentSuggestion(section: string, currentContent: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content writer for an immigration services company. Generate compelling, professional content.',
        },
        {
          role: 'user',
          content: `Improve this ${section} content for an immigration services website. Keep it professional and encouraging:\n\n${currentContent}`,
        },
      ],
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || currentContent;
  } catch (error) {
    console.error('Content suggestion error:', error);
    return currentContent;
  }
}
