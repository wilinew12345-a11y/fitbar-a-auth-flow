import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMotivationalMessage } from '@/services/motivationService';

interface NotificationPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  muscles: string;
}

const translations = {
  he: {
    title: 'תצוגה מקדימה',
    appName: 'FitBarça',
    close: 'סגור',
  },
  en: {
    title: 'Preview',
    appName: 'FitBarça',
    close: 'Close',
  },
  es: {
    title: 'Vista Previa',
    appName: 'FitBarça',
    close: 'Cerrar',
  },
  ar: {
    title: 'معاينة',
    appName: 'FitBarça',
    close: 'إغلاق',
  },
};

const NotificationPreview = ({ isOpen, onClose, muscles }: NotificationPreviewProps) => {
  const { language, isRtl } = useLanguage();
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const text = translations[language as keyof typeof translations] || translations.he;

  useEffect(() => {
    if (isOpen) {
      // Generate a random motivational message
      const motivationalMessage = getMotivationalMessage(
        muscles,
        language as 'he' | 'en' | 'es' | 'ar'
      );
      setMessage(motivationalMessage);

      // Animate in
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, muscles, language]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Notification Card */}
      <div
        className={`relative z-10 max-w-sm w-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl border border-white/20 overflow-hidden pointer-events-auto transform transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#004D98] to-[#A50044] flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{text.appName}</p>
              <p className="text-white/50 text-xs">{text.title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-white text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={handleClose}
            className="w-full py-2 bg-gradient-to-r from-[#FFED02] to-[#FFC107] text-[#004D98] font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreview;
