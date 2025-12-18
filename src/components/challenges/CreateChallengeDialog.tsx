import { useState } from 'react';
import { X, Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChallengeWorkoutManager } from './ChallengeWorkoutManager';
import { toast } from 'sonner';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, targetPerWeek: number, workoutsText: string) => void;
}

interface LocalWorkout {
  text: string;
  workoutIndex: number;
}

export const CreateChallengeDialog = ({ open, onOpenChange, onSave }: CreateChallengeDialogProps) => {
  const [title, setTitle] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState<number | ''>('');
  const [workoutsList, setWorkoutsList] = useState<LocalWorkout[]>([]);

  const handleAddWorkout = (workoutText: string) => {
    setWorkoutsList(prev => [...prev, { text: workoutText, workoutIndex: prev.length }]);
  };

  const handleRemoveWorkout = (index: number) => {
    setWorkoutsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateWorkout = (index: number) => {
    setWorkoutsList(prev => {
      const newList = [...prev];
      newList.splice(index + 1, 0, { ...prev[index], workoutIndex: prev.length });
      return newList;
    });
  };

  const handleSave = () => {
    // Validate weekly goal
    if (targetPerWeek === '' || Number(targetPerWeek) <= 0) {
      toast.error('שגיאה', {
        description: 'חובה להזין יעד אימונים שבועי (גדול מ-0)',
      });
      return;
    }

    if (!title.trim()) {
      toast.error('שגיאה', {
        description: 'חובה להזין שם לאתגר',
      });
      return;
    }

    if (workoutsList.length === 0) {
      toast.error('שגיאה', {
        description: 'חובה להוסיף לפחות אימון אחד',
      });
      return;
    }

    const workoutsText = workoutsList.map(w => w.text).join('\n');
    onSave(title.trim(), Number(targetPerWeek), workoutsText);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setTargetPerWeek('');
    setWorkoutsList([]);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTargetPerWeek('');
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setTargetPerWeek(num);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#061E40]/95 backdrop-blur-xl border-blue-800 text-white max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#A50044]/30">
              <Dumbbell className="w-6 h-6 text-red-400" />
            </div>
            יצירת אתגר חדש
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-5 mt-4" dir="rtl">
            {/* Challenge Title */}
            <div className="space-y-2">
              <label className="text-sm text-blue-200">
                שם האתגר <span className="text-red-400">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: אתגר ה-30"
                required
                className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>

            {/* Target Per Week */}
            <div className="space-y-2">
              <label className="text-sm text-blue-200">
                יעד אימונים בשבוע <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={7}
                value={targetPerWeek}
                onChange={handleTargetChange}
                placeholder="לדוגמה: 4"
                required
                className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400 w-24"
              />
            </div>

            {/* Workout Manager */}
            <ChallengeWorkoutManager
              workouts={workoutsList}
              onAddWorkout={handleAddWorkout}
              onRemoveWorkout={handleRemoveWorkout}
              onDuplicateWorkout={handleDuplicateWorkout}
            />

            {/* Save/Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#A50044] hover:bg-[#800033] text-white font-bold shadow-lg shadow-red-900/30"
              >
                <Plus className="w-4 h-4 ml-2" />
                צור אתגר
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-blue-800 text-blue-300 hover:bg-blue-900/50 hover:text-yellow-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
