import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import confetti from 'canvas-confetti';

interface Schedule {
  id: string;
  day_of_week: string;
  workout_types: string[];
  workout_time: string | null;
}

interface PlanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: Schedule[];
  onDownloadCalendar: () => void;
  getMuscleLabels: (muscleKeys: string[]) => string;
}

const PlanSuccessModal = ({
  isOpen,
  onClose,
  schedules,
  onDownloadCalendar,
  getMuscleLabels,
}: PlanSuccessModalProps) => {
  const { t, language } = useLanguage();
  const { isSupported, permission, requestPermission, showTestNotification, isEnabled } = usePushNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#004D98', '#A50044', '#FFED02'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#004D98', '#A50044', '#FFED02'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setNotificationsEnabled(true);
      // Show a test notification with first workout's muscles
      if (schedules.length > 0) {
        const muscles = getMuscleLabels(schedules[0].workout_types);
        showTestNotification(muscles, language as 'he' | 'en' | 'es' | 'ar');
      }
    }
  };

  const handleDownloadCalendar = () => {
    onDownloadCalendar();
    setCalendarDownloaded(true);
  };

  const translations = {
    he: {
      title: '🎉 מזל טוב!',
      subtitle: 'התוכנית שלך נשמרה בהצלחה',
      syncCalendar: 'סנכרן ללוח השנה',
      enableReminders: 'הפעל תזכורות מוטיבציה',
      done: 'סיימתי',
      calendarSynced: 'לוח השנה הורד!',
      remindersEnabled: 'התזכורות הופעלו!',
      notSupported: 'התראות לא נתמכות בדפדפן זה',
    },
    en: {
      title: '🎉 Congratulations!',
      subtitle: 'Your plan has been saved successfully',
      syncCalendar: 'Sync to Calendar',
      enableReminders: 'Enable Motivation Reminders',
      done: 'Done',
      calendarSynced: 'Calendar downloaded!',
      remindersEnabled: 'Reminders enabled!',
      notSupported: 'Notifications not supported in this browser',
    },
    es: {
      title: '🎉 ¡Felicidades!',
      subtitle: 'Tu plan se ha guardado correctamente',
      syncCalendar: 'Sincronizar con Calendario',
      enableReminders: 'Activar Recordatorios de Motivación',
      done: 'Hecho',
      calendarSynced: '¡Calendario descargado!',
      remindersEnabled: '¡Recordatorios activados!',
      notSupported: 'Notificaciones no soportadas en este navegador',
    },
    ar: {
      title: '🎉 تهانينا!',
      subtitle: 'تم حفظ خطتك بنجاح',
      syncCalendar: 'مزامنة مع التقويم',
      enableReminders: 'تفعيل تذكيرات التحفيز',
      done: 'تم',
      calendarSynced: 'تم تحميل التقويم!',
      remindersEnabled: 'تم تفعيل التذكيرات!',
      notSupported: 'الإشعارات غير مدعومة في هذا المتصفح',
    },
  };

  const text = translations[language as keyof typeof translations] || translations.he;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#004D98]/95 to-[#A50044]/95 backdrop-blur-xl border-white/20 text-white max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r from-[#FFED02] to-[#FFC107] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#004D98]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">{text.title}</DialogTitle>
          <DialogDescription className="text-white/80 text-lg">
            {text.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Calendar Sync Button */}
          <Button
            onClick={handleDownloadCalendar}
            className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
              calendarDownloaded
                ? 'bg-green-500/80 hover:bg-green-500/90'
                : 'bg-white/20 hover:bg-white/30 border border-white/30'
            }`}
            disabled={calendarDownloaded}
          >
            {calendarDownloaded ? (
              <>
                <CheckCircle2 className="w-5 h-5 ml-2" />
                {text.calendarSynced}
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 ml-2" />
                {text.syncCalendar}
              </>
            )}
          </Button>

          {/* Notifications Button */}
          {isSupported ? (
            <Button
              onClick={handleEnableNotifications}
              className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                notificationsEnabled || isEnabled
                  ? 'bg-green-500/80 hover:bg-green-500/90'
                  : 'bg-white/20 hover:bg-white/30 border border-white/30'
              }`}
              disabled={notificationsEnabled || isEnabled}
            >
              {notificationsEnabled || isEnabled ? (
                <>
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                  {text.remindersEnabled}
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5 ml-2" />
                  {text.enableReminders}
                </>
              )}
            </Button>
          ) : (
            <div className="text-center text-white/60 text-sm py-2">
              {text.notSupported}
            </div>
          )}

          {/* Done Button */}
          <Button
            onClick={onClose}
            className="w-full py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-[#FFED02] to-[#FFC107] text-[#004D98] hover:opacity-90 transition-opacity mt-4"
          >
            {text.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSuccessModal;
