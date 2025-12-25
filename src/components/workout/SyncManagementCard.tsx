import { useState } from 'react';
import { Calendar, Bell, Info, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import NotificationPreview from './NotificationPreview';

interface Schedule {
  id: string;
  day_of_week: string;
  workout_types: string[];
  workout_time: string | null;
}

interface SyncManagementCardProps {
  schedules: Schedule[];
  getMuscleLabels: (muscleKeys: string[]) => string;
  onDownloadCalendar: () => void;
}

const translations = {
  he: {
    title: 'ניהול תזכורות וסנכרון',
    calendarSync: 'סנכרון לוח שנה',
    calendarDesc: 'הוסף את האימונים ללוח השנה',
    aiNotifications: 'התראות מוטיבציה AI',
    aiNotificationsDesc: 'קבל הודעות מעוררות השראה',
    seeExample: 'ראה דוגמה',
    enabled: 'פעיל',
    disabled: 'כבוי',
    lockedTooltip: 'יש להשלים את בחירת הימים והשרירים כדי לפתוח אפשרויות אלו',
    aiInfoTooltip: 'ההודעות מותאמות אישית לקבוצות השרירים שבחרת',
    calendarDownloaded: 'לוח השנה הורד!',
    enabling: 'מפעיל...',
  },
  en: {
    title: 'Reminders & Sync Management',
    calendarSync: 'Calendar Sync',
    calendarDesc: 'Add workouts to your calendar',
    aiNotifications: 'AI Motivation Alerts',
    aiNotificationsDesc: 'Get inspiring messages',
    seeExample: 'See Example',
    enabled: 'Enabled',
    disabled: 'Disabled',
    lockedTooltip: 'Complete day and muscle selection to unlock these options',
    aiInfoTooltip: 'Messages are personalized based on your selected muscle groups',
    calendarDownloaded: 'Calendar downloaded!',
    enabling: 'Enabling...',
  },
  es: {
    title: 'Gestión de Recordatorios',
    calendarSync: 'Sincronizar Calendario',
    calendarDesc: 'Añade los entrenamientos al calendario',
    aiNotifications: 'Alertas de Motivación IA',
    aiNotificationsDesc: 'Recibe mensajes inspiradores',
    seeExample: 'Ver Ejemplo',
    enabled: 'Activo',
    disabled: 'Inactivo',
    lockedTooltip: 'Completa la selección de días y músculos para desbloquear estas opciones',
    aiInfoTooltip: 'Los mensajes están personalizados según los grupos musculares seleccionados',
    calendarDownloaded: '¡Calendario descargado!',
    enabling: 'Activando...',
  },
  ar: {
    title: 'إدارة التذكيرات والمزامنة',
    calendarSync: 'مزامنة التقويم',
    calendarDesc: 'أضف التدريبات إلى تقويمك',
    aiNotifications: 'تنبيهات التحفيز بالذكاء الاصطناعي',
    aiNotificationsDesc: 'احصل على رسائل ملهمة',
    seeExample: 'عرض مثال',
    enabled: 'مفعل',
    disabled: 'معطل',
    lockedTooltip: 'أكمل اختيار الأيام والعضلات لفتح هذه الخيارات',
    aiInfoTooltip: 'الرسائل مخصصة بناءً على مجموعات العضلات المختارة',
    calendarDownloaded: 'تم تحميل التقويم!',
    enabling: 'جاري التفعيل...',
  },
};

const SyncManagementCard = ({
  schedules,
  getMuscleLabels,
  onDownloadCalendar,
}: SyncManagementCardProps) => {
  const { language, isRtl } = useLanguage();
  const {
    isSupported,
    isEnabled,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    showTestNotification,
  } = usePushNotifications();

  const [calendarDownloaded, setCalendarDownloaded] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const text = translations[language as keyof typeof translations] || translations.he;
  const isLocked = schedules.length === 0;
  const isNotificationActive = isEnabled || isSubscribed;

  const handleCalendarToggle = (checked: boolean) => {
    if (checked && !calendarDownloaded) {
      onDownloadCalendar();
      setCalendarDownloaded(true);
    }
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    if (!checked || isNotificationActive) return;

    setIsEnablingNotifications(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        const subscribed = await subscribeToPush();
        if (subscribed && schedules.length > 0) {
          const muscles = getMuscleLabels(schedules[0].workout_types);
          setTimeout(() => {
            showTestNotification(muscles, language as Language);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsEnablingNotifications(false);
    }
  };

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const getPreviewMuscles = () => {
    if (schedules.length > 0) {
      return getMuscleLabels(schedules[0].workout_types);
    }
    return text.aiNotifications;
  };

  return (
    <TooltipProvider>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h2 className="text-white text-xl font-bold mb-6 text-center">{text.title}</h2>

        <div className="space-y-4">
          {/* Calendar Sync Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isLocked
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                    : calendarDownloaded
                    ? 'bg-green-500/20 border-green-500/30'
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  {calendarDownloaded ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <Calendar className="h-5 w-5 text-white/80" />
                  )}
                  <div>
                    <p className="text-white font-medium">{text.calendarSync}</p>
                    <p className="text-white/60 text-sm">
                      {calendarDownloaded ? text.calendarDownloaded : text.calendarDesc}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={calendarDownloaded}
                  onCheckedChange={handleCalendarToggle}
                  disabled={isLocked || calendarDownloaded}
                  className="data-[state=checked]:bg-[hsl(45,100%,50%)]"
                />
              </div>
            </TooltipTrigger>
            {isLocked && (
              <TooltipContent side={isRtl ? 'left' : 'right'} className="max-w-xs">
                <p>{text.lockedTooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* AI Notifications Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isLocked
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                    : isNotificationActive
                    ? 'bg-green-500/20 border-green-500/30'
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isNotificationActive ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : isEnablingNotifications ? (
                    <Loader2 className="h-5 w-5 text-white/80 animate-spin" />
                  ) : (
                    <Bell className="h-5 w-5 text-white/80" />
                  )}
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-white font-medium">{text.aiNotifications}</p>
                      <p className="text-white/60 text-sm">
                        {isEnablingNotifications ? text.enabling : text.aiNotificationsDesc}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                          <Info className="h-4 w-4 text-white/60" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>{text.aiInfoTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <Switch
                  checked={isNotificationActive}
                  onCheckedChange={handleNotificationsToggle}
                  disabled={isLocked || !isSupported || isNotificationActive || isEnablingNotifications}
                  className="data-[state=checked]:bg-[hsl(45,100%,50%)]"
                />
              </div>
            </TooltipTrigger>
            {isLocked && (
              <TooltipContent side={isRtl ? 'left' : 'right'} className="max-w-xs">
                <p>{text.lockedTooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* See Example Button */}
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              onClick={handleShowPreview}
              disabled={isLocked}
              className={`text-[hsl(45,100%,50%)] hover:text-[hsl(45,100%,60%)] hover:bg-white/10 ${
                isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Eye className="h-4 w-4 mx-2" />
              {text.seeExample}
            </Button>
          </div>
        </div>

        {/* Notification Preview Modal */}
        <NotificationPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          muscles={getPreviewMuscles()}
        />
      </div>
    </TooltipProvider>
  );
};

export default SyncManagementCard;
