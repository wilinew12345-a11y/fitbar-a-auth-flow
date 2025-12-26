import { useState, useEffect } from 'react';
import { Calendar, Bell, Info, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { detectDeviceType, DeviceType, openCalendarSubscription } from '@/utils/calendarUtils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  onResetAll?: () => Promise<void>;
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
    resetWarningTitle: 'האם אתה בטוח?',
    resetWarningMessage: 'פעולה זו תמחק את התוכנית, תסיר את האימונים מלוח השנה ותבטל את התראות המוטיבציה.',
    resetConfirm: 'אפס הכל',
    resetCancel: 'ביטול',
    syncDisabled: 'הסנכרון בוטל',
    notificationsDisabled: 'ההתראות בוטלו',
    saveFailed: 'שמירה נכשלה',
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
    resetWarningTitle: 'Are you sure?',
    resetWarningMessage: 'This action will delete your plan, remove workouts from your calendar, and disable motivation alerts.',
    resetConfirm: 'Reset All',
    resetCancel: 'Cancel',
    syncDisabled: 'Sync disabled',
    notificationsDisabled: 'Notifications disabled',
    saveFailed: 'Save failed',
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
    resetWarningTitle: '¿Estás seguro?',
    resetWarningMessage: 'Esta acción eliminará tu plan, quitará los entrenamientos del calendario y desactivará las alertas de motivación.',
    resetConfirm: 'Restablecer todo',
    resetCancel: 'Cancelar',
    syncDisabled: 'Sincronización desactivada',
    notificationsDisabled: 'Notificaciones desactivadas',
    saveFailed: 'Error al guardar',
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
    resetWarningTitle: 'هل أنت متأكد؟',
    resetWarningMessage: 'سيؤدي هذا الإجراء إلى حذف خطتك وإزالة التدريبات من التقويم وإلغاء تنبيهات التحفيز.',
    resetConfirm: 'إعادة تعيين الكل',
    resetCancel: 'إلغاء',
    syncDisabled: 'تم تعطيل المزامنة',
    notificationsDisabled: 'تم تعطيل الإشعارات',
    saveFailed: 'فشل الحفظ',
  },
};

const SyncManagementCard = ({
  schedules,
  getMuscleLabels,
  onResetAll,
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
    unsubscribeFromPush,
  } = usePushNotifications();

  const [calendarSynced, setCalendarSynced] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isCalendarSyncing, setIsCalendarSyncing] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted states from DB on mount or when user changes
  useEffect(() => {
    const loadPersistedState = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('calendar_sync_enabled, notifications_enabled')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading sync state:', error);
        } else if (data) {
          setCalendarSynced(data.calendar_sync_enabled || false);
          setNotificationsEnabled(data.notifications_enabled || false);
        }
      } catch (err) {
        console.error('Failed to load sync state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();
    setDeviceType(detectDeviceType());
  }, [user?.id]);

  const text = translations[language as keyof typeof translations] || translations.he;
  const isLocked = schedules.length === 0;
  const isNotificationActive = notificationsEnabled && isEnabled && isSubscribed;

  // Update DB helper
  const updateProfileSettings = async (updates: { calendar_sync_enabled?: boolean; notifications_enabled?: boolean }) => {
    if (!user) return false;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: text.saveFailed,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleCalendarToggle = async (checked: boolean) => {
    if (!user) return;

    // Turning OFF calendar sync
    if (!checked) {
      const success = await updateProfileSettings({ calendar_sync_enabled: false });
      if (success) {
        setCalendarSynced(false);
        toast({
          title: text.syncDisabled,
        });
      }
      return;
    }

    // Turning ON - open calendar subscription
    setIsCalendarSyncing(true);
    
    try {
      openCalendarSubscription(user.id, deviceType);
      
      const success = await updateProfileSettings({ calendar_sync_enabled: true });
      if (success) {
        setCalendarSynced(true);
        toast({
        title: text.calendarSynced,
        description: deviceType === 'ios' 
          ? 'בחר "הירשם" בחלונית שתיפתח. אם יש כפילויות, כבה והפעל מחדש.'
          : 'אשר את ההוספה לחשבון Google. אם יש כפילויות, כבה והפעל מחדש.',
      });
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
    } finally {
      setIsCalendarSyncing(false);
    }
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    if (!user) return;

    // If turning off
    if (!checked) {
      await unsubscribeFromPush?.();
      toggleNotifications(false);
      setShowHelpGuide(false);
      
      const success = await updateProfileSettings({ notifications_enabled: false });
      if (success) {
        setNotificationsEnabled(false);
        toast({
          title: text.notificationsDisabled,
        });
      }
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
        if (subscribed) {
          const success = await updateProfileSettings({ notifications_enabled: true });
          if (success) {
            setNotificationsEnabled(true);
            toast({
              title: language === 'he' ? 'התראות הופעלו' : 'Notifications enabled',
              description: language === 'he' 
                ? 'תקבל תזכורת 60 דקות לפני כל אימון' 
                : 'You will receive a reminder 60 minutes before each workout',
            });
          }
        }
      } catch (error) {
        console.error('Error enabling notifications:', error);
      } finally {
        setIsEnablingNotifications(false);
      }
    }
  };

  const handleResetAllRequest = () => {
    setShowResetDialog(true);
  };

  const handleResetConfirm = async () => {
    if (!user || !onResetAll) return;

    setIsResetting(true);
    try {
      // First disable integrations in DB
      await updateProfileSettings({ 
        calendar_sync_enabled: false, 
        notifications_enabled: false 
      });

      // Unsubscribe from push
      await unsubscribeFromPush?.();
      toggleNotifications(false);

      // Reset local state
      setCalendarSynced(false);
      setNotificationsEnabled(false);

      // Call parent reset function
      await onResetAll();
    } catch (error) {
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
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

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-white/60 animate-spin" />
        </div>
      </div>
    );
  }

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
                    disabled={isLocked || isCalendarSyncing}
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

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">{text.resetWarningTitle}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {text.resetWarningMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className={isRtl ? 'flex-row-reverse' : ''}>
              <AlertDialogCancel disabled={isResetting}>
                {text.resetCancel}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetConfirm}
                disabled={isResetting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-2" />
                ) : null}
                {text.resetConfirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

// Export the reset trigger for parent components
export { SyncManagementCard };
export default SyncManagementCard;
