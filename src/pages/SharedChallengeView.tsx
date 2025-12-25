import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RotateCcw, Share2, Trophy, Sparkles, Pencil, X, Eye, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LanguageSelector from '@/components/LanguageSelector';
import { ChallengeWorkoutManager } from '@/components/challenges/ChallengeWorkoutManager';
import { ChallengeShareCard } from '@/components/challenges/ChallengeShareCard';
import { Skeleton } from '@/components/ui/skeleton';
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

interface Workout {
  id: string;
  text: string;
  completed: boolean;
  completedAt: string | null;
}

interface Challenge {
  id: string;
  title: string;
  targetPerWeek: number;
  userId: string;
  workouts: Workout[];
}

const SharedChallengeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const { user } = useAuth();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastWeekCompleted, setLastWeekCompleted] = useState(-1);
  const [isCapturing, setIsCapturing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === challenge?.userId;
  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

  // Fetch challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) {
        setError('No challenge ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch challenge
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (challengeError) throw challengeError;
        
        if (!challengeData) {
          setError('Challenge not found');
          setIsLoading(false);
          return;
        }

        // Fetch workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('challenge_workouts')
          .select('*')
          .eq('challenge_id', id)
          .order('workout_index', { ascending: true });

        if (workoutsError) throw workoutsError;

        const workouts: Workout[] = (workoutsData || []).map(w => ({
          id: w.id,
          text: w.workout_text,
          completed: w.is_completed,
          completedAt: w.completed_at,
        }));

        setChallenge({
          id: challengeData.id,
          title: challengeData.title,
          targetPerWeek: challengeData.target_per_week,
          userId: challengeData.user_id,
          workouts,
        });
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  // Calculate progress
  const progress = challenge ? {
    completed: challenge.workouts.filter(w => w.completed).length,
    total: challenge.workouts.length,
    percentage: challenge.workouts.length > 0
      ? Math.round((challenge.workouts.filter(w => w.completed).length / challenge.workouts.length) * 100)
      : 0,
  } : { completed: 0, total: 0, percentage: 0 };

  // Check for week completion
  useEffect(() => {
    if (!challenge) return;
    const completedCount = challenge.workouts.filter(w => w.completed).length;
    const currentWeek = Math.floor(completedCount / challenge.targetPerWeek);
    
    if (currentWeek > lastWeekCompleted && completedCount > 0 && completedCount % challenge.targetPerWeek === 0) {
      setShowConfetti(true);
      setLastWeekCompleted(currentWeek);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [challenge?.workouts, challenge?.targetPerWeek, lastWeekCompleted]);

  // Check for challenge completion
  useEffect(() => {
    if (progress.percentage === 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [progress.percentage]);

  const handleToggleWorkout = async (workoutId: string) => {
    if (!isOwner || !challenge) return;

    const workout = challenge.workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const newCompleted = !workout.completed;

    // Optimistic update
    setChallenge(prev => prev ? {
      ...prev,
      workouts: prev.workouts.map(w =>
        w.id === workoutId ? { ...w, completed: newCompleted } : w
      ),
    } : null);

    // Update in database
    const { error } = await supabase
      .from('challenge_workouts')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', workoutId);

    if (error) {
      // Revert on error
      setChallenge(prev => prev ? {
        ...prev,
        workouts: prev.workouts.map(w =>
          w.id === workoutId ? { ...w, completed: !newCompleted } : w
        ),
      } : null);
      toast.error('Failed to update workout');
    }
  };

  const handleReset = async () => {
    if (!isOwner || !challenge) return;

    const { error } = await supabase
      .from('challenge_workouts')
      .update({ is_completed: false, completed_at: null })
      .eq('challenge_id', challenge.id);

    if (error) {
      toast.error('Failed to reset challenge');
      return;
    }

    setChallenge(prev => prev ? {
      ...prev,
      workouts: prev.workouts.map(w => ({ ...w, completed: false })),
    } : null);
    
    setShowResetDialog(false);
    setLastWeekCompleted(-1);
    toast.success(t('challengeReset'));
  };

  const handleAddWorkout = async (workoutText: string) => {
    if (!isOwner || !challenge) return;

    const newIndex = challenge.workouts.length;
    
    const { data, error } = await supabase
      .from('challenge_workouts')
      .insert({
        challenge_id: challenge.id,
        workout_text: workoutText,
        workout_index: newIndex,
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add workout');
      return;
    }

    setChallenge(prev => prev ? {
      ...prev,
      workouts: [...prev.workouts, {
        id: data.id,
        text: data.workout_text,
        completed: data.is_completed,
        completedAt: data.completed_at,
      }],
    } : null);
    
    toast.success('אימון נוסף בהצלחה');
  };

  const handleRemoveWorkout = async (_index: number, workoutId?: string) => {
    if (!isOwner || !workoutId) return;

    const { error } = await supabase
      .from('challenge_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      toast.error('Failed to remove workout');
      return;
    }

    setChallenge(prev => prev ? {
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== workoutId),
    } : null);
    
    toast.success('אימון הוסר בהצלחה');
  };

  const generateShareText = () => {
    if (!challenge) return '';
    const emojiCount = 10;
    const filledCount = Math.round((progress.percentage / 100) * emojiCount);
    const emojiBar = '🟩'.repeat(filledCount) + '⬜'.repeat(emojiCount - filledCount);

    return `${challenge.title} 💪
${t('progress')}: ${emojiBar} (${progress.percentage}%)
${t('completed')} ${progress.completed} / ${progress.total} ${t('workouts')}!`;
  };

  const handleShare = async () => {
    const shareData = {
      title: challenge?.title || '',
      text: generateShareText(),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('הקישור הועתק!', {
          description: 'שתף את הקישור עם חברים',
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('הקישור הועתק!');
        } catch {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const handleShareAsImage = async () => {
    if (!shareCardRef.current || isCapturing || !challenge) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('שגיאה ביצירת התמונה');
          setIsCapturing(false);
          return;
        }

        const file = new File([blob], `${challenge.title}.png`, { type: 'image/png' });

        // Try Web Share API with file
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: challenge.title,
              text: generateShareText(),
            });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              downloadImage(canvas);
            }
          }
        } else {
          downloadImage(canvas);
        }
        setIsCapturing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error capturing image:', err);
      toast.error('שגיאה ביצירת התמונה');
      setIsCapturing(false);
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    if (!challenge) return;
    const link = document.createElement('a');
    link.download = `${challenge.title}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('התמונה הורדה בהצלחה!');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#004D98] to-[#061E40] text-white p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="sticky top-0 bg-[#004D98]/95 backdrop-blur-sm border-b border-blue-800/50 z-40 mb-6">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-lg bg-blue-800/50" />
              <Skeleton className="h-8 w-48 bg-blue-800/50" />
              <Skeleton className="h-10 w-24 bg-blue-800/50" />
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl bg-blue-900/60" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#004D98] to-[#061E40] text-white flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{isRtl ? 'האתגר לא נמצא' : 'Challenge not found'}</h2>
          <p className="text-blue-300/70 mb-6">{error || (isRtl ? 'האתגר שחיפשת לא קיים.' : 'The challenge you are looking for does not exist.')}</p>
          <button
            onClick={() => navigate('/challenges')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isRtl ? 'חזרה לאתגרים' : 'Back to Challenges'}
          </button>
        </div>
      </div>
    );
  }

  // Convert workouts for the share card
  const workoutsForShareCard = challenge.workouts.map(w => ({
    id: w.id,
    text: w.text,
    completed: w.completed,
  }));

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
      {/* Hidden Share Card for Capture */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <ChallengeShareCard
          ref={shareCardRef}
          title={challenge.title}
          progress={progress}
          workouts={workoutsForShareCard}
          targetPerWeek={challenge.targetPerWeek}
        />
      </div>
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
              onClick={() => navigate('/challenges')}
              className="min-w-[40px] min-h-[40px] p-2 rounded-full bg-blue-800/50 hover:bg-[#A50044]/50 hover:text-white transition-all duration-200 flex items-center justify-center"
              aria-label={t('back')}
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{challenge.title}</h1>
              {!isOwner && (
                <span className="flex items-center gap-1 text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3" />
                  {isRtl ? 'צפייה בלבד' : 'View Only'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <LanguageSelector />
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowEditDialog(true)}
                    className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    title="ערוך אימונים"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    title={t('reset')}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleShareAsImage}
                disabled={isCapturing}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                title="שתף כתמונה"
              >
                <Camera className="w-5 h-5" />
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
                      {isOwner ? (
                        <Checkbox
                          id={workout.id}
                          checked={workout.completed}
                          onCheckedChange={() => handleToggleWorkout(workout.id)}
                          className="w-6 h-6 border-2 border-blue-700 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                      ) : (
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          workout.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-blue-700'
                        }`}>
                          {workout.completed && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="text-xs font-mono text-blue-400 w-8">
                        #{absoluteIndex}
                      </span>
                      <span
                        className={`flex-1 ${
                          workout.completed
                            ? 'text-green-400 line-through opacity-70'
                            : 'text-white'
                        }`}
                      >
                        {workout.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Edit Workouts Dialog - Only for owner */}
      {isOwner && (
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
                onAddWorkout={handleAddWorkout}
                onRemoveWorkout={handleRemoveWorkout}
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
      )}

      {/* Reset Confirmation Dialog - Only for owner */}
      {isOwner && (
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
      )}
    </div>
  );
};

export default SharedChallengeView;
