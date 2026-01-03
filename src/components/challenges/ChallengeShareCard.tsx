import { forwardRef } from 'react';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import { Progress } from '@/components/ui/progress';
import { Trophy, Dumbbell, Target, Zap, Heart, Star, Timer, Flame, Droplets, TrendingUp, Calendar } from 'lucide-react';
import { ChallengeType } from '@/hooks/useChallengesSupabase';

interface Workout {
  id: string;
  text: string;
  completed: boolean;
}

interface ChallengeShareCardProps {
  title: string;
  type?: ChallengeType;
  progress: { completed: number; total: number; percentage: number };
  workouts: Workout[];
  targetPerWeek: number;
  colorTheme?: string;
  icon?: string;
  // Numeric type props
  currentValue?: number;
  targetValue?: number;
  metricUnit?: string;
  // Habit type props
  durationDays?: number;
}

const COLOR_GRADIENTS: Record<string, string> = {
  blue: 'linear-gradient(180deg, #004D98 0%, #061E40 100%)',
  red: 'linear-gradient(180deg, #A50044 0%, #3D0018 100%)',
  green: 'linear-gradient(180deg, #059669 0%, #064E3B 100%)',
  purple: 'linear-gradient(180deg, #7C3AED 0%, #312E81 100%)',
  orange: 'linear-gradient(180deg, #EA580C 0%, #7C2D12 100%)',
  pink: 'linear-gradient(180deg, #EC4899 0%, #831843 100%)',
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  target: Target,
  zap: Zap,
  trophy: Trophy,
  heart: Heart,
  star: Star,
  timer: Timer,
  flame: Flame,
  droplets: Droplets,
};

const UNIT_LABELS: Record<string, { short: string; full: string }> = {
  km: { short: 'ק"מ', full: 'קילומטרים שבוצעו' },
  kg: { short: 'ק"ג', full: 'קילוגרמים הורמו' },
  liters: { short: 'ליטר', full: 'ליטרים נשתו' },
  minutes: { short: 'דק\'', full: 'דקות הושלמו' },
  hours: { short: 'שע\'', full: 'שעות הושלמו' },
  reps: { short: 'חזרות', full: 'חזרות בוצעו' },
  sets: { short: 'סטים', full: 'סטים הושלמו' },
};

const MOTIVATIONAL_QUOTES = [
  'כל צעד מקרב אותך ליעד! 💪',
  'אתה יותר חזק ממה שאתה חושב!',
  'ההצלחה נמצאת בדרך, לא רק ביעד',
  'המשך לדחוף - אתה עושה עבודה מדהימה!',
];

