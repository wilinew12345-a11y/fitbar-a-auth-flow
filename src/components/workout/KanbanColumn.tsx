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
  savingId,
  uploadingId,
  isMobile,
}: KanbanColumnProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  const columnContent = (
    <div
      ref={setNodeRef}
      className={`space-y-2 transition-colors ${
        isOver ? 'bg-white/5 rounded-lg p-1' : ''
      }`}
    >
      <SortableContext items={exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
        {exercises.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-xs border border-dashed border-white/20 rounded-lg">
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
              isSaving={savingId === exercise.id}
              isUploading={uploadingId === exercise.id}
            />
          ))
        )}
      </SortableContext>
    </div>
  );

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Clickable Header - No Icons */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between py-2 px-3 bg-white/10 rounded-lg mb-1 cursor-pointer hover:bg-white/15 transition-colors"
        >
          <span className="font-medium text-sm text-white">{categoryLabel}</span>
          <span className="text-[10px] text-white/60 bg-white/20 px-1.5 py-0.5 rounded-full">
            {exercises.length}
          </span>
        </div>
        {/* Content - Hidden but not unmounted when collapsed */}
        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[2000px] opacity-100 pt-1 pb-2' : 'max-h-0 opacity-0'}`}>
          {columnContent}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col max-h-[calc(100vh-220px)]">
      {/* Clickable Header - No Icons */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-2 border-b border-white/10 flex-shrink-0 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <h3 className="font-semibold text-white text-xs">{categoryLabel}</h3>
        <span className="text-[10px] text-white/60 bg-white/20 px-1.5 py-0.5 rounded-full">
          {exercises.length}
        </span>
      </div>
      
      {/* Content - Hidden but not unmounted when collapsed */}
      <div className={`flex-1 overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[calc(100vh-280px)] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="overflow-y-auto p-2 min-h-[60px] h-full">
          {columnContent}
        </div>
      </div>
    </div>
  );
};
