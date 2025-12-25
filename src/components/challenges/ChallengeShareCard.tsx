import { forwardRef } from 'react';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface Workout {
  id: string;
  text: string;
  completed: boolean;
}

interface ChallengeShareCardProps {
  title: string;
  progress: { completed: number; total: number; percentage: number };
  workouts: Workout[];
  targetPerWeek: number;
}

export const ChallengeShareCard = forwardRef<HTMLDivElement, ChallengeShareCardProps>(
  ({ title, progress, workouts, targetPerWeek }, ref) => {
    // Get upcoming (incomplete) workouts for preview
    const upcomingWorkouts = workouts
      .filter(w => !w.completed)
      .slice(0, 4);

    // Calculate current week
    const currentWeek = Math.floor(progress.completed / targetPerWeek) + 1;

    return (
      <div
        ref={ref}
        className="w-[400px] h-[600px] flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #004D98 0%, #061E40 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header with Logo */}
        <div className="flex-shrink-0 pt-8 pb-4 flex justify-center">
          <FitBarcaLogo size="md" />
        </div>

        {/* Challenge Title */}
        <div className="flex-shrink-0 px-6 pb-4 text-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-blue-300/80 text-sm mt-1">שבוע {currentWeek}</p>
        </div>

        {/* Progress Section */}
        <div className="flex-shrink-0 px-6 pb-6">
          <div className="bg-blue-900/40 rounded-2xl p-5 border border-blue-700/50">
            {/* Circular Progress Indicator */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#1e3a5f"
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
                    strokeDasharray={`${(progress.percentage / 100) * 301.6} 301.6`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-400">{progress.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-white">
                  {progress.completed} / {progress.total}
                </span>
              </div>
              <p className="text-blue-200/70 text-sm">אימונים הושלמו</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={progress.percentage} className="h-3 bg-blue-950/50" />
            </div>
          </div>
        </div>

        {/* Upcoming Workouts */}
        {upcomingWorkouts.length > 0 && (
          <div className="flex-1 px-6 pb-4 overflow-hidden">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">אימונים קרובים:</h3>
            <div className="space-y-2">
              {upcomingWorkouts.map((workout, idx) => (
                <div
                  key={workout.id}
                  className="flex items-center gap-3 px-3 py-2 bg-blue-800/30 rounded-lg border border-blue-700/30"
                >
                  <span className="text-xs font-mono text-blue-400 w-6">#{idx + 1}</span>
                  <span className="text-sm text-white truncate">{workout.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Message */}
        {progress.percentage === 100 && (
          <div className="flex-1 px-6 pb-4 flex items-center justify-center">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-yellow-400">האתגר הושלם! 🎉</p>
            </div>
          </div>
        )}

        {/* Footer Watermark */}
        <div className="flex-shrink-0 py-4 text-center border-t border-blue-800/50">
          <p className="text-xs text-blue-400/60">Powered by FITBARÇA</p>
        </div>
      </div>
    );
  }
);

ChallengeShareCard.displayName = 'ChallengeShareCard';
