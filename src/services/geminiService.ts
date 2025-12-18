// Placeholder API key - replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyCDswjufzebrFo3GezCHNPe-y8OVgIT9mg';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
      role: string;
    };
  }[];
  error?: {
    message: string;
  };
}

const getLanguageFullName = (langCode: string): string => {
  const languageMap: Record<string, string> = {
    he: 'Hebrew',
    en: 'English',
    es: 'Spanish',
    ar: 'Arabic'
  };
  return languageMap[langCode] || 'English';
};

export const sendMessageToGemini = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  currentLanguage: string
): Promise<string> => {
  const languageName = getLanguageFullName(currentLanguage);
  
  const systemInstruction = `You are a professional FitBarça fitness coach. You are knowledgeable about workouts, nutrition, training plans, and athletic performance.
Current User Language: ${languageName}.
INSTRUCTION: You MUST reply to the user strictly in ${languageName}, regardless of the language they type in. Always be encouraging, professional, and helpful.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }]
    },
    {
      role: 'model',
      parts: [{ text: `Understood. I am your FitBarça fitness coach and I will respond in ${languageName}.` }]
    },
    ...chatHistory,
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from Gemini');
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No response generated');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
