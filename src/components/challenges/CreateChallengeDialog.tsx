import { useState } from 'react';
import { X, Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, targetPerWeek: number, workoutsText: string) => void;
}

export const CreateChallengeDialog = ({ open, onOpenChange, onSave }: CreateChallengeDialogProps) => {
  const [title, setTitle] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState(4);
  const [workoutsText, setWorkoutsText] = useState('');

  const handleSave = () => {
    if (!title.trim() || !workoutsText.trim()) return;
    onSave(title.trim(), targetPerWeek, workoutsText);
    setTitle('');
    setTargetPerWeek(4);
    setWorkoutsText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Dumbbell className="w-6 h-6 text-green-400" />
            </div>
            יצירת אתגר חדש
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4" dir="rtl">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">שם האתגר</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: אתגר ה-30"
              className="bg-[#252525] border-[#333] text-white placeholder:text-gray-500 focus:border-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">יעד אימונים בשבוע</label>
            <Input
              type="number"
              min={1}
              max={7}
              value={targetPerWeek}
              onChange={(e) => setTargetPerWeek(parseInt(e.target.value) || 4)}
              className="bg-[#252525] border-[#333] text-white focus:border-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">רשימת אימונים (שורה לכל אימון)</label>
            <Textarea
              value={workoutsText}
              onChange={(e) => setWorkoutsText(e.target.value)}
              placeholder={`חזה/כתפיים/יד אחורית\nיד קדמית/גב\nרגליים\n...`}
              className="bg-[#252525] border-[#333] text-white placeholder:text-gray-500 focus:border-green-500 min-h-[200px] resize-none"
            />
            <p className="text-xs text-gray-500">
              הדבק את רשימת האימונים - כל שורה תהפוך לאימון נפרד
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !workoutsText.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Plus className="w-4 h-4 ml-2" />
              צור אתגר
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#333] text-gray-400 hover:bg-[#252525]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
