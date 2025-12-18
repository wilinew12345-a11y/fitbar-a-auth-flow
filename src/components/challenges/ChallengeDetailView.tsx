import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Share2, Trophy, Sparkles, Pencil, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Challenge } from '@/hooks/useChallengesSupabase';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { ChallengeWorkoutManager } from './ChallengeWorkoutManager';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ChallengeDetailViewProps {
  challenge: Challenge;
  progress: { completed: number; total: number; percentage: number };
  onBack: () => void;
  onToggleWorkout: (workoutId: string) => void;
  onReset: () => void;
  onAddWorkout?: (workoutText: string) => void;
  onRemoveWorkout?: (workoutId: string) => void;
}

export const ChallengeDetailView = ({
  challenge,
  progress,
  onBack,
  onToggleWorkout,
  onReset,
  onAddWorkout,
  onRemoveWorkout,
}: ChallengeDetailViewProps) => {
  const { t, isRtl } = useLanguage();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastWeekCompleted, setLastWeekCompleted] = useState(-1);
  
  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

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
${t('progress')}: ${emojiBar} (${progress.percentage}%)
${t('completed')} ${progress.completed} / ${progress.total} ${t('workouts')}!`;
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
      toast.success(t('copiedToClipboard'));
    }
  };

  const handleReset = () => {
    onReset();
    setShowResetDialog(false);
    setLastWeekCompleted(-1);
    toast.success(t('challengeReset'));
  };

  const handleAddWorkoutInEdit = (workoutText: string) => {
    if (onAddWorkout) {
      onAddWorkout(workoutText);
      toast.success('אימון נוסף בהצלחה');
    }
  };

  const handleRemoveWorkoutInEdit = (_index: number, workoutId?: string) => {
    if (onRemoveWorkout && workoutId) {
      onRemoveWorkout(workoutId);
      toast.success('אימון הוסר בהצלחה');
    }
  };

  // Group workouts by weeks
  const groupedWorkouts: { workouts: typeof challenge.workouts; weekNumber: number }[] = [];
  for (let i = 0; i < challenge.workouts.length; i += challenge.targetPerWeek) {
    groupedWorkouts.push({
      weekNumber: Math.floor(i / challenge.targetPerWeek) + 1,
      workouts: challenge.workouts.slice(i, i + challenge.targetPerWeek),
    });
  }

  // Convert workouts for the manager component
  const workoutsForManager = challenge.workouts.map((w, i) => ({
    id: w.id,
    text: w.text,
    workoutIndex: i,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004D98] to-[#061E40] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
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
      <header className="sticky top-0 bg-[#004D98]/95 backdrop-blur-sm border-b border-blue-800/50 z-40">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-blue-800/50 hover:bg-blue-700/50 transition-colors"
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{challenge.title}</h1>
            <div className="flex gap-2">
              <LanguageSelector />
              {onAddWorkout && onRemoveWorkout && (
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  title="ערוך אימונים"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowResetDialog(true)}
                className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                title={t('reset')}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                title={t('share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">{progress.completed} / {progress.total} {t('workouts')}</span>
              <span className="text-green-400 font-bold">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-4 bg-blue-950/50" />
          </div>
        </div>
      </header>

      {/* Workout List */}
      <main className="max-w-2xl mx-auto p-4 pb-20">
        {progress.percentage === 100 && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/30 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-yellow-400">{t('congratulations')} 🎉</h2>
            <p className="text-blue-200 mt-2">{t('challengeCompleted')}</p>
          </div>
        )}

        {groupedWorkouts.map((group, groupIndex) => {
          const weekCompleted = group.workouts.every(w => w.completed);
          
          return (
            <div key={groupIndex} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-blue-200 bg-blue-900/60 px-3 py-1 rounded-full">
                  {t('weekNumber')} {group.weekNumber}
                </span>
                {weekCompleted && (
                  <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {t('weekCompleted')}
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
                          : 'bg-blue-900/40 border border-blue-800 hover:border-blue-700'
                      }`}
                    >
                      <Checkbox
                        id={workout.id}
                        checked={workout.completed}
                        onCheckedChange={() => onToggleWorkout(workout.id)}
                        className="w-6 h-6 border-2 border-blue-700 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <span className="text-xs font-mono text-blue-400 w-8">
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

      {/* Edit Workouts Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#061E40]/95 backdrop-blur-xl border-blue-800 text-white max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/30">
                <Pencil className="w-6 h-6 text-green-400" />
              </div>
              ערוך אימונים
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
            <ChallengeWorkoutManager
              workouts={workoutsForManager}
              onAddWorkout={handleAddWorkoutInEdit}
              onRemoveWorkout={handleRemoveWorkoutInEdit}
              isEditMode={true}
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowEditDialog(false)}
              className="px-6 py-2 bg-blue-900/60 border border-blue-800 text-white rounded-lg hover:bg-blue-800/60 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              סגור
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-[#061E40] border-blue-800 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">{t('resetChallenge')}</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              {t('resetChallengeConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:flex-row-reverse">
            <AlertDialogCancel className="bg-blue-900/60 border-blue-800 text-white hover:bg-blue-800/60">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RotateCcw className={`w-4 h-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
              {t('resetBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
