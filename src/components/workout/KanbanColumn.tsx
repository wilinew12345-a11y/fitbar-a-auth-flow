import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ExerciseCard, Exercise } from './ExerciseCard';

interface KanbanColumnProps {
  category: string;
  categoryLabel: string;
  exercises: Exercise[];
  onUpdate: (id: string, updates: Partial<Exercise>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onImageUpload: (id: string, file: File) => Promise<void>;
  onMediaDelete: (id: string, mediaUrl: string) => Promise<void>;
  savingId: string | null;
  uploadingId: string | null;
  isMobile: boolean;
}

export const KanbanColumn = ({
  category,
  categoryLabel,
  exercises,
  onUpdate,
  onDelete,
  onImageUpload,
  onMediaDelete,
  savingId,
  uploadingId,
}: KanbanColumnProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  const columnContent = (
    <div
      ref={setNodeRef}
      className={`space-y-3 transition-colors ${
        isOver ? 'bg-white/5 rounded-lg p-2' : 'p-2'
      }`}
    >
      <SortableContext items={exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
        {exercises.length === 0 ? (
          <div className="text-center py-6 text-white/40 text-sm border border-dashed border-white/20 rounded-xl">
            גרור תרגילים לכאן
          </div>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onImageUpload={onImageUpload}
              onMediaDelete={onMediaDelete}
              isSaving={savingId === exercise.id}
              isUploading={uploadingId === exercise.id}
            />
          ))
        )}
      </SortableContext>
    </div>
  );

  return (
    <div className="w-full">
      {/* Premium Glass Card Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center justify-between py-4 px-5
          bg-slate-800/50 backdrop-blur-md
          border rounded-xl
          cursor-pointer
          transition-all duration-300 ease-out
          ${isExpanded 
            ? 'border-[#a50044]/60 bg-slate-800/70 rounded-b-none' 
            : 'border-white/10 hover:border-[#a50044]/40 hover:bg-slate-800/60'
          }
        `}
      >
        <span className="font-semibold text-base text-white tracking-wide">{categoryLabel}</span>
        <span className={`
          text-xs font-medium px-2.5 py-1 rounded-full
          transition-colors duration-300
          ${exercises.length > 0 
            ? 'bg-[#a50044]/80 text-white' 
            : 'bg-white/10 text-white/60'
          }
        `}>
          {exercises.length}
        </span>
      </div>
      
      {/* Expandable Content with Smooth Animation */}
      <div 
        className={`
          overflow-hidden
          transition-all duration-300 ease-out
          ${isExpanded 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
          }
        `}
      >
        <div className="bg-slate-900/40 backdrop-blur-sm border-x border-b border-white/10 rounded-b-xl">
          {columnContent}
        </div>
      </div>
    </div>
  );
};
