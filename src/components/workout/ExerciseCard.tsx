import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, Image as ImageIcon, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

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

  // Sync local values when exercise prop changes
  useEffect(() => {
    setLocalValues({
      weight: exercise.weight,
      sets: exercise.sets,
      reps: exercise.reps,
    });
  }, [exercise.weight, exercise.sets, exercise.reps]);

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

  // Auto-save on blur if values changed
  const handleBlur = (field: 'weight' | 'sets' | 'reps') => {
    if (localValues[field] !== exercise[field]) {
      onUpdate(exercise.id, { [field]: localValues[field] });
    }
  };

  // Prevent drag events from interfering with inputs
  const stopDragPropagation = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 transition-all hover:bg-white/15"
    >
      {/* Header Row: Name | Inputs | Controls */}
      <div className="flex items-center gap-3">
        {/* Exercise Name - Left */}
        <span 
          className="text-sm font-semibold text-white truncate min-w-0 flex-shrink-0 max-w-[100px]" 
          title={exercise.name}
        >
          {exercise.name}
        </span>

        {/* Input Fields - Center (isolated from drag) */}
        <div 
          className="flex items-center gap-2 flex-1 justify-center relative z-10"
          onPointerDown={stopDragPropagation}
          onMouseDown={stopDragPropagation}
          onTouchStart={stopDragPropagation}
          onKeyDown={stopDragPropagation}
        >
          {/* Weight Input */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">משקל</span>
            <input
              type="number"
              value={localValues.weight || ''}
              onChange={(e) => setLocalValues({ ...localValues, weight: Number(e.target.value) || 0 })}
              onBlur={() => handleBlur('weight')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              placeholder="0"
              className="min-w-[55px] w-[55px] h-8 bg-white/20 border border-white/30 rounded-lg text-white text-center text-sm font-medium placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#004d98] focus:border-transparent"
            />
          </div>

          {/* Sets Input */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">סטים</span>
            <input
              type="number"
              value={localValues.sets || ''}
              onChange={(e) => setLocalValues({ ...localValues, sets: Number(e.target.value) || 0 })}
              onBlur={() => handleBlur('sets')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              placeholder="0"
              className="min-w-[55px] w-[55px] h-8 bg-white/20 border border-white/30 rounded-lg text-white text-center text-sm font-medium placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#004d98] focus:border-transparent"
            />
          </div>

          {/* Reps Input */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-white/50">חזרות</span>
            <input
              type="number"
              value={localValues.reps || ''}
              onChange={(e) => setLocalValues({ ...localValues, reps: Number(e.target.value) || 0 })}
              onBlur={() => handleBlur('reps')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              placeholder="0"
              className="min-w-[55px] w-[55px] h-8 bg-white/20 border border-white/30 rounded-lg text-white text-center text-sm font-medium placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#004d98] focus:border-transparent"
            />
          </div>
        </div>

        {/* Controls - Right: Drag Handle + Expand */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Drag Handle */}
          <div
            data-drag-handle="true"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 text-white/40 hover:text-white/70 touch-none rounded hover:bg-white/10"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="h-5 w-5 pointer-events-none" />
          </div>

          {/* Expand/Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Saving Indicator */}
      {isSaving && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/60">
          <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white/60"></div>
          שומר...
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
          {/* Image Upload */}
          <div className="w-full h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative group">
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

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(exercise.id)}
            className="w-full h-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs"
          >
            <Trash2 className="h-4 w-4 ml-1" />
            מחק תרגיל
          </Button>
        </div>
      )}
    </div>
  );
};
