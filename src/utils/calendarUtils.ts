// Calendar ICS file generation utilities

interface WorkoutEvent {
  dayOfWeek: string;
  muscles: string[];
  time: string; // HH:MM format
  muscleLabels: string; // Translated muscle labels for display
}

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

function getNextDayDate(dayKey: string, time: string): Date {
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = DAY_TO_OFFSET[dayKey] ?? 0;
  
  let daysUntil = targetDay - todayDay;
  if (daysUntil <= 0) daysUntil += 7;
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  
  const [hours, minutes] = time.split(':').map(Number);
  nextDate.setHours(hours, minutes, 0, 0);
  
  return nextDate;
}

function formatDateToICS(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}00`;
}

function generateUID(): string {
  return `fitbarca-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@fitbarca.app`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateWorkoutICS(events: WorkoutEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FitBarça//Training//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FitBarça Training',
  ];

  for (const event of events) {
    const startDate = getNextDayDate(event.dayOfWeek, event.time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    const rruleDay = DAY_TO_RRULE[event.dayOfWeek] || 'MO';
    const title = `אימון FITBARÇA: ${event.muscleLabels}`;
    
    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUID()}`,
      `DTSTAMP:${formatDateToICS(new Date())}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`,
      `SUMMARY:${escapeICSText(title)}`,
      `DESCRIPTION:${escapeICSText(`אימון שרירים: ${event.muscleLabels}`)}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:אימון FitBarça מתחיל בעוד 15 דקות!',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

export function downloadICSFile(icsContent: string, filename: string = 'fitbarca-schedule.ics'): void {
  // Add BOM for UTF-8 encoding to ensure Hebrew characters display correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateAndDownloadCalendar(events: WorkoutEvent[]): void {
  const icsContent = generateWorkoutICS(events);
  downloadICSFile(icsContent);
}
