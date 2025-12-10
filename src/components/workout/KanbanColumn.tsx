import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ExerciseCard, Exercise } from './ExerciseCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  const columnContent = (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] space-y-3 transition-colors ${
        isOver ? 'bg-white/5 rounded-lg' : ''
      }`}
    >
      <SortableContext items={exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
        {exercises.length === 0 ? (
          <div className="text-center py-6 text-white/40 text-sm border-2 border-dashed border-white/20 rounded-lg">
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
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={category} className="border-white/20">
          <AccordionTrigger className="text-white hover:no-underline py-3 px-4 bg-white/10 rounded-lg mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{categoryLabel}</span>
              <span className="text-xs text-white/60 bg-white/20 px-2 py-0.5 rounded-full">
                {exercises.length}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            {columnContent}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-white text-sm">{categoryLabel}</h3>
        <span className="text-xs text-white/60 bg-white/20 px-2 py-0.5 rounded-full">
          {exercises.length}
        </span>
      </div>
      {columnContent}
    </div>
  );
};
