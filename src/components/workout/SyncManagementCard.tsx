import { useState, useEffect } from 'react';
import { Calendar, Bell, Info, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { detectDeviceType, DeviceType, openCalendarSubscription } from '@/utils/calendarUtils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import NotificationPreview from './NotificationPreview';
import browserPermissionGuide from '@/assets/browser-permission-guide.png';

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
    calendarSynced: 'לוח השנה מסונכרן!',
    calendarSyncing: 'מתחבר ללוח השנה...',
    aiNotifications: 'התראות מוטיבציה AI',
    aiNotificationsDesc: 'קבל הודעות מעוררות השראה',
    seeExample: 'ראה דוגמה',
    enabled: 'פעיל',
    disabled: 'כבוי',
    lockedTooltip: 'יש להשלים את בחירת הימים והשרירים כדי לפתוח אפשרויות אלו',
    aiInfoTooltip: 'ההודעות מותאמות אישית לקבוצות השרירים שבחרת',
    enabling: 'מפעיל...',
    blockedMessage: 'ההתראות חסומות. כדי לקבל מוטיבציה, לחץ על סמל המנעול 🔒 בשורת הכתובת למעלה ואשר את ההתראות לאתר.',
    installPWA: 'להפעלת התראות, יש להתקין את האפליקציה על מסך הבית',
    installPWATitle: 'התקן את האפליקציה',
  },
  en: {
    title: 'Reminders & Sync Management',
    calendarSync: 'Calendar Sync',
    calendarDesc: 'Add workouts to your calendar',
    calendarSynced: 'Calendar synced!',
    calendarSyncing: 'Connecting to calendar...',
    aiNotifications: 'AI Motivation Alerts',
    aiNotificationsDesc: 'Get inspiring messages',
    seeExample: 'See Example',
    enabled: 'Enabled',
    disabled: 'Disabled',
    lockedTooltip: 'Complete day and muscle selection to unlock these options',
    aiInfoTooltip: 'Messages are personalized based on your selected muscle groups',
    enabling: 'Enabling...',
    blockedMessage: 'Notifications are blocked. To receive motivation, click the lock icon 🔒 in the address bar above and allow notifications for this site.',
    installPWA: 'To enable notifications, install the app to your home screen',
    installPWATitle: 'Install the app',
  },
  es: {
    title: 'Gestión de Recordatorios',
    calendarSync: 'Sincronizar Calendario',
    calendarDesc: 'Añade los entrenamientos al calendario',
    calendarSynced: '¡Calendario sincronizado!',
    calendarSyncing: 'Conectando al calendario...',
    aiNotifications: 'Alertas de Motivación IA',
    aiNotificationsDesc: 'Recibe mensajes inspiradores',
    seeExample: 'Ver Ejemplo',
    enabled: 'Activo',
    disabled: 'Inactivo',
    lockedTooltip: 'Completa la selección de días y músculos para desbloquear estas opciones',
    aiInfoTooltip: 'Los mensajes están personalizados según los grupos musculares seleccionados',
    enabling: 'Activando...',
    blockedMessage: 'Las notificaciones están bloqueadas. Para recibir motivación, haz clic en el icono del candado 🔒 en la barra de direcciones y permite las notificaciones para este sitio.',
    installPWA: 'Para activar notificaciones, instala la app en tu pantalla de inicio',
    installPWATitle: 'Instalar la app',
  },
  ar: {
    title: 'إدارة التذكيرات والمزامنة',
    calendarSync: 'مزامنة التقويم',
    calendarDesc: 'أضف التدريبات إلى تقويمك',
    calendarSynced: 'تم مزامنة التقويم!',
    calendarSyncing: 'جاري الاتصال بالتقويم...',
    aiNotifications: 'تنبيهات التحفيز بالذكاء الاصطناعي',
    aiNotificationsDesc: 'احصل على رسائل ملهمة',
    seeExample: 'عرض مثال',
    enabled: 'مفعل',
    disabled: 'معطل',
    lockedTooltip: 'أكمل اختيار الأيام والعضلات لفتح هذه الخيارات',
    aiInfoTooltip: 'الرسائل مخصصة بناءً على مجموعات العضلات المختارة',
    enabling: 'جاري التفعيل...',
    blockedMessage: 'الإشعارات محظورة. لتلقي التحفيز، انقر على أيقونة القفل 🔒 في شريط العناوين أعلاه واسمح بالإشعارات لهذا الموقع.',
    installPWA: 'لتفعيل الإشعارات، قم بتثبيت التطبيق على الشاشة الرئيسية',
    installPWATitle: 'تثبيت التطبيق',
  },
};

