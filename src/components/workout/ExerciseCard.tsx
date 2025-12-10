import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload, Image as ImageIcon, Save, GripVertical } from 'lucide-react';

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
      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 transition-all hover:bg-white/15"
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-white/50 hover:text-white/80 touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-white truncate">{exercise.name}</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(exercise.id)}
              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Image */}
          <div className="w-full h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative group mb-2">
            {exercise.image_url ? (
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-white/30" />
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-5 w-5 text-white" />
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

          {/* Input Fields */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-white/60 text-[10px] mb-0.5 block">משקל</Label>
              <Input
                type="number"
                value={localValues.weight}
                onChange={(e) => setLocalValues({ ...localValues, weight: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white text-xs h-8 px-2"
              />
            </div>
            <div>
              <Label className="text-white/60 text-[10px] mb-0.5 block">סטים</Label>
              <Input
                type="number"
                value={localValues.sets}
                onChange={(e) => setLocalValues({ ...localValues, sets: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white text-xs h-8 px-2"
              />
            </div>
            <div>
              <Label className="text-white/60 text-[10px] mb-0.5 block">חזרות</Label>
              <Input
                type="number"
                value={localValues.reps}
                onChange={(e) => setLocalValues({ ...localValues, reps: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white text-xs h-8 px-2"
              />
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="mt-2 w-full bg-[#004d98] hover:bg-[#003d7a] text-white h-8 text-xs"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white ml-1"></div>
              ) : (
                <Save className="h-3 w-3 ml-1" />
              )}
              שמור
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
