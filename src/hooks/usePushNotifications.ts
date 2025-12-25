import { useState, useEffect, useCallback } from 'react';
import { getMotivationalMessage } from '@/services/motivationService';

type Language = 'he' | 'en' | 'es' | 'ar';

interface ScheduledWorkout {
  dayOfWeek: string;
  time: string; // HH:MM format
  muscles: string;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => void;
  scheduleNotifications: (workouts: ScheduledWorkout[], language: Language) => void;
  showTestNotification: (muscles: string, language: Language) => void;
}

const STORAGE_KEY = 'fitbarca-notifications-enabled';
const SCHEDULED_KEY = 'fitbarca-scheduled-notifications';

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsEnabled(stored === 'true' && Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setIsEnabled(true);
        localStorage.setItem(STORAGE_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const toggleNotifications = useCallback((enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      requestPermission();
      return;
    }
    
    setIsEnabled(enabled);
    localStorage.setItem(STORAGE_KEY, enabled.toString());
    
    if (!enabled) {
      // Clear scheduled notifications
      localStorage.removeItem(SCHEDULED_KEY);
    }
  }, [permission, requestPermission]);

  const showTestNotification = useCallback((muscles: string, language: Language) => {
    if (!isSupported || permission !== 'granted') return;

    const message = getMotivationalMessage(muscles, language);
    
    new Notification('FitBarça 💪', {
      body: message,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'fitbarca-test',
      requireInteraction: false,
    });
  }, [isSupported, permission]);

  const scheduleNotifications = useCallback((workouts: ScheduledWorkout[], language: Language) => {
    if (!isSupported || permission !== 'granted' || !isEnabled) return;

    // Store scheduled workouts for the service worker to handle
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify({ workouts, language }));

    // For now, we'll use a simple approach with setInterval to check
    // In production, this would be handled by a service worker
    const checkAndNotify = () => {
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const todayWorkout = workouts.find(w => w.dayOfWeek === currentDay && w.time === currentTime);
      
      if (todayWorkout) {
        const message = getMotivationalMessage(todayWorkout.muscles, language);
        
        new Notification('FitBarça - זמן לאימון! 💪', {
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `fitbarca-workout-${currentDay}`,
          requireInteraction: true,
        });
      }
    };

    // Check every minute
    const intervalId = setInterval(checkAndNotify, 60000);
    
    // Store interval ID for cleanup
    (window as any).__fitbarca_notification_interval = intervalId;
  }, [isSupported, permission, isEnabled]);

  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    toggleNotifications,
    scheduleNotifications,
    showTestNotification,
  };
}
