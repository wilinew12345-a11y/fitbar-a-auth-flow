import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  isSubscribed: boolean;
  isPWAStandalone: boolean;
  requestPermission: () => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => void;
  scheduleNotifications: (workouts: ScheduledWorkout[], language: Language) => void;
  showTestNotification: (muscles: string, language: Language) => void;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
}

const STORAGE_KEY = 'fitbarca-notifications-enabled';
const SCHEDULED_KEY = 'fitbarca-scheduled-notifications';

// VAPID public key - this must match the one stored in Supabase secrets
// Generate new keys with: npx web-push generate-vapid-keys
// Replace this with your actual VAPID public key from: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_VAPID_KEY';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Check if running as PWA in standalone mode
function checkIsPWAStandalone(): boolean {
  // Check display-mode media query (works on most browsers)
  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check iOS Safari standalone mode
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  
  // Check if running in Android TWA (Trusted Web Activity)
  const referrer = document.referrer;
  const isTWA = referrer.includes('android-app://');
  
  return displayModeStandalone || iosStandalone || isTWA;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPWAStandalone, setIsPWAStandalone] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    setIsPWAStandalone(checkIsPWAStandalone());
    
    if (supported) {
      setPermission(Notification.permission);
      // isEnabled now syncs with database in SyncManagementCard
      // Only use localStorage as a fallback for permission state
      setIsEnabled(Notification.permission === 'granted');
    }
    
    // Check if already subscribed
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setIsEnabled(true);
        localStorage.setItem(STORAGE_KEY, 'true');
        
        // Register service worker
        await registerServiceWorker();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications and save REAL subscription to Supabase
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      console.log('Push not supported or no user');
      return false;
    }

    // Validate VAPID key is configured
    if (VAPID_PUBLIC_KEY === 'YOUR_PUBLIC_VAPID_KEY') {
      console.error('VAPID public key not configured. Please replace YOUR_PUBLIC_VAPID_KEY with your actual VAPID public key.');
      return false;
    }

    try {
      console.log('Starting push subscription process...');
      
      // Get existing or register new service worker
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log('No existing service worker, registering new one...');
        registration = await registerServiceWorker();
      }
      
      if (!registration) {
        console.error('Failed to get service worker registration');
        return false;
      }

      console.log('Service worker registration:', registration);

      // Wait for the service worker to be ready
      registration = await navigator.serviceWorker.ready;
      console.log('Service worker is ready');

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      console.log('Existing subscription:', subscription);

      if (!subscription) {
        console.log('Creating new push subscription with VAPID key...');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('Push subscription created:', subscription);
      }

      // Get the full subscription JSON with endpoint and keys (p256dh, auth)
      const subscriptionJSON = subscription.toJSON();
      console.log('Subscription JSON:', subscriptionJSON);

      // Save to Supabase - both the subscription AND notifications_enabled flag
      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_subscription: subscriptionJSON as unknown as null,
          notifications_enabled: true,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to save push subscription:', error);
        throw error;
      }

      console.log('Push subscription saved to Supabase successfully');
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return false;
    }
  }, [isSupported, user]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Clear subscription from service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          console.log('Unsubscribed from push manager');
        }
      }
      
      // Clear subscription from Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ push_subscription: null })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error clearing subscription:', error);
        return false;
      }
      
      setIsSubscribed(false);
      console.log('Push subscription removed from Supabase');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }, [user]);

  const toggleNotifications = useCallback((enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      requestPermission();
      return;
    }
    
    setIsEnabled(enabled);
    // No longer using localStorage as source of truth - DB handles persistence
    
    if (!enabled) {
      // Clear scheduled notifications
      localStorage.removeItem(SCHEDULED_KEY);
    }
  }, [permission, requestPermission]);

  const showTestNotification = useCallback((muscles: string, language: Language) => {
    if (!isSupported || permission !== 'granted') return;

    const message = getMotivationalMessage(muscles, language);
    
    // Try to use service worker notification first
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('FitBarça 💪', {
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'fitbarca-test',
          requireInteraction: false,
          dir: language === 'he' || language === 'ar' ? 'rtl' : 'ltr',
          lang: language,
        });
      }).catch(() => {
        // Fallback to regular notification
        new Notification('FitBarça 💪', {
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'fitbarca-test',
          requireInteraction: false,
        });
      });
    } else {
      new Notification('FitBarça 💪', {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'fitbarca-test',
        requireInteraction: false,
      });
    }
  }, [isSupported, permission]);

  const scheduleNotifications = useCallback((workouts: ScheduledWorkout[], language: Language) => {
    if (!isSupported || permission !== 'granted' || !isEnabled) return;

    // Store scheduled workouts for the service worker to handle
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify({ workouts, language }));

    // For now, we'll use a simple approach with setInterval to check
    // In production, this would be handled by the server-side cron job
    const checkAndNotify = () => {
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const todayWorkout = workouts.find(w => w.dayOfWeek === currentDay && w.time === currentTime);
      
      if (todayWorkout) {
        const message = getMotivationalMessage(todayWorkout.muscles, language);
        
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('FitBarça - זמן לאימון! 💪', {
              body: message,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: `fitbarca-workout-${currentDay}`,
              requireInteraction: true,
              dir: language === 'he' || language === 'ar' ? 'rtl' : 'ltr',
              lang: language,
            });
          });
        } else {
          new Notification('FitBarça - זמן לאימון! 💪', {
            body: message,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: `fitbarca-workout-${currentDay}`,
            requireInteraction: true,
          });
        }
      }
    };

    // Check every minute
    const intervalId = window.setInterval(checkAndNotify, 60000);
    
    // Store interval ID for cleanup
    (window as unknown as { __fitbarca_notification_interval: number }).__fitbarca_notification_interval = intervalId;
  }, [isSupported, permission, isEnabled]);

  return {
    isSupported,
    permission,
    isEnabled,
    isSubscribed,
    isPWAStandalone,
    requestPermission,
    toggleNotifications,
    scheduleNotifications,
    showTestNotification,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
