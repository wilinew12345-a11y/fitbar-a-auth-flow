import { Trash2, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/hooks/useChallenges';

interface ChallengeCardProps {
  challenge: Challenge;
  progress: { completed: number; total: number; percentage: number };
  onSelect: () => void;
  onDelete: () => void;
}

export const ChallengeCard = ({ challenge, progress, onSelect, onDelete }: ChallengeCardProps) => {
  return (
    <div
      className="bg-blue-900/60 backdrop-blur-sm rounded-2xl p-5 border border-blue-800 hover:border-red-700/50 transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
          {challenge.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg bg-red-900/30 text-red-600 hover:bg-red-900/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm text-blue-200">
          <span>{progress.completed} / {progress.total} אימונים</span>
          <span className="text-yellow-400 font-semibold">{progress.percentage}%</span>
        </div>
        <Progress 
          value={progress.percentage} 
          className="h-3 bg-blue-950/50"
        />
        <div className="flex items-center justify-between text-xs text-blue-300/70">
          <span>יעד שבועי: {challenge.targetPerWeek} אימונים</span>
          <ChevronLeft className="w-4 h-4 text-red-400 group-hover:translate-x-[-4px] transition-transform" />
        </div>
      </div>
    </div>
  );
};
