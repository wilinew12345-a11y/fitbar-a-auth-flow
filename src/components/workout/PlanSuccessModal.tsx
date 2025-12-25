import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import confetti from 'canvas-confetti';

interface PlanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlanSuccessModal = ({
  isOpen,
  onClose,
}: PlanSuccessModalProps) => {
  const { language } = useLanguage();

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

  const translations = {
    he: {
      title: '🎉 מזל טוב!',
      subtitle: 'התוכנית שלך נשמרה בהצלחה. תוכל לנהל תזכורות וסנכרון בעמוד זה.',
      done: 'סיימתי',
    },
    en: {
      title: '🎉 Congratulations!',
      subtitle: 'Your plan has been saved successfully. You can manage reminders and sync on this page.',
      done: 'Done',
    },
    es: {
      title: '🎉 ¡Felicidades!',
      subtitle: 'Tu plan se ha guardado correctamente. Puedes gestionar recordatorios y sincronización en esta página.',
      done: 'Hecho',
    },
    ar: {
      title: '🎉 تهانينا!',
      subtitle: 'تم حفظ خطتك بنجاح. يمكنك إدارة التذكيرات والمزامنة في هذه الصفحة.',
      done: 'تم',
    },
  };

  const text = translations[language as keyof typeof translations] || translations.he;
  const isRtl = language === 'he' || language === 'ar';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-gradient-to-br from-[#004D98]/95 to-[#A50044]/95 backdrop-blur-xl border-white/20 text-white max-w-md mx-auto"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r from-[#FFED02] to-[#FFC107] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#004D98]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">{text.title}</DialogTitle>
          <DialogDescription className="text-white/80 text-lg">
            {text.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Done Button */}
          <Button
            onClick={onClose}
            className="w-full py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-[#FFED02] to-[#FFC107] text-[#004D98] hover:opacity-90 transition-opacity"
          >
            {text.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSuccessModal;
