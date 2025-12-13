import { useState } from 'react';
import { Plus, Trophy, Dumbbell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { CreateChallengeDialog } from '@/components/challenges/CreateChallengeDialog';
import { ChallengeDetailView } from '@/components/challenges/ChallengeDetailView';
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
    toast.success('האתגר נוצר בהצלחה!');
  };

  const handleDeleteChallenge = () => {
    if (deleteDialogId) {
      deleteChallenge(deleteDialogId);
      setDeleteDialogId(null);
      toast.success('האתגר נמחק!');
    }
  };

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
    <div className="min-h-screen bg-[#1a1a1a] text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-[#333] z-40">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-[#252525] hover:bg-[#333] transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold">מעקב אתגרים</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {challenges.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#252525] flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">אין אתגרים פעילים</h2>
            <p className="text-gray-500 mb-6">צור אתגר חדש כדי להתחיל לעקוב אחרי ההתקדמות שלך</p>
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg shadow-green-500/30 transition-all hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        אתגר חדש
      </button>

      {/* Create Challenge Dialog */}
      <CreateChallengeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreateChallenge}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">מחיקת אתגר</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              האם אתה בטוח שברצונך למחוק את האתגר הזה? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:flex-row-reverse">
            <AlertDialogCancel className="bg-[#252525] border-[#333] text-white hover:bg-[#333]">
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChallenge}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              מחק אתגר
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChallengeTracker;
