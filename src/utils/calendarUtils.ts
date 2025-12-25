// Calendar ICS file generation utilities

interface WorkoutEvent {
  dayOfWeek: string;
  muscles: string[];
  time: string; // HH:MM format
  muscleLabels: string; // Translated muscle labels for display
}

export type DeviceType = 'ios' | 'android' | 'desktop';

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

// Detect user's device type
export function detectDeviceType(): DeviceType {
  const userAgent = navigator.userAgent || navigator.vendor || '';
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  
  // Android detection
  if (/android/i.test(userAgent)) {
    return 'android';
  }
  
  return 'desktop';
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

// Create a data URL for the ICS content (for webcal and Google Calendar)
export function createICSDataUrl(icsContent: string): string {
  const bom = '\uFEFF';
  const blob = new Blob([bom + icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

// Open calendar based on device type
export function openCalendarForDevice(events: WorkoutEvent[], deviceType: DeviceType): void {
  const icsContent = generateWorkoutICS(events);
  
  if (deviceType === 'ios') {
    // For iOS, download the ICS file which will trigger the native calendar
    downloadICSFile(icsContent);
  } else if (deviceType === 'android') {
    // For Android, download the ICS file which opens in Google Calendar
    downloadICSFile(icsContent);
    // Note: The Google Calendar URL subscription requires a publicly hosted ICS file
    // For now, we download the file which Android will offer to open with Google Calendar
  } else {
    // For desktop, download the ICS file
    downloadICSFile(icsContent);
  }
}

export function generateAndDownloadCalendar(events: WorkoutEvent[]): void {
  const deviceType = detectDeviceType();
  openCalendarForDevice(events, deviceType);
}
