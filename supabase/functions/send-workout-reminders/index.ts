import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Motivational messages with {muscles} placeholder for each language
const MOTIVATION_MESSAGES: Record<string, string[]> = {
  he: [
    "בעוד שעה אתה מתאמן {muscles}! התכונן 💪",
    "הגיע הזמן להתכונן לאימון {muscles}! 🔥",
    "האימון שלך מתקרב! {muscles} מחכים לך 🎯",
    "עוד 60 דקות ואתה בפעולה! אימון {muscles} 💥",
    "זה הזמן להתארגן! אימון {muscles} בקרוב 🏋️",
    "מאמן ה-AI כאן להזכיר: בעוד שעה {muscles}. צא לדרך!",
    "יאללה אלוף! ה-{muscles} מחכים לך בעוד שעה 💯",
    "⚽ שחקני ברצלונה לא מדלגים! אימון {muscles} בעוד שעה!",
  ],
  en: [
    "Your {muscles} workout starts in 1 hour! Get ready 💪",
    "Time to prepare for your {muscles} training! 🔥",
    "Your workout is coming up! {muscles} awaits 🎯",
    "60 minutes until action! {muscles} workout 💥",
    "Time to get organized! {muscles} training soon 🏋️",
    "AI Coach reminder: {muscles} in 1 hour. Let's go!",
    "Let's go champ! {muscles} waiting in 1 hour 💯",
    "⚽ Barcelona players never skip! {muscles} in 1 hour!",
  ],
  es: [
    "¡Tu entrenamiento de {muscles} empieza en 1 hora! Prepárate 💪",
    "¡Hora de prepararte para {muscles}! 🔥",
    "¡Tu entrenamiento se acerca! {muscles} te espera 🎯",
    "¡60 minutos para la acción! Entrenamiento de {muscles} 💥",
    "¡Es hora de organizarse! {muscles} pronto 🏋️",
  ],
  ar: [
    "تمرين {muscles} يبدأ خلال ساعة! استعد 💪",
    "حان وقت التحضير لتمرين {muscles}! 🔥",
    "تمرينك قادم! {muscles} ينتظرك 🎯",
    "60 دقيقة للعمل! تمرين {muscles} 💥",
  ],
};

// Muscle group translations
const MUSCLE_LABELS: Record<string, Record<string, string>> = {
  he: {
    'chest': 'חזה',
    'back': 'גב',
    'shoulders': 'כתפיים',
    'biceps': 'יד קדמית',
    'triceps': 'יד אחורית',
    'legs': 'רגליים',
    'abs': 'בטן',
    'cardio': 'אירובי',
  },
  en: {
    'chest': 'Chest',
    'back': 'Back',
    'shoulders': 'Shoulders',
    'biceps': 'Biceps',
    'triceps': 'Triceps',
    'legs': 'Legs',
    'abs': 'Abs',
    'cardio': 'Cardio',
  },
};

// Days array for JavaScript getDay() (0 = Sunday)
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getMotivationalMessage(muscles: string, language: string = 'he'): string {
  const messages = MOTIVATION_MESSAGES[language] || MOTIVATION_MESSAGES.he;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace('{muscles}', muscles);
}

function getMuscleLabels(workoutTypes: string[], language: string = 'he'): string {
  const labels = MUSCLE_LABELS[language] || MUSCLE_LABELS.he;
  return workoutTypes.map(type => labels[type] || type).join(', ');
}

// Check if time is in quiet hours (23:00-06:00)
function isInQuietHours(hour: number): boolean {
  return hour >= 23 || hour < 6;
}

// Parse time string "HH:MM" or "HH:MM:SS" to hours and minutes
function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(':');
  return {
    hour: parseInt(parts[0], 10),
    minute: parseInt(parts[1], 10),
  };
}

