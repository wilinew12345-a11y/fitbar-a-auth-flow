import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, Image as ImageIcon, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { NumberInput } from './NumberInput';
export interface Exercise {
  id: string;
  name: string;
  body_part: string;
  weight: number;
  sets: number;
  reps: number;
  speed?: number;
  incline?: number;
  duration?: number;
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
  const isAerobic = exercise.body_part === 'אירובי';
  
  const [localValues, setLocalValues] = useState({
    weight: exercise.weight,
    sets: exercise.sets,
    reps: exercise.reps,
    speed: exercise.speed || 0,
    incline: exercise.incline || 0,
    duration: exercise.duration || 0,
  });

  // Sync local values when exercise prop changes
  useEffect(() => {
    setLocalValues({
      weight: exercise.weight,
      sets: exercise.sets,
      reps: exercise.reps,
      speed: exercise.speed || 0,
      incline: exercise.incline || 0,
      duration: exercise.duration || 0,
    });
  }, [exercise.weight, exercise.sets, exercise.reps, exercise.speed, exercise.incline, exercise.duration]);

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
  const handleBlur = (field: 'weight' | 'sets' | 'reps' | 'speed' | 'incline' | 'duration') => {
    const exerciseValue = exercise[field as keyof Exercise] ?? 0;
    if (localValues[field] !== exerciseValue) {
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
      {/* Title Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span 
          className="text-sm font-semibold text-white truncate flex-1" 
          title={exercise.name}
        >
          {exercise.name}
        </span>
        
        {/* Controls: Drag Handle + Expand + Delete */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div
            data-drag-handle="true"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-white/40 hover:text-white/70 touch-none rounded hover:bg-white/10"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="h-4 w-4 pointer-events-none" />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(exercise.id)}
            className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Input Fields Row */}
      <div 
        className="flex items-center justify-center gap-1 relative z-10"
        onPointerDown={stopDragPropagation}
        onMouseDown={stopDragPropagation}
        onTouchStart={stopDragPropagation}
        onKeyDown={stopDragPropagation}
      >
        {isAerobic ? (
          <>
            <NumberInput
              label="מהירות"
              value={localValues.speed}
              onChange={(val) => setLocalValues({ ...localValues, speed: val })}
              onBlur={() => handleBlur('speed')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              step={0.5}
            />
            <NumberInput
              label="שיפוע"
              value={localValues.incline}
              onChange={(val) => setLocalValues({ ...localValues, incline: val })}
              onBlur={() => handleBlur('incline')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              step={0.5}
            />
            <NumberInput
              label="זמן"
              value={localValues.duration}
              onChange={(val) => setLocalValues({ ...localValues, duration: val })}
              onBlur={() => handleBlur('duration')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
            />
          </>
        ) : (
          <>
            <NumberInput
              label="משקל"
              value={localValues.weight}
              onChange={(val) => setLocalValues({ ...localValues, weight: val })}
              onBlur={() => handleBlur('weight')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              step={2.5}
            />
            <NumberInput
              label="סטים"
              value={localValues.sets}
              onChange={(val) => setLocalValues({ ...localValues, sets: val })}
              onBlur={() => handleBlur('sets')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
            />
            <NumberInput
              label="חזרות"
              value={localValues.reps}
              onChange={(val) => setLocalValues({ ...localValues, reps: val })}
              onBlur={() => handleBlur('reps')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
            />
          </>
        )}
      </div>

      {/* Saving Indicator */}
      {isSaving && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/60">
          <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white/60"></div>
          שומר...
        </div>
      )}

      {/* Expanded Content - uses flow layout, no absolute positioning */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="w-full h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 relative group">
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
        </div>
      )}
    </div>
  );
};
