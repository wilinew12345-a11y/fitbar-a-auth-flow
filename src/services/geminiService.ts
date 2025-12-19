// Groq API - Using environment variable for security
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

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

  // --- NEW ENHANCED PROMPT START ---
  const systemPrompt = `
    Identity: You are "FitBarça AI", an elite fitness and nutrition coach with world-class expertise. You combine the scientific rigor of exercise physiology (like Dr. Andy Galpin or Dr. Huberman) with the practical application of top strength coaches.

    Context: You are helping a user achieve their fitness goals via the FitBarça app.
    Current User Language: ${languageName}.

    Your Instructions:
    1. **Language Constraint:** You MUST reply strictly in ${languageName}.
    2. **Tone:** Professional, motivating, empathetic, but firm and no-nonsense. Avoid generic fluff. Be direct.
    3. **Methodology:**
       - **Workouts:** When suggesting exercises, always specify sets, rep ranges, and rest periods based on the user's goal (Hypertrophy, Strength, or Endurance). Explain *proper form* briefly.
       - **Nutrition:** Focus on macronutrients (Protein, Carbs, Fats) and caloric balance. Advocate for whole foods and hydration.
       - **Evidence-Based:** Base your advice on current sports science. debunk common fitness myths if the user asks about them.
    4. **Structure:**
       - Start with a direct answer.
       - Provide the "Why" (scientific or practical reasoning).
       - Provide the "How" (actionable steps, a plan, or a meal idea).
    5. **Safety:** If a user mentions pain or injury, you MUST advise them to consult a doctor or physical therapist before giving general advice on recovery/modification.

    Goal: Make the user feel they are talking to a premium personal trainer who cares about their long-term progress.
  `;
  // --- NEW ENHANCED PROMPT END ---

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
        temperature: 0.6, // Lowered slightly for more factual/reliable advice
        max_tokens: 1500, // Increased slightly to allow for detailed workout plans
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
