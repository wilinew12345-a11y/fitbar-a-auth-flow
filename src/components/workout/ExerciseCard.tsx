import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, GripVertical, ChevronDown, ChevronUp, Maximize2, X } from 'lucide-react';
import { NumberInput } from './NumberInput';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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

// Helper function to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.quicktime'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

export const ExerciseCard = ({ 
  exercise, 
  onUpdate, 
  onDelete, 
  onImageUpload, 
  isSaving, 
  isUploading 
}: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isAerobic = exercise.body_part === 'אירובי';
  
  const [localValues, setLocalValues] = useState({
    weight: exercise.weight,
    sets: exercise.sets,
    reps: exercise.reps,
    speed: exercise.speed || 0,
    incline: exercise.incline || 0,
    duration: exercise.duration || 0,
  });

  // Stop video when modal closes
  useEffect(() => {
    if (!isMediaOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isMediaOpen]);

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

  // Auto-save on blur - always save to ensure consistency
  const handleBlur = (field: 'weight' | 'sets' | 'reps' | 'speed' | 'incline' | 'duration') => {
    const exerciseValue = Number(exercise[field as keyof Exercise]) || 0;
    const localValue = Number(localValues[field]) || 0;
    // Compare with tolerance for floating point
    if (Math.abs(localValue - exerciseValue) > 0.001) {
      console.log(`Saving ${field}: ${exerciseValue} -> ${localValue}`);
      onUpdate(exercise.id, { [field]: localValue });
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
              onChange={(val) => setLocalValues(prev => ({ ...prev, speed: val }))}
              onBlur={() => handleBlur('speed')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              min={0}
              step={0.5}
            />
            <NumberInput
              label="שיפוע"
              value={localValues.incline}
              onChange={(val) => setLocalValues(prev => ({ ...prev, incline: val }))}
              onBlur={() => handleBlur('incline')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              min={0}
              step={0.5}
            />
            <NumberInput
              label="זמן"
              value={localValues.duration}
              onChange={(val) => setLocalValues(prev => ({ ...prev, duration: val }))}
              onBlur={() => handleBlur('duration')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              min={0}
              step={1}
            />
          </>
        ) : (
          <>
            <NumberInput
              label="משקל"
              value={localValues.weight}
              onChange={(val) => setLocalValues(prev => ({ ...prev, weight: val }))}
              onBlur={() => handleBlur('weight')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              min={0}
              step={2.5}
            />
            <NumberInput
              label="סטים"
              value={localValues.sets}
              onChange={(val) => setLocalValues(prev => ({ ...prev, sets: val }))}
              onBlur={() => handleBlur('sets')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              min={1}
              step={1}
            />
            <NumberInput
              label="חזרות"
              value={localValues.reps}
              onChange={(val) => setLocalValues(prev => ({ ...prev, reps: val }))}
              onBlur={() => handleBlur('reps')}
              onPointerDown={stopDragPropagation}
              onMouseDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
              min={1}
              step={1}
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

      {/* Expanded Content - Media Display */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {exercise.image_url ? (
            // Media exists - show it with modal capability
            <Dialog open={isMediaOpen} onOpenChange={setIsMediaOpen}>
              <div className="w-full rounded-lg overflow-hidden bg-black relative group">
                {/* Clickable thumbnail */}
                <DialogTrigger asChild>
                  <button className="w-full relative cursor-pointer focus:outline-none">
                    {isVideoUrl(exercise.image_url) ? (
                      <video
                        src={exercise.image_url}
                        className="w-full h-48 object-contain bg-black pointer-events-none"
                        muted
                      />
                    ) : (
                      <img
                        src={exercise.image_url}
                        alt={exercise.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {/* Expand overlay hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-2 rounded-full">
                        <Maximize2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                
                {/* Small overlay button to replace media */}
                <label className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 p-2 rounded-full cursor-pointer transition-colors z-10">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="h-4 w-4 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(exercise.id, file);
                    }}
                  />
                </label>
              </div>

              {/* Fullscreen Modal Content */}
              <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none overflow-hidden">
                <button
                  onClick={() => setIsMediaOpen(false)}
                  className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                
                <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
                  {isVideoUrl(exercise.image_url) ? (
                    <video
                      ref={videoRef}
                      src={exercise.image_url}
                      controls
                      autoPlay
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                  ) : (
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="max-w-full max-h-[90vh] object-contain"
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            // No media - show upload dropzone
            <label className="w-full h-32 rounded-lg bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-white/40 mb-2" />
                  <span className="text-xs text-white/40">העלה תמונה או וידאו</span>
                </>
              )}
              <input
                type="file"
                accept="image/*,video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageUpload(exercise.id, file);
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};
