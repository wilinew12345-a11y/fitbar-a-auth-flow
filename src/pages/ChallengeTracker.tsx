import { useState } from 'react';
import { Plus, Dumbbell, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChallengesSupabase } from '@/hooks/useChallengesSupabase';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeWizard, ChallengeFormData } from '@/components/challenges/CreateChallengeWizard';
import { ChallengeDetailView } from '@/components/challenges/ChallengeDetailView';
import { ChallengesEmptyState } from '@/components/challenges/ChallengesEmptyState';
import LanguageSelector from '@/components/LanguageSelector';
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
import { toast } from 'sonner';

const ChallengeTracker = () => {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const {
    challenges,
    isLoading,
    addChallenge,
    deleteChallenge,
    toggleWorkout,
    resetChallenge,
    addWorkoutToChallenge,
    removeWorkoutFromChallenge,
    updateWorkoutText,
    getProgress,
  } = useChallengesSupabase();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

  const handleCreateChallenge = (data: ChallengeFormData) => {
    addChallenge(data);
    toast.success(t('challengeCreated'));
  };

  const handleDeleteChallenge = () => {
    if (deleteDialogId) {
      deleteChallenge(deleteDialogId);
      setDeleteDialogId(null);
      toast.success(t('challengeDeleted'));
    }
  };

  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#004D98] to-[#061E40] text-white p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="sticky top-0 bg-[#004D98]/95 backdrop-blur-sm border-b border-blue-800/50 z-40 mb-6">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-lg bg-blue-800/50" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-blue-800/50" />
                <Skeleton className="h-8 w-40 bg-blue-800/50" />
              </div>
              <Skeleton className="h-10 w-24 bg-blue-800/50" />
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-40 rounded-2xl bg-blue-900/60" />
          ))}
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedChallenge) {
    return (
      <ChallengeDetailView
        challenge={selectedChallenge}
        progress={getProgress(selectedChallenge)}
        onBack={() => setSelectedChallengeId(null)}
        onToggleWorkout={(workoutId) => toggleWorkout(selectedChallenge.id, workoutId)}
        onReset={() => resetChallenge(selectedChallenge.id)}
        onAddWorkout={(workoutText) => addWorkoutToChallenge(selectedChallenge.id, workoutText)}
        onRemoveWorkout={(workoutId) => removeWorkoutFromChallenge(workoutId)}
        onUpdateWorkout={(workoutId, newText) => updateWorkoutText(workoutId, newText)}
      />
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004D98] to-[#061E40] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 bg-[#004D98]/95 backdrop-blur-sm border-b border-blue-800/50 z-40">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="min-w-[40px] min-h-[40px] p-2 rounded-full bg-blue-800/50 hover:bg-[#A50044]/50 hover:text-white transition-all duration-200 flex items-center justify-center"
              aria-label={t('back')}
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#A50044]/30 to-[#A50044]/50">
                <Dumbbell className="w-6 h-6 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t('challengeTracker')}</h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {challenges.length === 0 ? (
          <ChallengesEmptyState onCreateChallenge={() => setShowCreateDialog(true)} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                progress={getProgress(challenge)}
                onSelect={() => setSelectedChallengeId(challenge.id)}
                onDelete={() => setDeleteDialogId(challenge.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB - Create New Challenge */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-4 bg-[#A50044] hover:bg-red-800 text-white font-bold rounded-full shadow-lg shadow-red-900/40 transition-all hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        {t('newChallenge')}
      </button>

      {/* Create Challenge Wizard */}
      <CreateChallengeWizard
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreateChallenge}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent className="bg-[#061E40] border-blue-800 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">{t('deleteChallenge')}</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              {t('confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:flex-row-reverse">
            <AlertDialogCancel className="bg-blue-900/60 border-blue-800 text-white hover:bg-blue-800/60">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChallenge}
              className="bg-[#A50044] hover:bg-red-800 text-white"
            >
              {t('deleteChallenge')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChallengeTracker;