export const ChallengeShareCard = forwardRef<HTMLDivElement, ChallengeShareCardProps>(
  ({ 
    title, 
    type = 'standard',
    progress, 
    workouts, 
    targetPerWeek, 
    colorTheme = 'blue', 
    icon = 'dumbbell',
    currentValue = 0,
    targetValue = 0,
    metricUnit = 'km',
    durationDays = 30,
  }, ref) => {
    const gradient = COLOR_GRADIENTS[colorTheme] || COLOR_GRADIENTS.blue;
    const IconComponent = ICONS[icon] || Dumbbell;
    const unitInfo = UNIT_LABELS[metricUnit] || { short: metricUnit, full: `${metricUnit} הושלמו` };

    // Calculate type-specific progress
    const getDisplayData = () => {
      if (type === 'numeric') {
        const percentage = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;
        const remaining = Math.max(0, targetValue - currentValue);
        return {
          percentage: Math.min(percentage, 100),
          circleText: `${currentValue}`,
          circleSubtext: unitInfo.short,
          statsText: `${currentValue} / ${targetValue}`,
          statsLabel: unitInfo.full,
          remainingText: `נותרו: ${remaining} ${unitInfo.short}`,
        };
      }
      
      if (type === 'habit') {
        const daysCompleted = currentValue;
        const percentage = durationDays > 0 ? Math.round((daysCompleted / durationDays) * 100) : 0;
        const remainingDays = Math.max(0, durationDays - daysCompleted);
        return {
          percentage: Math.min(percentage, 100),
          circleText: `${daysCompleted}`,
          circleSubtext: 'ימים',
          statsText: `${daysCompleted} / ${durationDays}`,
          statsLabel: 'ימי רצף',
          remainingText: `נותרו: ${remainingDays} ימים`,
        };
      }
      
      // Standard type
      const currentWeek = Math.floor(progress.completed / targetPerWeek) + 1;
      return {
        percentage: progress.percentage,
        circleText: `${progress.percentage}%`,
        circleSubtext: '',
        statsText: `${progress.completed} / ${progress.total}`,
        statsLabel: 'אימונים הושלמו',
        weekText: `שבוע ${currentWeek}`,
      };
    };

    const displayData = getDisplayData();
    const upcomingWorkouts = workouts.filter(w => !w.completed).slice(0, 4);
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    return (
      <div
        ref={ref}
        className="w-[400px] h-[600px] flex flex-col"
        style={{
          background: gradient,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header with Logo */}
        <div className="flex-shrink-0 pt-8 pb-4 flex justify-center">
          <FitBarcaLogo size="md" />
        </div>

        {/* Challenge Title with Icon */}
        <div className="flex-shrink-0 px-6 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <IconComponent className="w-6 h-6 text-white/80" />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          {type === 'standard' && displayData.weekText && (
            <p className="text-white/60 text-sm mt-1">{displayData.weekText}</p>
          )}
          {type === 'numeric' && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-white/60" />
              <p className="text-white/60 text-sm">אתגר מספרי</p>
            </div>
          )}
          {type === 'habit' && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Calendar className="w-4 h-4 text-white/60" />
              <p className="text-white/60 text-sm">אתגר הרגל</p>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="flex-shrink-0 px-6 pb-6">
          <div className="bg-black/20 rounded-2xl p-5 border border-white/10">
            {/* Circular Progress Indicator */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#22c55e"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(displayData.percentage / 100) * 301.6} 301.6`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Content - Dynamic based on type */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-green-400">{displayData.circleText}</span>
                  {displayData.circleSubtext && (
                    <span className="text-xs text-white/60">{displayData.circleSubtext}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-white">
                  {displayData.statsText}
                </span>
              </div>
              <p className="text-white/60 text-sm">{displayData.statsLabel}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={displayData.percentage} className="h-3 bg-black/30" />
            </div>
          </div>
        </div>

        {/* Content Section - Polymorphic based on type */}
        {displayData.percentage < 100 && (
          <div className="flex-1 px-6 pb-4 overflow-hidden">
            {/* Standard type: Show upcoming workouts */}
            {type === 'standard' && upcomingWorkouts.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-white/70 mb-3">אימונים קרובים:</h3>
                <div className="space-y-2">
                  {upcomingWorkouts.map((workout, idx) => (
                    <div
                      key={workout.id}
                      className="flex items-center gap-3 px-3 py-2 bg-black/20 rounded-lg border border-white/10"
                    >
                      <span className="text-xs font-mono text-white/50 w-6">#{idx + 1}</span>
                      <span className="text-sm text-white truncate">{workout.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Numeric type: Show remaining stats and motivation */}
            {type === 'numeric' && (
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/10 text-center">
                  <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{displayData.remainingText}</p>
                  <p className="text-sm text-white/60 mt-1">עד השלמת היעד</p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-white/80 text-sm italic">"{randomQuote}"</p>
                </div>
              </div>
            )}

            {/* Habit type: Show streak info */}
            {type === 'habit' && (
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/10 text-center">
                  <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-white">{displayData.remainingText}</p>
                  <p className="text-sm text-white/60 mt-1">להשלמת האתגר</p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/10 text-center">
                  <p className="text-white/80 text-sm italic">"{randomQuote}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed Message */}
        {displayData.percentage >= 100 && (
          <div className="flex-1 px-6 pb-4 flex items-center justify-center">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-yellow-400">האתגר הושלם! 🎉</p>
              {type === 'numeric' && (
                <p className="text-white/70 text-sm mt-2">
                  הגעת ל-{targetValue} {unitInfo.short}!
                </p>
              )}
              {type === 'habit' && (
                <p className="text-white/70 text-sm mt-2">
                  שמרת על רצף של {durationDays} ימים!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Watermark */}
        <div className="flex-shrink-0 py-4 text-center border-t border-white/10">
          <p className="text-xs text-white/40">Powered by FITBARÇA</p>
        </div>
      </div>
    );
  }
);

ChallengeShareCard.displayName = 'ChallengeShareCard';
