import { useState } from 'react';
import { Plus, Trophy, Dumbbell, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeDialog } from '@/components/challenges/CreateChallengeDialog';
import { ChallengeDetailView } from '@/components/challenges/ChallengeDetailView';
import LanguageSelector from '@/components/LanguageSelector';
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
    isLoaded,
    addChallenge,
    deleteChallenge,
    toggleWorkout,
    resetChallenge,
    getProgress,
  } = useChallenges();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

  const handleCreateChallenge = (title: string, targetPerWeek: number, workoutsText: string) => {
    addChallenge(title, targetPerWeek, workoutsText);
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
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
              className="p-2 rounded-lg bg-blue-800/50 hover:bg-blue-700/50 transition-colors"
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#A50044]/30 to-[#A50044]/50">
                <Trophy className="w-6 h-6 text-red-400" />
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
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-blue-900/60 flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-blue-300" />
            </div>
            <h2 className="text-xl font-bold text-blue-200 mb-2">{t('noChallenges')}</h2>
            <p className="text-blue-300/70 mb-6">{t('createChallengePrompt')}</p>
          </div>
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

      {/* Create Challenge Dialog */}
      <CreateChallengeDialog
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
