import { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Calendar,
  Trophy,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Challenge, ChallengeType } from '@/hooks/useChallengesSupabase';
import { useChallengeLogs } from '@/hooks/useChallengeLogs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SmartActivityLoggerProps {
  challenge: Challenge;
  onProgressUpdate?: () => void;
}

const UNIT_LABELS: Record<string, { short: string; singular: string; plural: string }> = {
  km: { short: 'ק"מ', singular: 'קילומטר', plural: 'קילומטרים' },
  kg: { short: 'ק"ג', singular: 'קילוגרם', plural: 'קילוגרמים' },
  liters: { short: 'ליטר', singular: 'ליטר', plural: 'ליטרים' },
  minutes: { short: 'דק\'', singular: 'דקה', plural: 'דקות' },
  hours: { short: 'שע\'', singular: 'שעה', plural: 'שעות' },
  reps: { short: 'חזרות', singular: 'חזרה', plural: 'חזרות' },
  sets: { short: 'סטים', singular: 'סט', plural: 'סטים' },
};

export const SmartActivityLogger = ({ challenge, onProgressUpdate }: SmartActivityLoggerProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    todaySum,
    totalSum,
    completedToday,
    addLog,
    isAdding,
  } = useChallengeLogs(challenge.id);

  const unitInfo = UNIT_LABELS[challenge.metricUnit || 'km'] || { short: challenge.metricUnit || '', singular: '', plural: '' };

  // Trigger confetti effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#eab308', '#3b82f6', '#ec4899'],
    });
  };

  // Handle success animation for habit
  useEffect(() => {
    if (completedToday && challenge.type === 'habit') {
      setShowSuccess(true);
    }
  }, [completedToday, challenge.type]);

  // Handle numeric progress submission
  const handleAddNumericProgress = () => {
    const value = parseFloat(inputValue);
    
    if (isNaN(value) || value <= 0) {
      toast.error('שגיאה', { description: 'יש להזין מספר חיובי' });
      return;
    }

    addLog(value);
    setInputValue('');
    triggerConfetti();
    toast.success('נוסף בהצלחה!', { 
      description: `${value} ${unitInfo.short} נוספו להתקדמות שלך` 
    });
    onProgressUpdate?.();
  };

  // Handle habit completion
  const handleCompleteHabit = () => {
    if (completedToday) {
      toast.info('כבר סימנת היום!', { description: 'נתראה מחר 💪' });
      return;
    }

    addLog(1);
    triggerConfetti();
    toast.success('כל הכבוד! 🎉', { description: 'המשך כך!' });
    onProgressUpdate?.();
  };

  // Calculate progress percentage
  const getProgressInfo = () => {
    if (challenge.type === 'numeric') {
      const target = challenge.targetValue || 0;
      const current = totalSum;
      const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
      const remaining = Math.max(0, target - current);
      return { current, target, percentage, remaining };
    }
    
    if (challenge.type === 'habit') {
      const target = challenge.durationDays || 30;
      const current = totalSum;
      const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
      const remaining = Math.max(0, target - current);
      return { current, target, percentage, remaining };
    }

    return { current: 0, target: 0, percentage: 0, remaining: 0 };
  };

  const progressInfo = getProgressInfo();

  // Render Numeric Type Logger
  if (challenge.type === 'numeric') {
    return (
      <div className="space-y-4" dir="rtl">
        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/40 rounded-2xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">התקדמות כוללת</h3>
              <p className="text-blue-300 text-sm">
                {progressInfo.current} / {progressInfo.target} {unitInfo.short}
              </p>
            </div>
            <div className="mr-auto">
              <span className="text-2xl font-bold text-green-400">{progressInfo.percentage}%</span>
            </div>
          </div>
          
          <Progress value={progressInfo.percentage} className="h-3 bg-blue-950/50" />
          
          {progressInfo.remaining > 0 && (
            <p className="text-sm text-blue-300/70 mt-2 text-center">
              נותרו עוד {progressInfo.remaining} {unitInfo.short} להשלמת היעד
            </p>
          )}
          
          {progressInfo.percentage >= 100 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">יעד הושג! 🎉</span>
            </div>
          )}
        </div>

        {/* Add Progress Input */}
        <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-700/50">
          <label className="text-sm text-blue-200 block mb-3">הוסף התקדמות</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                min={0}
                step="0.1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`לדוגמה: 5`}
                className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-green-400 focus:ring-green-400 text-lg pr-16"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNumericProgress()}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">
                {unitInfo.short}
              </span>
            </div>
            <Button
              onClick={handleAddNumericProgress}
              disabled={isAdding || !inputValue}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6"
            >
              <Plus className="w-5 h-5 ml-1" />
              הוסף
            </Button>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm">סיכום היום:</span>
          </div>
          <span className="text-white font-semibold">
            {todaySum} {unitInfo.short}
          </span>
        </div>
      </div>
    );
  }

  // Render Habit Type Logger
  if (challenge.type === 'habit') {
    return (
      <div className="space-y-4" dir="rtl">
        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-900/40 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-orange-500">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">רצף ימים</h3>
              <p className="text-orange-300 text-sm">
                {progressInfo.current} / {progressInfo.target} ימים
              </p>
            </div>
            <div className="mr-auto">
              <span className="text-2xl font-bold text-green-400">{progressInfo.percentage}%</span>
            </div>
          </div>
          
          <Progress value={progressInfo.percentage} className="h-3 bg-orange-950/50" />
          
          {progressInfo.remaining > 0 && (
            <p className="text-sm text-orange-300/70 mt-2 text-center">
              נותרו עוד {progressInfo.remaining} ימים להשלמת האתגר
            </p>
          )}
          
          {progressInfo.percentage >= 100 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">האתגר הושלם! 🎉</span>
            </div>
          )}
        </div>

        {/* Daily Check-in Button */}
        <div
          className={cn(
            "rounded-2xl p-6 border-2 transition-all",
            completedToday
              ? "bg-green-900/30 border-green-500/50"
              : "bg-blue-900/40 border-blue-700/50 hover:border-green-500/50"
          )}
        >
          {completedToday ? (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">סימנת להיום! ✓</h3>
              <p className="text-green-300/70 text-sm">המשך כך, נתראה מחר!</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">רצף של {progressInfo.current} ימים</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          ) : (
            // Action State
            <div className="text-center">
              <Button
                onClick={handleCompleteHabit}
                disabled={isAdding}
                className={cn(
                  "w-full h-16 text-xl font-bold rounded-xl transition-all",
                  "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400",
                  "shadow-lg shadow-green-900/40 hover:shadow-green-500/30",
                  "text-white"
                )}
              >
                <Check className="w-6 h-6 ml-2" />
                סמן כהושלם להיום
              </Button>
              <p className="text-blue-300/70 text-sm mt-3">
                לחץ כדי לסמן שעמדת באתגר היום
              </p>
            </div>
          )}
        </div>

        {/* Motivational Message */}
        {!completedToday && progressInfo.current > 0 && (
          <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700/30 text-center">
            <p className="text-white/80 text-sm italic">
              "כבר עברת {progressInfo.current} ימים - אל תשבור את הרצף!"
            </p>
          </div>
        )}
      </div>
    );
  }

  // Standard type returns null - handled by existing workout list UI
  return null;
};
