import { useState, useEffect } from 'react';
import { Calendar, Bell, Info, Eye, CheckCircle2, Loader2, HelpCircle, Smartphone, Monitor } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { detectDeviceType, DeviceType } from '@/utils/calendarUtils';
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
    blockedMessage: 'ההתראות חסומות. כדי לקבל מוטיבציה, לחץ על סמל המנעול 🔒 בשורת הכתובת למעלה ואשר את ההתראות לאתר.',
    syncHelp: 'עזרה בסנכרון',
    iosHelpTitle: '📱 סנכרון ל-iPhone',
    iosHelpMessage: 'לחץ על הקובץ שהורד ואשר את ההוספה ללוח השנה. לחוויה הטובה ביותר, השתמש בדפדפן Safari.',
    androidHelpTitle: '📱 סנכרון ל-Android',
    androidHelpMessage: 'הקובץ יורד ויפתח אוטומטית ב-Google Calendar. אשר את ההוספה לחשבון שלך.',
    desktopHelpTitle: '💻 סנכרון למחשב',
    desktopHelpMessage: 'הקובץ יורד ותוכל לפתוח אותו עם כל יישום לוח שנה (Google Calendar, Outlook, Apple Calendar).',
    detectedDevice: 'זוהה מכשיר:',
    deviceIos: 'iPhone/iPad',
    deviceAndroid: 'Android',
    deviceDesktop: 'מחשב',
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
    blockedMessage: 'Notifications are blocked. To receive motivation, click the lock icon 🔒 in the address bar above and allow notifications for this site.',
    syncHelp: 'Sync Help',
    iosHelpTitle: '📱 iPhone Sync',
    iosHelpMessage: 'Tap the downloaded file and confirm adding to Calendar. For best experience, use Safari browser.',
    androidHelpTitle: '📱 Android Sync',
    androidHelpMessage: 'The file will download and open in Google Calendar. Confirm adding to your account.',
    desktopHelpTitle: '💻 Desktop Sync',
    desktopHelpMessage: 'The file will download and you can open it with any calendar app (Google Calendar, Outlook, Apple Calendar).',
    detectedDevice: 'Detected device:',
    deviceIos: 'iPhone/iPad',
    deviceAndroid: 'Android',
    deviceDesktop: 'Desktop',
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
    blockedMessage: 'Las notificaciones están bloqueadas. Para recibir motivación, haz clic en el icono del candado 🔒 en la barra de direcciones y permite las notificaciones para este sitio.',
    syncHelp: 'Ayuda de sincronización',
    iosHelpTitle: '📱 Sincronización iPhone',
    iosHelpMessage: 'Toca el archivo descargado y confirma añadirlo al Calendario. Para mejor experiencia, usa Safari.',
    androidHelpTitle: '📱 Sincronización Android',
    androidHelpMessage: 'El archivo se descargará y abrirá en Google Calendar. Confirma añadirlo a tu cuenta.',
    desktopHelpTitle: '💻 Sincronización Escritorio',
    desktopHelpMessage: 'El archivo se descargará y podrás abrirlo con cualquier app de calendario (Google Calendar, Outlook, Apple Calendar).',
    detectedDevice: 'Dispositivo detectado:',
    deviceIos: 'iPhone/iPad',
    deviceAndroid: 'Android',
    deviceDesktop: 'Escritorio',
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
    blockedMessage: 'الإشعارات محظورة. لتلقي التحفيز، انقر على أيقونة القفل 🔒 في شريط العناوين أعلاه واسمح بالإشعارات لهذا الموقع.',
    syncHelp: 'مساعدة المزامنة',
    iosHelpTitle: '📱 مزامنة iPhone',
    iosHelpMessage: 'انقر على الملف الذي تم تحميله وأكد الإضافة إلى التقويم. للحصول على أفضل تجربة، استخدم متصفح Safari.',
    androidHelpTitle: '📱 مزامنة Android',
    androidHelpMessage: 'سيتم تحميل الملف وفتحه في تقويم Google. أكد الإضافة إلى حسابك.',
    desktopHelpTitle: '💻 مزامنة سطح المكتب',
    desktopHelpMessage: 'سيتم تحميل الملف ويمكنك فتحه مع أي تطبيق تقويم (Google Calendar، Outlook، Apple Calendar).',
    detectedDevice: 'الجهاز المكتشف:',
    deviceIos: 'iPhone/iPad',
    deviceAndroid: 'Android',
    deviceDesktop: 'سطح المكتب',
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
    permission,
    isEnabled,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    toggleNotifications,
    showTestNotification,
  } = usePushNotifications();

  const [calendarDownloaded, setCalendarDownloaded] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showCalendarHelp, setShowCalendarHelp] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    setDeviceType(detectDeviceType());
  }, []);

  const text = translations[language as keyof typeof translations] || translations.he;
  const isLocked = schedules.length === 0;
  const isNotificationActive = isEnabled && isSubscribed;

  const getDeviceLabel = () => {
    switch (deviceType) {
      case 'ios': return text.deviceIos;
      case 'android': return text.deviceAndroid;
      default: return text.deviceDesktop;
    }
  };

  const getCalendarHelpContent = () => {
    switch (deviceType) {
      case 'ios':
        return { title: text.iosHelpTitle, message: text.iosHelpMessage };
      case 'android':
        return { title: text.androidHelpTitle, message: text.androidHelpMessage };
      default:
        return { title: text.desktopHelpTitle, message: text.desktopHelpMessage };
    }
  };

  const handleCalendarToggle = (checked: boolean) => {
    if (checked && !calendarDownloaded) {
      onDownloadCalendar();
      setCalendarDownloaded(true);
      setShowCalendarHelp(true);
    }
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    // If turning off
    if (!checked) {
      toggleNotifications(false);
      setShowHelpGuide(false);
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

  const calendarHelp = getCalendarHelpContent();

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
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-white font-medium">{text.calendarSync}</p>
                        <p className="text-white/60 text-sm">
                          {calendarDownloaded ? text.calendarDownloaded : text.calendarDesc}
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCalendarHelp(!showCalendarHelp);
                            }}
                          >
                            <HelpCircle className="h-4 w-4 text-white/60" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>{text.syncHelp}</p>
                        </TooltipContent>
                      </Tooltip>
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

            {/* Calendar Sync Help Guide */}
            {showCalendarHelp && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  {deviceType === 'desktop' ? (
                    <Monitor className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Smartphone className="h-5 w-5 text-blue-400" />
                  )}
                  <span className="text-white/70 text-xs">
                    {text.detectedDevice} <span className="text-blue-400 font-medium">{getDeviceLabel()}</span>
                  </span>
                </div>
                <p className="text-white font-medium text-sm">{calendarHelp.title}</p>
                <p className="text-white/80 text-sm leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
                  {calendarHelp.message}
                </p>
                {deviceType === 'ios' && (
                  <img
                    src="https://placehold.co/400x150/1a1a1a/ffffff?text=Safari+Calendar+Import+Guide"
                    alt="iOS Calendar guide"
                    className="w-full rounded-lg border border-blue-400/50"
                  />
                )}
                {deviceType === 'android' && (
                  <img
                    src="https://placehold.co/400x150/1a1a1a/ffffff?text=Google+Calendar+Import+Guide"
                    alt="Android Calendar guide"
                    className="w-full rounded-lg border border-blue-400/50"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalendarHelp(false)}
                  className="text-white/60 hover:text-white text-xs w-full"
                >
                  ✕
                </Button>
              </div>
            )}
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
                  src="https://placehold.co/400x200/1a1a1a/ffffff?text=Browser+Lock+Illustration+Here"
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
