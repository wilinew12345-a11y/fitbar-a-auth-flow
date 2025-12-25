// Calendar ICS file generation utilities

interface WorkoutEvent {
  dayOfWeek: string;
  muscles: string[];
  time: string; // HH:MM format
  muscleLabels: string; // Translated muscle labels for display
}

export type DeviceType = 'ios' | 'android' | 'desktop';

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

// Get the calendar feed URL for a user
export function getCalendarFeedUrl(userId: string): string {
  return `https://wdccaqibuxtgktejushz.supabase.co/functions/v1/calendar-feed?userId=${userId}`;
}

// Open calendar subscription based on device type
export function openCalendarSubscription(userId: string, deviceType: DeviceType): void {
  const feedUrl = getCalendarFeedUrl(userId);
  
  if (deviceType === 'ios') {
    // For iOS, use webcal:// protocol which triggers native Calendar subscription
    const webcalUrl = `webcal://${feedUrl.replace('https://', '')}`;
    console.log('Opening webcal URL for iOS:', webcalUrl);
    window.location.href = webcalUrl;
  } else {
    // For Android/Desktop, use Google Calendar subscription
    const googleCalUrl = `https://www.google.com/calendar/render?cid=${encodeURIComponent(feedUrl)}`;
    console.log('Opening Google Calendar URL:', googleCalUrl);
    window.open(googleCalUrl, '_blank');
  }
}
