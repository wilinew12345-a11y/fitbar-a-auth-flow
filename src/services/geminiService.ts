import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const sendMessageToAI = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  currentLanguage: string,
): Promise<string> => {
  const messages: ChatMessage[] = [
    ...chatHistory,
    { role: "user", content: userMessage },
  ];

  const { data, error } = await supabase.functions.invoke('ai-coach', {
    body: { messages, currentLanguage }
  });

  if (error) {
    console.error("AI Coach invocation error:", error);
    throw new Error(error.message || "Failed to connect to AI Coach");
  }

  if (data?.error) {
    if (data.code === "RATE_LIMIT") {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (data.code === "PAYMENT_REQUIRED") {
      throw new Error("AI credits exhausted. Please add funds to continue.");
    }
    throw new Error(data.error);
  }

  if (!data?.content) {
    throw new Error("No response received from AI");
  }

  return data.content;
};
