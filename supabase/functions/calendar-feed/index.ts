import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/calendar; charset=utf-8',
};

const DAY_TO_RRULE: Record<string, string> = {
  sunday: 'SU',
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
  saturday: 'SA',
};

const DAY_TO_OFFSET: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MUSCLE_LABELS_HE: Record<string, string> = {
  chest: 'חזה',
  back: 'גב',
  shoulders: 'כתפיים',
  biceps: 'יד קידמית',
  triceps: 'יד אחורית',
  legs: 'רגליים',
  abs: 'בטן',
  cardio: 'אירובי',
};

function getNextDayDate(dayKey: string, time: string): Date {
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = DAY_TO_OFFSET[dayKey] ?? 0;
  
  let daysUntil = targetDay - todayDay;
  if (daysUntil <= 0) daysUntil += 7;
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  nextDate.setHours(hours || 9, minutes || 0, 0, 0);
  
  return nextDate;
}

function formatDateToICS(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function getSequenceNumber(updatedAt: string): number {
  return Math.floor(new Date(updatedAt).getTime() / 1000);
}

function generateUID(userId: string, dayKey: string): string {
  return `fitbarca-${userId}-${dayKey}@fitbarca.app`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function getMuscleLabels(muscleKeys: string[]): string {
  return muscleKeys.map(key => MUSCLE_LABELS_HE[key] || key).join(', ');
}

// Generate an empty ICS calendar (used when calendar sync is disabled)
function generateEmptyICS(): string {
  const bom = '\uFEFF';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FitBarça//Training//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FitBarça Training',
    'X-WR-TIMEZONE:Asia/Jerusalem',
    'END:VCALENDAR',
  ];
  return bom + lines.join('\r\n');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      console.error('Missing userId parameter');
      return new Response('Missing userId parameter', { status: 400, headers: corsHeaders });
    }

    console.log(`Generating calendar feed for user: ${userId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if calendar sync is enabled for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('calendar_sync_enabled')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Return empty calendar on error
      return new Response(generateEmptyICS(), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Disposition': 'attachment; filename="fitbarca-schedule.ics"',
        },
      });
    }

    // If calendar sync is disabled, return empty ICS to wipe events from device
    if (!profile?.calendar_sync_enabled) {
      console.log(`Calendar sync disabled for user ${userId}, returning empty ICS`);
      return new Response(generateEmptyICS(), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Disposition': 'attachment; filename="fitbarca-schedule.ics"',
        },
      });
    }

    // Fetch user's weekly schedules with ordering for deduplication
    const { data: rawSchedules, error } = await supabase
      .from('weekly_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching schedules:', error);
      return new Response('Error fetching schedules', { status: 500, headers: corsHeaders });
    }

    // Deduplicate by day_of_week (keep most recent) - safety net
    const scheduleMap = new Map<string, typeof rawSchedules[0]>();
    for (const schedule of rawSchedules || []) {
      if (!scheduleMap.has(schedule.day_of_week)) {
        scheduleMap.set(schedule.day_of_week, schedule);
      }
    }
    const schedules = Array.from(scheduleMap.values());

    console.log(`Found ${rawSchedules?.length || 0} raw schedules, ${schedules.length} unique days for user`);

    // Generate ICS content with UTF-8 BOM for Hebrew support
    const bom = '\uFEFF';
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FitBarça//Training//HE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:FitBarça Training',
      'X-WR-TIMEZONE:Asia/Jerusalem',
    ];

    for (const schedule of schedules) {
      const time = schedule.workout_time || '09:00';
      const startDate = getNextDayDate(schedule.day_of_week, time);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
      const rruleDay = DAY_TO_RRULE[schedule.day_of_week] || 'MO';
      const muscleLabels = getMuscleLabels(schedule.workout_types || []);
      const title = `אימון FITBARÇA: ${muscleLabels}`;
      const sequenceNum = getSequenceNumber(schedule.updated_at);
      const lastModified = formatDateToICS(new Date(schedule.updated_at));
      
      lines.push(
        'BEGIN:VEVENT',
        `UID:${generateUID(userId, schedule.day_of_week)}`,
        `DTSTAMP:${formatDateToICS(new Date())}`,
        `DTSTART:${formatDateToICS(startDate)}`,
        `DTEND:${formatDateToICS(endDate)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`,
        `SEQUENCE:${sequenceNum}`,
        `LAST-MODIFIED:${lastModified}`,
        `SUMMARY:${escapeICSText(title)}`,
        `DESCRIPTION:${escapeICSText(`אימון שרירים: ${muscleLabels}`)}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        'DESCRIPTION:אימון FitBarça מתחיל בעוד 15 דקות!',
        'END:VALARM',
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    
    const icsContent = bom + lines.join('\r\n');

    console.log('Calendar feed generated successfully');

    return new Response(icsContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Disposition': 'attachment; filename="fitbarca-schedule.ics"',
      },
    });
  } catch (error: unknown) {
    console.error('Calendar feed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Error: ${errorMessage}`, { status: 500, headers: corsHeaders });
  }
});