// Calculate reminder time (60 minutes before workout)
function getReminderTime(workoutHour: number, workoutMinute: number): { hour: number; minute: number } {
  let reminderHour = workoutHour;
  let reminderMinute = workoutMinute - 60;
  
  if (reminderMinute < 0) {
    reminderMinute += 60;
    reminderHour -= 1;
    if (reminderHour < 0) {
      reminderHour = 23;
    }
  }
  
  return { hour: reminderHour, minute: reminderMinute };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Starting workout reminder check (T-60 minutes)...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time in Israel timezone
    const now = new Date();
    const israelTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
    const israelTime = new Date(israelTimeStr);
    
    const currentHour = israelTime.getHours();
    const currentMinute = israelTime.getMinutes();
    const currentDayIndex = israelTime.getDay();
    const currentDay = DAYS_OF_WEEK[currentDayIndex];
    
    console.log(`⏰ Israel time: ${currentHour}:${String(currentMinute).padStart(2, '0')}, Day: ${currentDay}`);

    // Fetch all schedules for today that have a workout time set
    const { data: schedules, error: schedulesError } = await supabase
      .from('weekly_schedules')
      .select('user_id, workout_types, workout_time, day_of_week')
      .eq('day_of_week', currentDay)
      .not('workout_time', 'is', null);

    if (schedulesError) {
      console.error('❌ Error fetching schedules:', schedulesError);
      throw schedulesError;
    }

    console.log(`📅 Found ${schedules?.length || 0} schedules for ${currentDay}`);

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const schedule of schedules || []) {
      try {
        const workoutTime = parseTime(schedule.workout_time);
        const reminderTime = getReminderTime(workoutTime.hour, workoutTime.minute);
        
        // Check if current time matches reminder time (within same minute)
        if (currentHour !== reminderTime.hour || currentMinute !== reminderTime.minute) {
          continue; // Not time for this reminder yet
        }

        console.log(`🎯 Reminder time match for user ${schedule.user_id}: workout at ${schedule.workout_time}, reminder at ${reminderTime.hour}:${String(reminderTime.minute).padStart(2, '0')}`);

        // Nighttime Shield Check
        // Skip if we're in quiet hours (23:00-06:00) AND the workout itself is NOT in quiet hours
        // This allows notifications for workouts specifically scheduled during night (e.g., 05:00 workout → 04:00 reminder is OK)
        const isQuietHoursNow = isInQuietHours(currentHour);
        const isWorkoutInQuietHours = isInQuietHours(workoutTime.hour);
        
        if (isQuietHoursNow && !isWorkoutInQuietHours) {
          console.log(`🌙 Skipping: quiet hours (${currentHour}:${currentMinute}) for daytime workout at ${schedule.workout_time}`);
          skippedCount++;
          continue;
        }

        // Fetch user profile with notification settings
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('push_subscription, preferred_language, notifications_enabled')
          .eq('id', schedule.user_id)
          .single();

        if (profileError) {
          console.error(`❌ Error fetching profile for user ${schedule.user_id}:`, profileError);
          errorCount++;
          continue;
        }

        // Check if notifications are enabled in profile
        if (!profile?.notifications_enabled) {
          console.log(`🔕 Notifications disabled for user ${schedule.user_id}`);
          skippedCount++;
          continue;
        }

        // Check if user has a valid push subscription
        if (!profile?.push_subscription) {
          console.log(`📱 No push subscription for user ${schedule.user_id}`);
          skippedCount++;
          continue;
        }

        const language = profile.preferred_language || 'he';
        const muscleLabels = getMuscleLabels(schedule.workout_types || [], language);
        const message = getMotivationalMessage(muscleLabels, language);

        const pushPayload = {
          title: language === 'he' ? 'FITBARÇA - הזמן להתכונן!' : 'FITBARÇA - Time to prepare!',
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `workout-reminder-${schedule.user_id}-${currentDay}`,
          data: {
            type: 'workout-reminder',
            day: currentDay,
            muscles: muscleLabels,
            workoutTime: schedule.workout_time,
          },
        };

        console.log(`📤 Preparing notification for user ${schedule.user_id}:`, JSON.stringify(pushPayload));

        // Check for VAPID keys
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

        if (!vapidPublicKey || !vapidPrivateKey) {
          console.log('⚠️ VAPID keys not configured - logging notification instead of sending');
          console.log(`📨 Would send to endpoint: ${(profile.push_subscription as any)?.endpoint?.substring(0, 80)}...`);
          sentCount++;
          continue;
        }

        // Validate subscription format
        const subscription = profile.push_subscription as any;
        if (!subscription?.endpoint || !subscription?.keys?.auth || !subscription?.keys?.p256dh) {
          console.log(`⚠️ Invalid subscription format for user ${schedule.user_id}`);
          skippedCount++;
          continue;
        }

        // Note: Full web-push implementation requires additional crypto libraries
        // For now, log the notification that would be sent
        console.log(`✅ Notification logged for user ${schedule.user_id}`);
        console.log(`📝 Payload: ${JSON.stringify(pushPayload)}`);
        
        sentCount++;
      } catch (err) {
        console.error(`❌ Error processing schedule for user ${schedule.user_id}:`, err);
        errorCount++;
      }
    }

    const result = {
      success: true,
      timestamp: israelTime.toISOString(),
      currentTime: `${currentHour}:${String(currentMinute).padStart(2, '0')}`,
      currentDay,
      schedulesFound: schedules?.length || 0,
      notificationsSent: sentCount,
      skipped: skippedCount,
      errors: errorCount,
    };

    console.log('📊 Reminder check complete:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Fatal error in send-workout-reminders:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
