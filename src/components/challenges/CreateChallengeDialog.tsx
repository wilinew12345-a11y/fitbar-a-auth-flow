import { useState } from 'react';
import { X, Plus, Dumbbell, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, targetPerWeek: number, workoutsText: string) => void;
}

const PRESET_TAGS = [
  "חזה", "גב", "רגליים", "כתפיים", "יד קדמית", "יד אחורית", 
  "בטן", "אירובי", "מתח", "Full Body", "שכיבות שמיכה", "קפיצה בחבל", "מנוחה"
];

export const CreateChallengeDialog = ({ open, onOpenChange, onSave }: CreateChallengeDialogProps) => {
  const [title, setTitle] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState(4);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [workoutsList, setWorkoutsList] = useState<string[]>([]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleAddWorkout = () => {
    if (selectedTags.length === 0) return;
    const workoutString = selectedTags.join('/');
    setWorkoutsList(prev => [...prev, workoutString]);
    setSelectedTags([]);
  };

  const handleDeleteWorkout = (index: number) => {
    setWorkoutsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateWorkout = (index: number) => {
    setWorkoutsList(prev => {
      const newList = [...prev];
      newList.splice(index + 1, 0, prev[index]);
      return newList;
    });
  };

  const handleSave = () => {
    if (!title.trim() || workoutsList.length === 0) return;
    const workoutsText = workoutsList.join('\n');
    onSave(title.trim(), targetPerWeek, workoutsText);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setTargetPerWeek(4);
    setSelectedTags([]);
    setCustomTag('');
    setWorkoutsList([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Dumbbell className="w-6 h-6 text-green-400" />
            </div>
            יצירת אתגר חדש
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-5 mt-4" dir="rtl">
            {/* Challenge Title */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">שם האתגר</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: אתגר ה-30"
                className="bg-[#252525] border-[#333] text-white placeholder:text-gray-500 focus:border-green-500"
              />
            </div>

            {/* Target Per Week */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">יעד אימונים בשבוע</label>
              <Input
                type="number"
                min={1}
                max={7}
                value={targetPerWeek}
                onChange={(e) => setTargetPerWeek(parseInt(e.target.value) || 4)}
                className="bg-[#252525] border-[#333] text-white focus:border-green-500 w-24"
              />
            </div>

            {/* Workout Builder */}
            <div className="space-y-3 p-4 bg-[#252525] rounded-xl border border-[#333]">
              <p className="text-sm text-gray-400 font-medium">
                שלב 1: בנה אימון על ידי בחירת תגיות
              </p>
              
              {/* Tags Grid */}
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      border ${selectedTags.includes(tag) 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-transparent border-[#444] text-gray-300 hover:border-green-500/50 hover:text-green-400'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2 mt-3">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                  placeholder="תגית מותאמת אישית..."
                  className="bg-[#1a1a1a] border-[#444] text-white placeholder:text-gray-500 focus:border-green-500 flex-1"
                />
                <Button
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                  size="icon"
                  className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Tags Preview */}
              {selectedTags.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a1a1a] rounded-lg border border-dashed border-green-500/30">
                  <p className="text-xs text-gray-500 mb-2">אימון נבחר:</p>
                  <p className="text-green-400 font-medium">{selectedTags.join(' / ')}</p>
                </div>
              )}

              {/* Add Workout Button */}
              <Button
                onClick={handleAddWorkout}
                disabled={selectedTags.length === 0}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף אימון לאתגר
              </Button>
            </div>

            {/* Live Preview List */}
            {workoutsList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">
                    רשימת אימונים ({workoutsList.length})
                  </label>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {workoutsList.map((workout, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 bg-[#252525] rounded-lg border border-[#333] group"
                    >
                      <span className="text-green-500 font-mono text-sm w-6">{index + 1}.</span>
                      <span className="flex-1 text-white text-sm">{workout}</span>
                      <button
                        onClick={() => handleDuplicateWorkout(index)}
                        className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="שכפל"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(index)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="מחק"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save/Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!title.trim() || workoutsList.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <Plus className="w-4 h-4 ml-2" />
                צור אתגר
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-[#333] text-gray-400 hover:bg-[#252525]"
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