const SyncManagementCard = ({
  schedules,
  getMuscleLabels,
}: SyncManagementCardProps) => {
  const { language, isRtl } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isSupported,
    permission,
    isEnabled,
    isSubscribed,
    isPWAStandalone,
    requestPermission,
    subscribeToPush,
    toggleNotifications,
    showTestNotification,
  } = usePushNotifications();

  const [calendarSynced, setCalendarSynced] = useState(false);
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    setDeviceType(detectDeviceType());
  }, []);

  const text = translations[language as keyof typeof translations] || translations.he;
  const isLocked = schedules.length === 0;
  const isNotificationActive = isEnabled && isSubscribed;

  const handleCalendarToggle = async (checked: boolean) => {
    if (!checked || calendarSynced || !user) return;

    setIsCalendarSyncing(true);
    
    try {
      // Open the appropriate calendar subscription based on device
      openCalendarSubscription(user.id, deviceType);
      setCalendarSynced(true);
      
      toast({
        title: text.calendarSynced,
        description: deviceType === 'ios' 
          ? 'בחר "הירשם" בחלונית שתיפתח'
          : 'אשר את ההוספה לחשבון Google',
      });
    } catch (error) {
      console.error('Calendar sync error:', error);
    } finally {
      setIsCalendarSyncing(false);
    }
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    // If turning off
    if (!checked) {
      toggleNotifications(false);
      setShowHelpGuide(false);
      return;
    }

    // Check if mobile and not in PWA mode
    if (deviceType !== 'desktop' && !isPWAStandalone) {
      toast({
        title: text.installPWATitle,
        description: text.installPWA,
      });
      return;
    }

    // If turning on - check permission status
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      
      // Permission is denied - show help guide
      if (currentPermission === 'denied') {
        setShowHelpGuide(true);
        return;
      }

      setIsEnablingNotifications(true);
      setShowHelpGuide(false);
      
      try {
        // Permission is default - request it
        if (currentPermission === 'default') {
          const granted = await requestPermission();
          if (!granted) {
            // User denied - check if now denied
            if (Notification.permission === 'denied') {
              setShowHelpGuide(true);
            }
            setIsEnablingNotifications(false);
            return;
          }
        }

        // Permission is granted - subscribe to push
        const subscribed = await subscribeToPush();
        if (subscribed && schedules.length > 0) {
          const muscles = getMuscleLabels(schedules[0].workout_types);
          setTimeout(() => {
            showTestNotification(muscles, language as Language);
          }, 500);
        }
      } catch (error) {
        console.error('Error enabling notifications:', error);
      } finally {
        setIsEnablingNotifications(false);
      }
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
          <div className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    isLocked
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : calendarSynced
                      ? 'bg-green-500/20 border-green-500/30'
                      : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {calendarSynced ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : isCalendarSyncing ? (
                      <Loader2 className="h-5 w-5 text-white/80 animate-spin" />
                    ) : (
                      <Calendar className="h-5 w-5 text-white/80" />
                    )}
                    <div>
                      <p className="text-white font-medium">{text.calendarSync}</p>
                      <p className="text-white/60 text-sm">
                        {isCalendarSyncing 
                          ? text.calendarSyncing 
                          : calendarSynced 
                          ? text.calendarSynced 
                          : text.calendarDesc}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={calendarSynced}
                    onCheckedChange={handleCalendarToggle}
                    disabled={isLocked || calendarSynced || isCalendarSyncing}
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
          </div>

          {/* AI Notifications Toggle */}
          <div className="space-y-3">
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
                    disabled={isLocked || !isSupported || isEnablingNotifications}
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

            {/* Permission Blocked Help Guide */}
            {showHelpGuide && (
              <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/50 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <p className="text-white/90 text-sm leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
                  {text.blockedMessage}
                </p>
                <img
                  src={browserPermissionGuide}
                  alt="Browser permission guide"
                  className="w-full rounded-lg border-2 border-red-400"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpGuide(false)}
                  className="text-white/60 hover:text-white text-xs w-full"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

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
