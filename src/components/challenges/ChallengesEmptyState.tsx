import { Rocket, Target, Salad, Flame, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChallengesEmptyStateProps {
  onCreateChallenge: () => void;
}

export const ChallengesEmptyState = ({ onCreateChallenge }: ChallengesEmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4" dir="rtl">
      <div className="w-full max-w-lg bg-blue-900/20 backdrop-blur-xl border border-blue-800/50 rounded-3xl p-8 text-center shadow-2xl">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Rocket className="w-12 h-12 text-white animate-bounce" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-white mb-4">
          לקחת את הכושר לשלב הבא 🚀
        </h2>

        {/* Subtext */}
        <p className="text-blue-200 mb-6 leading-relaxed">
          אזור האתגרים הוא המקום שלך להציב יעדים ולשבור שיאים חדשים. המערכת החדשה מאפשרת לך:
        </p>

        {/* Feature List */}
        <div className="space-y-4 mb-8 text-right">
          <div className="flex items-start gap-3 bg-blue-800/20 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-blue-600/30 shrink-0">
              <Target className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <span className="text-yellow-400 font-semibold">להגדיר יעדים מדידים:</span>
              <span className="text-blue-100 mr-1">כמו ריצת 50 ק"מ או הרמת משקל יעד.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-800/20 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-green-600/30 shrink-0">
              <Salad className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <span className="text-yellow-400 font-semibold">לבנות הרגלים בריאים:</span>
              <span className="text-blue-100 mr-1">מעקב יומי אחרי תזונה, שינה ומים.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-800/20 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-orange-600/30 shrink-0">
              <Flame className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <span className="text-yellow-400 font-semibold">לשמור על עקביות:</span>
              <span className="text-blue-100 mr-1">מעקב ויזואלי אחר רצף האימונים שלך.</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onCreateChallenge}
          size="lg"
          className="w-full bg-[#A50044] hover:bg-red-800 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5 ml-2" />
          צור את האתגר הראשון שלך
        </Button>
      </div>
    </div>
  );
};
