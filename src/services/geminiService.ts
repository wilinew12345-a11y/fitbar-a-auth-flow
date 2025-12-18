// Groq API - Paste your API key here (get one at console.groq.com)
const GROQ_API_KEY = "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";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GroqResponse {
  choices?: {
    message: {
      content: string;
      role: string;
    };
  }[];
  error?: {
    message: string;
  };
}

const getLanguageFullName = (langCode: string): string => {
  const languageMap: Record<string, string> = {
    he: "Hebrew",
    en: "English",
    es: "Spanish",
    ar: "Arabic",
  };
  return languageMap[langCode] || "English";
};

export const sendMessageToAI = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  currentLanguage: string,
): Promise<string> => {
  const languageName = getLanguageFullName(currentLanguage);

  const systemPrompt = `You are a professional FitBarça fitness coach. You are knowledgeable about workouts, nutrition, training plans, and athletic performance.
Current User Language: ${languageName}.
INSTRUCTION: You MUST reply to the user strictly in ${languageName}, regardless of the language they type in. Always be encouraging, professional, and helpful.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", response.status, errorData);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your Groq API key.");
      }

      throw new Error(errorData.error?.message || "Failed to get response from Groq");
    }

    const data: GroqResponse = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    throw new Error("No response generated");
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};
