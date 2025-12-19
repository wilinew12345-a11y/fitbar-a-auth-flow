import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
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

const buildSystemPrompt = (languageName: string): string => {
  return `
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
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`AI Coach request from user: ${user.id}`);

    const { messages, currentLanguage } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = getLanguageFullName(currentLanguage || "en");
    const systemPrompt = buildSystemPrompt(languageName);

    console.log(`AI Coach request - User: ${user.id}, Language: ${languageName}, Messages count: ${messages?.length || 0}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", code: "RATE_LIMIT" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue.", code: "PAYMENT_REQUIRED" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response generated from AI");
    }

    console.log(`AI Coach response generated successfully for user: ${user.id}`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
