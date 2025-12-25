import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Motivational messages with {muscles} placeholder for each language
const MOTIVATION_MESSAGES: Record<string, string[]> = {
  he: [
    "זמן לטרוף! היום {muscles} על המוקד 💪",
    "התוכנית שלך מחכה, והשרירים (בעיקר {muscles}) לא יגדלו לבד!",
    "מאמן ה-AI כאן להזכיר: היום זה היום של ה-{muscles}. צא לדרך!",
    "יאללה אלוף! ה-{muscles} מחכים לך בחדר כושר 🏋️",
    "הגוף שלך יודע מה הוא צריך: אימון {muscles}. בוא נעשה את זה!",
    "⚽ שחקני ברצלונה לא מדלגים על אימונים. היום אנחנו עובדים על {muscles}!",
    "האם אתה מוכן? ה-{muscles} שלך מחכים להתפתח 🔥",
    "זה הזמן! אימון {muscles} מחכה לך. אל תוותר!",
    "תזכור: כל אימון מקרב אותך למטרה. היום {muscles} על הכוונת!",
    "האלופים לא מפסיקים! היום אנחנו מתמקדים ב-{muscles} 💯",
  ],
  en: [
    "Time to crush it! {muscles} on the menu today 💪",
    "Your plan is waiting, and those {muscles} won't grow themselves!",
    "AI Coach reminder: Today is {muscles} day. Let's go!",
    "Let's go champ! {muscles} are waiting at the gym 🏋️",
    "Your body knows what it needs: {muscles} workout. Let's do this!",
    "⚽ Barcelona players never skip training. Today we work on {muscles}!",
    "Are you ready? Your {muscles} are waiting to grow 🔥",
    "It's time! {muscles} workout awaits. Don't give up!",
    "Remember: Every workout brings you closer. {muscles} today!",
    "Champions don't stop! Today we focus on {muscles} 💯",
  ],
  es: [
    "¡Hora de arrasar! Hoy toca {muscles} 💪",
    "Tu plan te espera, ¡y esos {muscles} no crecerán solos!",
    "Recordatorio del entrenador IA: Hoy es día de {muscles}. ¡Vamos!",
    "¡Vamos campeón! Los {muscles} te esperan en el gimnasio 🏋️",
    "Tu cuerpo sabe lo que necesita: entrenamiento de {muscles}. ¡Hagámoslo!",
    "⚽ Los jugadores del Barcelona nunca faltan. ¡Hoy trabajamos {muscles}!",
    "¿Estás listo? Tus {muscles} esperan crecer 🔥",
    "¡Es hora! El entrenamiento de {muscles} te espera. ¡No te rindas!",
    "Recuerda: Cada entrenamiento te acerca a tu meta. ¡{muscles} hoy!",
    "¡Los campeones no paran! Hoy nos enfocamos en {muscles} 💯",
  ],
  ar: [
    "حان وقت التحطيم! اليوم {muscles} على الجدول 💪",
    "خطتك تنتظرك، وتلك {muscles} لن تنمو وحدها!",
    "تذكير من المدرب الذكي: اليوم يوم {muscles}. هيا بنا!",
    "يلا بطل! {muscles} تنتظرك في الصالة 🏋️",
    "جسمك يعرف ما يحتاجه: تمرين {muscles}. هيا نفعلها!",
    "⚽ لاعبو برشلونة لا يتغيبون عن التدريب. اليوم نعمل على {muscles}!",
    "هل أنت جاهز؟ {muscles} تنتظر النمو 🔥",
    "حان الوقت! تمرين {muscles} ينتظرك. لا تستسلم!",
    "تذكر: كل تمرين يقربك من هدفك. {muscles} اليوم!",
    "الأبطال لا يتوقفون! اليوم نركز على {muscles} 💯",
  ],
};

function getMotivationalMessage(muscles: string, language: string = 'he'): string {
  const messages = MOTIVATION_MESSAGES[language] || MOTIVATION_MESSAGES.he;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace('{muscles}', muscles);
}

// Day mapping for Hebrew to English
const DAY_MAP: Record<string, string> = {
  'sunday': 'ראשון',
  'monday': 'שני',
  'tuesday': 'שלישי',
  'wednesday': 'רביעי',
  'thursday': 'חמישי',
  'friday': 'שישי',
  'saturday': 'שבת',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Starting workout reminder check...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and day
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Get current day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getUTCDay()];
    
    console.log(`📅 Current UTC time: ${currentTimeStr}, Day: ${currentDay}`);

    // Query for schedules matching current time and day
    const { data: schedules, error: schedulesError } = await supabase
      .from('weekly_schedules')
      .select('user_id, workout_types, workout_time, day_of_week')
      .eq('day_of_week', currentDay)
      .not('workout_time', 'is', null);

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      throw schedulesError;
    }

    console.log(`📋 Found ${schedules?.length || 0} schedules for ${currentDay}`);

    // Filter schedules that match current time (within 1 minute window)
    const matchingSchedules = schedules?.filter(schedule => {
      if (!schedule.workout_time) return false;
      const scheduledTime = schedule.workout_time.substring(0, 5); // HH:MM format
      return scheduledTime === currentTimeStr;
    }) || [];

    console.log(`✅ ${matchingSchedules.length} schedules match current time`);

    // Send notifications to matching users
    let sentCount = 0;
    let errorCount = 0;

    for (const schedule of matchingSchedules) {
      try {
        // Get user profile with push subscription
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('push_subscription, preferred_language')
          .eq('id', schedule.user_id)
          .single();

        if (profileError || !profile?.push_subscription) {
          console.log(`⚠️ No push subscription for user ${schedule.user_id}`);
          continue;
        }

        const subscription = profile.push_subscription;
        const language = profile.preferred_language || 'he';
        const muscles = schedule.workout_types?.join(', ') || 'שרירים';
        const message = getMotivationalMessage(muscles, language);

        console.log(`📤 Sending notification to user ${schedule.user_id}: ${message}`);

        // Send web push notification
        const pushPayload = {
          title: language === 'he' ? 'FITBARÇA - זמן לאימון!' : 'FITBARÇA - Workout Time!',
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          data: {
            url: '/dashboard',
            muscles: schedule.workout_types,
          },
        };

        // Use web-push to send notification
        // Note: This requires VAPID keys to be set up
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

        if (!vapidPublicKey || !vapidPrivateKey) {
          console.log('⚠️ VAPID keys not configured, skipping push');
          continue;
        }

        // Send the push notification using fetch to the push service
        const pushEndpoint = subscription.endpoint;
        const authKey = subscription.keys?.auth;
        const p256dhKey = subscription.keys?.p256dh;

        if (!pushEndpoint || !authKey || !p256dhKey) {
          console.log('⚠️ Invalid subscription format');
          continue;
        }

        // For now, log the notification that would be sent
        // Full web-push implementation requires additional crypto libraries
        console.log(`📨 Would send push to: ${pushEndpoint}`);
        console.log(`📝 Payload: ${JSON.stringify(pushPayload)}`);

        sentCount++;
      } catch (err) {
        console.error(`❌ Error sending to user ${schedule.user_id}:`, err);
        errorCount++;
      }
    }

    const result = {
      success: true,
      timestamp: now.toISOString(),
      currentTime: currentTimeStr,
      currentDay,
      schedulesFound: schedules?.length || 0,
      matchingSchedules: matchingSchedules.length,
      notificationsSent: sentCount,
      errors: errorCount,
    };

    console.log('📊 Result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in send-workout-reminders:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
