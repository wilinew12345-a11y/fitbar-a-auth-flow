import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuotaLimitModal = ({ isOpen, onClose }: QuotaLimitModalProps) => {
  const { isRtl } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-gradient-to-br from-[#0a1628]/95 via-[#061E40]/95 to-[#0a1628]/95 backdrop-blur-xl border border-white/20 text-white max-w-md mx-auto"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="space-y-4 text-center pt-4">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#A50044]/30 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#A50044] to-[#cc0055] p-4 rounded-full shadow-2xl">
                <Bot className="h-10 w-10 text-white animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5 shadow-lg">
                <Clock className="h-4 w-4 text-[#0a1628]" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-white">
            המכסה היומית הסתיימה
          </DialogTitle>
          
          <DialogDescription className="text-white/80 text-base leading-relaxed px-4">
            ניצלת את כל 20 הפניות שלך להיום. המאמן האישי שלך נח עכשיו ויחזור רענן מחר בבוקר!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 pb-2">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#A50044] to-[#cc0055] hover:from-[#cc0055] hover:to-[#A50044] text-white font-semibold py-6 text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            הבנתי, תודה
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#004d98]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#A50044]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </DialogContent>
    </Dialog>
  );
};

export default QuotaLimitModal;
