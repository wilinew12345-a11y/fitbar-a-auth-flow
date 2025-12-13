import { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Share2, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/hooks/useChallenges';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ChallengeDetailViewProps {
  challenge: Challenge;
  progress: { completed: number; total: number; percentage: number };
  onBack: () => void;
  onToggleWorkout: (workoutId: string) => void;
  onReset: () => void;
}

export const ChallengeDetailView = ({
  challenge,
  progress,
  onBack,
  onToggleWorkout,
  onReset,
}: ChallengeDetailViewProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastWeekCompleted, setLastWeekCompleted] = useState(-1);

  // Check for week completion
  useEffect(() => {
    const completedCount = challenge.workouts.filter(w => w.completed).length;
    const currentWeek = Math.floor(completedCount / challenge.targetPerWeek);
    
    if (currentWeek > lastWeekCompleted && completedCount > 0 && completedCount % challenge.targetPerWeek === 0) {
      setShowConfetti(true);
      setLastWeekCompleted(currentWeek);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [challenge.workouts, challenge.targetPerWeek, lastWeekCompleted]);

  // Check for challenge completion
  useEffect(() => {
    if (progress.percentage === 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [progress.percentage]);

  const generateShareText = () => {
    const emojiCount = 10;
    const filledCount = Math.round((progress.percentage / 100) * emojiCount);
    const emojiBar = '🟩'.repeat(filledCount) + '⬜'.repeat(emojiCount - filledCount);

    return `${challenge.title} 💪
התקדמות: ${emojiBar} (${progress.percentage}%)
סיימתי ${progress.completed} מתוך ${progress.total} אימונים!`;
  };

  const handleShare = async () => {
    const shareText = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('הטקסט הועתק ללוח!');
    }
  };

  const handleReset = () => {
    onReset();
    setShowResetDialog(false);
    setLastWeekCompleted(-1);
    toast.success('האתגר אופס בהצלחה!');
  };

  // Group workouts by weeks
  const groupedWorkouts: { workouts: typeof challenge.workouts; weekNumber: number }[] = [];
  for (let i = 0; i < challenge.workouts.length; i += challenge.targetPerWeek) {
    groupedWorkouts.push({
      weekNumber: Math.floor(i / challenge.targetPerWeek) + 1,
      workouts: challenge.workouts.slice(i, i + challenge.targetPerWeek),
    });
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white" dir="rtl">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles
                className="text-yellow-400"
                style={{
                  width: `${16 + Math.random() * 16}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-[#333] z-40">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-[#252525] hover:bg-[#333] transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{challenge.title}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetDialog(true)}
                className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                title="איפוס אתגר"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="שתף התקדמות"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{progress.completed} / {progress.total} אימונים</span>
              <span className="text-green-400 font-bold">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-4 bg-[#333]" />
          </div>
        </div>
      </header>

      {/* Workout List */}
      <main className="max-w-2xl mx-auto p-4 pb-20">
        {progress.percentage === 100 && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/30 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-yellow-400">מזל טוב! 🎉</h2>
            <p className="text-gray-300 mt-2">סיימת את האתגר בהצלחה!</p>
          </div>
        )}

        {groupedWorkouts.map((group, groupIndex) => {
          const weekCompleted = group.workouts.every(w => w.completed);
          
          return (
            <div key={groupIndex} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-400 bg-[#252525] px-3 py-1 rounded-full">
                  שבוע {group.weekNumber}
                </span>
                {weekCompleted && (
                  <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    שבוע הושלם!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {group.workouts.map((workout, workoutIndex) => {
                  const absoluteIndex = groupIndex * challenge.targetPerWeek + workoutIndex + 1;
                  
                  return (
                    <div
                      key={workout.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        workout.completed
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-[#252525] border border-[#333] hover:border-[#444]'
                      }`}
                    >
                      <Checkbox
                        id={workout.id}
                        checked={workout.completed}
                        onCheckedChange={() => onToggleWorkout(workout.id)}
                        className="w-6 h-6 border-2 border-[#444] data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <span className="text-xs font-mono text-gray-500 w-8">
                        #{absoluteIndex}
                      </span>
                      <label
                        htmlFor={workout.id}
                        className={`flex-1 cursor-pointer transition-all ${
                          workout.completed
                            ? 'text-green-400 line-through opacity-70'
                            : 'text-white'
                        }`}
                      >
                        {workout.text}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">איפוס האתגר?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              האם אתה בטוח שברצונך לאפס את האתגר הזה? כל ההתקדמות תימחק.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:flex-row-reverse">
            <AlertDialogCancel className="bg-[#252525] border-[#333] text-white hover:bg-[#333]">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              אפס אתגר
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
