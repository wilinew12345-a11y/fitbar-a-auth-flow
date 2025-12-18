import { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface Workout {
  id?: string;
  text: string;
  workoutIndex: number;
}

interface ChallengeWorkoutManagerProps {
  workouts: Workout[];
  onAddWorkout: (workoutText: string) => void;
  onRemoveWorkout: (workoutIndex: number, workoutId?: string) => void;
  onDuplicateWorkout?: (workoutIndex: number) => void;
  isEditMode?: boolean;
}

const PRESET_TAGS = [
  "חזה", "גב", "רגליים", "כתפיים", "יד קדמית", "יד אחורית", 
  "בטן", "אירובי", "מתח", "Full Body", "שכיבות שמיכה", "קפיצה בחבל", "מנוחה"
];

export const ChallengeWorkoutManager = ({
  workouts,
  onAddWorkout,
  onRemoveWorkout,
  onDuplicateWorkout,
  isEditMode = false,
}: ChallengeWorkoutManagerProps) => {
  const { t } = useLanguage();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

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
    onAddWorkout(workoutString);
    setSelectedTags([]);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Workout Builder */}
      <div className="space-y-3 p-4 bg-blue-900/30 rounded-xl border border-blue-800">
        <p className="text-sm text-blue-200 font-medium">
          {isEditMode ? 'הוסף אימון חדש:' : 'שלב 1: בנה אימון על ידי בחירת תגיות'}
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
                  ? 'bg-yellow-400 border-yellow-400 text-blue-950 font-bold' 
                  : 'bg-transparent border-blue-600 text-blue-200 hover:border-yellow-400/50 hover:text-yellow-400'
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
            className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400 flex-1"
          />
          <Button
            onClick={handleAddCustomTag}
            disabled={!customTag.trim()}
            size="icon"
            className="bg-[#A50044] hover:bg-[#800033] text-white shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected Tags Preview */}
        {selectedTags.length > 0 && (
          <div className="mt-3 p-3 bg-[#021024] rounded-lg border border-dashed border-yellow-400/30">
            <p className="text-xs text-blue-300/70 mb-2">אימון נבחר:</p>
            <p className="text-yellow-400 font-medium">{selectedTags.join(' / ')}</p>
          </div>
        )}

        {/* Add Workout Button */}
        <Button
          onClick={handleAddWorkout}
          disabled={selectedTags.length === 0}
          className="w-full mt-3 bg-[#A50044] hover:bg-[#800033] text-white font-bold"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוסף אימון {isEditMode ? '' : 'לאתגר'}
        </Button>
      </div>

      {/* Workouts List */}
      {workouts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-blue-200">
              רשימת אימונים ({workouts.length})
            </label>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {workouts.map((workout, index) => (
              <div 
                key={workout.id || `workout-${index}`}
                className="flex items-center gap-2 p-3 bg-blue-900/30 rounded-lg border border-blue-800 group"
              >
                <span className="text-yellow-400 font-mono text-sm w-6">{index + 1}.</span>
                <span className="flex-1 text-white text-sm">{workout.text}</span>
                {onDuplicateWorkout && (
                  <button
                    onClick={() => onDuplicateWorkout(index)}
                    className="p-1.5 text-blue-300 hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="שכפל"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onRemoveWorkout(index, workout.id)}
                  className="p-1.5 text-blue-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="מחק"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
