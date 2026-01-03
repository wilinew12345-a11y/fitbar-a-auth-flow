import { Trash2, ChevronLeft, Dumbbell, Target, Zap, Trophy, Heart, Star, Timer, Flame, Droplets, TrendingUp, CheckSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Challenge, ChallengeType } from '@/hooks/useChallengesSupabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ChallengeCardProps {
  challenge: Challenge;
  progress: { completed: number; total: number; percentage: number };
  onSelect: () => void;
  onDelete: () => void;
}

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

const COLOR_THEMES: Record<string, { bg: string; border: string; gradient: string }> = {
  blue: { bg: 'bg-blue-600', border: 'border-blue-500/50', gradient: 'from-blue-600/20 to-blue-900/40' },
  red: { bg: 'bg-red-600', border: 'border-red-500/50', gradient: 'from-red-600/20 to-red-900/40' },
  green: { bg: 'bg-green-600', border: 'border-green-500/50', gradient: 'from-green-600/20 to-green-900/40' },
  purple: { bg: 'bg-purple-600', border: 'border-purple-500/50', gradient: 'from-purple-600/20 to-purple-900/40' },
  orange: { bg: 'bg-orange-500', border: 'border-orange-500/50', gradient: 'from-orange-500/20 to-orange-800/40' },
  pink: { bg: 'bg-pink-500', border: 'border-pink-500/50', gradient: 'from-pink-500/20 to-pink-800/40' },
};

const TYPE_LABELS: Record<ChallengeType, { he: string; icon: React.ComponentType<{ className?: string }> }> = {
  standard: { he: 'צ\'קליסט', icon: CheckSquare },
  numeric: { he: 'מספרי', icon: TrendingUp },
  habit: { he: 'הרגל', icon: Flame },
};

const UNIT_LABELS: Record<string, string> = {
  km: 'ק"מ',
  kg: 'ק"ג',
  liters: 'ליטרים',
  minutes: 'דקות',
  hours: 'שעות',
  reps: 'חזרות',
  sets: 'סטים',
};

export const ChallengeCard = ({ challenge, progress, onSelect, onDelete }: ChallengeCardProps) => {
  const { t } = useLanguage();
  
  const colorTheme = COLOR_THEMES[challenge.colorTheme || 'blue'] || COLOR_THEMES.blue;
  const IconComponent = ICONS[challenge.icon || 'dumbbell'] || Dumbbell;
  const typeInfo = TYPE_LABELS[challenge.type || 'standard'];
  const TypeIcon = typeInfo.icon;
  
  const getProgressDisplay = () => {
    if (challenge.type === 'numeric') {
      const current = challenge.currentValue || 0;
      const target = challenge.targetValue || 0;
      const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
      const unitLabel = UNIT_LABELS[challenge.metricUnit || ''] || challenge.metricUnit || '';
      return {
        text: `${current} / ${target} ${unitLabel}`,
        percentage: Math.min(percentage, 100),
      };
    }
    
    if (challenge.type === 'habit') {
      const daysCompleted = challenge.currentValue || 0;
      const totalDays = challenge.durationDays || 30;
      const percentage = totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;
      return {
        text: `${daysCompleted} / ${totalDays} ימים`,
        percentage: Math.min(percentage, 100),
      };
    }
    
    // Standard type
    return {
      text: `${progress.completed} / ${progress.total} ${t('workouts')}`,
      percentage: progress.percentage,
    };
  };
  
  const progressDisplay = getProgressDisplay();
  
  return (
    <div
      className={cn(
        "backdrop-blur-sm rounded-2xl p-5 border transition-all cursor-pointer group bg-gradient-to-br",
        colorTheme.gradient,
        colorTheme.border,
        "hover:border-yellow-400/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", colorTheme.bg)}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <TypeIcon className="w-3 h-3 text-blue-300" />
              <span className="text-xs text-blue-300">{typeInfo.he}</span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm text-blue-200">
          <span>{progressDisplay.text}</span>
          <span className="text-yellow-400 font-semibold">{progressDisplay.percentage}%</span>
        </div>
        <Progress 
          value={progressDisplay.percentage} 
          className="h-3 bg-blue-950/50"
        />
        <div className="flex items-center justify-between text-xs text-blue-300/70">
          {challenge.type === 'standard' && (
            <span>{t('weeklyTarget')}: {challenge.targetPerWeek} {t('workouts')}</span>
          )}
          {challenge.type === 'numeric' && (
            <span>יעד: {challenge.targetValue} {UNIT_LABELS[challenge.metricUnit || ''] || challenge.metricUnit}</span>
          )}
          {challenge.type === 'habit' && (
            <span>משך: {challenge.durationDays} ימים</span>
          )}
          <ChevronLeft className="w-4 h-4 text-yellow-400 group-hover:translate-x-[-4px] transition-transform" />
        </div>
      </div>
    </div>
  );
};
