import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Upload, Image as ImageIcon, Save, GripVertical, ChevronDown, ChevronUp, Dumbbell, RotateCcw, Hash } from 'lucide-react';

export interface Exercise {
  id: string;
  name: string;
  body_part: string;
  weight: number;
  sets: number;
  reps: number;
  image_url: string | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (id: string, updates: Partial<Exercise>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onImageUpload: (id: string, file: File) => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
}

export const ExerciseCard = ({ 
  exercise, 
  onUpdate, 
  onDelete, 
  onImageUpload, 
  isSaving, 
  isUploading 
}: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValues, setLocalValues] = useState({
    weight: exercise.weight,
    sets: exercise.sets,
    reps: exercise.reps,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChanges = 
    localValues.weight !== exercise.weight ||
    localValues.sets !== exercise.sets ||
    localValues.reps !== exercise.reps;

  const handleSave = () => {
    onUpdate(exercise.id, localValues);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 transition-all hover:bg-white/15"
    >
      {/* Compact Header Row */}
      <div className="flex items-center gap-1.5">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 text-white/40 hover:text-white/70 touch-none flex-shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Exercise Name */}
        <span className="text-xs font-medium text-white truncate flex-shrink min-w-0 max-w-[70px]" title={exercise.name}>
          {exercise.name}
        </span>

        {/* Compact Inputs Row */}
        <div 
          className="flex items-center gap-1 flex-1 min-w-0"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="relative flex-1 min-w-0">
            <Dumbbell className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40 pointer-events-none" />
            <Input
              type="number"
              value={localValues.weight}
              onChange={(e) => setLocalValues({ ...localValues, weight: Number(e.target.value) })}
              className="bg-white/10 border-white/20 text-white text-[10px] h-6 pr-5 pl-1 w-full"
              placeholder="kg"
            />
          </div>
          <div className="relative flex-1 min-w-0">
            <Hash className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40 pointer-events-none" />
            <Input
              type="number"
              value={localValues.sets}
              onChange={(e) => setLocalValues({ ...localValues, sets: Number(e.target.value) })}
              className="bg-white/10 border-white/20 text-white text-[10px] h-6 pr-5 pl-1 w-full"
              placeholder="סט"
            />
          </div>
          <div className="relative flex-1 min-w-0">
            <RotateCcw className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40 pointer-events-none" />
            <Input
              type="number"
              value={localValues.reps}
              onChange={(e) => setLocalValues({ ...localValues, reps: Number(e.target.value) })}
              className="bg-white/10 border-white/20 text-white text-[10px] h-6 pr-5 pl-1 w-full"
              placeholder="חזר"
            />
          </div>
        </div>

        {/* Save indicator */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="icon"
            className="h-6 w-6 bg-[#004d98] hover:bg-[#003d7a] text-white flex-shrink-0"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white"></div>
            ) : (
              <Save className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Expand/Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
          {/* Image Upload */}
          <div className="w-full h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative group">
            {exercise.image_url ? (
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-white/30" />
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-4 w-4 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageUpload(exercise.id, file);
                }}
              />
            </label>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(exercise.id)}
            className="w-full h-7 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs"
          >
            <Trash2 className="h-3 w-3 ml-1" />
            מחק תרגיל
          </Button>
        </div>
      )}
    </div>
  );
};
