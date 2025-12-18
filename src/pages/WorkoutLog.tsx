import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Plus, Check, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { KanbanColumn } from '@/components/workout/KanbanColumn';
import { ExerciseCard, Exercise } from '@/components/workout/ExerciseCard';

const WorkoutLog = () => {
  const { user, loading } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Track pending save operations to ensure they complete before finishing workout
  const pendingSavesRef = useRef<Map<string, Promise<void>>>(new Map());

  const [newExercise, setNewExercise] = useState({
    name: '',
    body_part: '',
  });

  // Body part categories with translations
  const BODY_PART_CATEGORIES = useMemo(() => [
    { key: 'חזה', label: t('chest') },
    { key: 'יד אחורית', label: t('triceps') },
    { key: 'יד קדמית', label: t('biceps') },
    { key: 'גב', label: t('backMuscle') },
    { key: 'כתפיים', label: t('shoulders') },
    { key: 'רגליים', label: t('legs') },
    { key: 'בטן', label: t('abs') },
    { key: 'מתח', label: t('pullups') },
    { key: 'Full Body', label: t('fullBody') },
    { key: 'אירובי', label: t('aerobic') },
  ], [t]);

  // Use MouseSensor with activation only from drag handle
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 8,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchExercises = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading exercises', variant: 'destructive' });
    } else {
      setExercises(data || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchExercises();
    }
  }, [user, fetchExercises]);

  // Group exercises by body_part
  const exercisesByCategory = useMemo(() => {
    const grouped: Record<string, Exercise[]> = {};
    BODY_PART_CATEGORIES.forEach(cat => {
      grouped[cat.key] = exercises.filter(ex => ex.body_part === cat.key);
    });
    return grouped;
  }, [exercises, BODY_PART_CATEGORIES]);

  const handleAddExercise = async () => {
    if (!user || !newExercise.name.trim() || !newExercise.body_part) {
      toast({ title: 'Please fill exercise name and select category', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('exercises')
      .insert({
        user_id: user.id,
        name: newExercise.name,
        body_part: newExercise.body_part,
        weight: 0,
        sets: 0,
        reps: 0,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding exercise', variant: 'destructive' });
    } else {
      setExercises([data, ...exercises]);
      setNewExercise({ name: '', body_part: '' });
      toast({ title: t('exerciseAdded') });
    }
  };

  const handleUpdateExercise = async (id: string, updates: Partial<Exercise>) => {
    setSavingId(id);
    
    // Ensure numeric values are properly converted
    const sanitizedUpdates: Partial<Exercise> = { ...updates };
    if ('weight' in updates) sanitizedUpdates.weight = Number(updates.weight) || 0;
    if ('sets' in updates) sanitizedUpdates.sets = Number(updates.sets) || 0;
    if ('reps' in updates) sanitizedUpdates.reps = Number(updates.reps) || 0;
    if ('speed' in updates) sanitizedUpdates.speed = Number(updates.speed) || 0;
    if ('incline' in updates) sanitizedUpdates.incline = Number(updates.incline) || 0;
    if ('duration' in updates) sanitizedUpdates.duration = Number(updates.duration) || 0;

    console.log('Updating exercise:', id, 'with:', sanitizedUpdates);
    
    // Create the save promise and track it
    const savePromise = (async () => {
      const { error } = await supabase
        .from('exercises')
        .update(sanitizedUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating exercise:', error);
        toast({ title: t('errorSavingExercise'), variant: 'destructive' });
        throw error;
      } else {
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...sanitizedUpdates } : ex));
        console.log('Exercise saved successfully:', id);
      }
    })();

    // Track this save operation
    pendingSavesRef.current.set(id, savePromise);

    try {
      await savePromise;
    } finally {
      // Remove from pending saves when complete
      pendingSavesRef.current.delete(id);
      setSavingId(null);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting exercise', variant: 'destructive' });
    } else {
      setExercises(exercises.filter(ex => ex.id !== id));
      toast({ title: 'Exercise deleted' });
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    if (!user) return;
    
    setUploadingId(id);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('exercise_images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Error uploading image', variant: 'destructive' });
      setUploadingId(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('exercise_images')
      .getPublicUrl(fileName);

    await handleUpdateExercise(id, { image_url: urlData.publicUrl });
    setUploadingId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const exercise = exercises.find(ex => ex.id === event.active.id);
    setActiveExercise(exercise || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveExercise(null);

    if (!over) return;

    const exerciseId = active.id as string;
    const newCategory = over.id as string;
    
    // Check if dropped on a category column
    const isCategory = BODY_PART_CATEGORIES.some(cat => cat.key === newCategory);
    if (!isCategory) return;

    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise || exercise.body_part === newCategory) return;

    // Optimistic update
    setExercises(prev => 
      prev.map(ex => ex.id === exerciseId ? { ...ex, body_part: newCategory } : ex)
    );

    // Update in database
    const { error } = await supabase
      .from('exercises')
      .update({ body_part: newCategory })
      .eq('id', exerciseId);

    if (error) {
      // Revert on error
      setExercises(prev =>
        prev.map(ex => ex.id === exerciseId ? { ...ex, body_part: exercise.body_part } : ex)
      );
      toast({ title: 'Error updating category', variant: 'destructive' });
    } else {
      toast({ title: `${t('movedTo')} ${newCategory}` });
    }
  };

  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      toast({ title: t('noExercisesToSave'), variant: 'destructive' });
      return;
    }

    setIsFinishing(true);

    try {
      // Step 1: Blur any focused input to trigger pending saves
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Step 2: Wait a moment for any blur-triggered saves to start
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 3: Wait for ALL pending save operations to complete
      const pendingSaves = Array.from(pendingSavesRef.current.values());
      if (pendingSaves.length > 0) {
        console.log(`Waiting for ${pendingSaves.length} pending saves to complete...`);
        await Promise.allSettled(pendingSaves);
      }

      // Step 4: Additional delay to ensure DB is consistent
      await new Promise(resolve => setTimeout(resolve, 200));

      // Step 5: Fetch the absolute latest data from database
      const { data: latestExercises, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user!.id);

      if (fetchError) {
        console.error('Error fetching exercises:', fetchError);
        throw new Error('Error loading data');
      }

      if (!latestExercises || latestExercises.length === 0) {
        toast({ title: t('noExercisesToSave'), variant: 'destructive' });
        setIsFinishing(false);
        return;
      }

      console.log('Saving workout history with data:', latestExercises);

      // Step 6: Create history records
      const historyRecords = latestExercises.map(ex => ({
        user_id: user!.id,
        exercise_name: ex.name,
        weight: Number(ex.weight) || 0,
        sets: Number(ex.sets) || 0,
        reps: Number(ex.reps) || 0,
      }));

      // Step 7: Insert into workout_history
      const { error: insertError } = await supabase
        .from('workout_history')
        .insert(historyRecords);

      if (insertError) {
        console.error('Error inserting workout history:', insertError);
        throw new Error('Error saving workout');
      }

      // Step 8: Update local state with fresh data
      setExercises(latestExercises);

      toast({ title: t('workoutSaved') });
    } catch (error) {
      console.error('Finish workout error:', error);
      toast({ 
        title: error instanceof Error ? error.message : 'Error saving workout', 
        variant: 'destructive' 
      });
    } finally {
      setIsFinishing(false);
    }
  };

  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between sticky top-0 z-50 bg-gradient-to-b from-[#004d98]/90 to-transparent backdrop-blur-sm">
        <FitBarcaLogo />
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <BackIcon className="h-5 w-5 mx-2" />
            {t('back')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">{t('workoutLog')}</h1>

        {/* Add New Exercise Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">{t('addNewExercise')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">{t('exerciseName')}</Label>
              <Input
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g. Bench Press"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">{t('category')}</Label>
              <Select
                value={newExercise.body_part}
                onValueChange={(value) => setNewExercise({ ...newExercise, body_part: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2a4a] border-white/20">
                  {BODY_PART_CATEGORIES.map((cat) => (
                    <SelectItem 
                      key={cat.key} 
                      value={cat.key}
                      className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-sm invisible">Action</Label>
              <Button
                onClick={handleAddExercise}
                className="w-full bg-[#a50044] hover:bg-[#8a0039] text-white h-10"
              >
                <Plus className="h-5 w-5 mx-2" />
                {t('addExercise')}
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {isMobile ? (
            // Mobile: Accordions
            <div className="space-y-2">
              {BODY_PART_CATEGORIES.map((cat) => (
                <KanbanColumn
                  key={cat.key}
                  category={cat.key}
                  categoryLabel={cat.label}
                  exercises={exercisesByCategory[cat.key]}
                  onUpdate={handleUpdateExercise}
                  onDelete={handleDeleteExercise}
                  onImageUpload={handleImageUpload}
                  savingId={savingId}
                  uploadingId={uploadingId}
                  isMobile={true}
                />
              ))}
            </div>
          ) : (
            // Desktop: Grid columns
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {BODY_PART_CATEGORIES.map((cat) => (
                <KanbanColumn
                  key={cat.key}
                  category={cat.key}
                  categoryLabel={cat.label}
                  exercises={exercisesByCategory[cat.key]}
                  onUpdate={handleUpdateExercise}
                  onDelete={handleDeleteExercise}
                  onImageUpload={handleImageUpload}
                  savingId={savingId}
                  uploadingId={uploadingId}
                  isMobile={false}
                />
              ))}
            </div>
          )}

          <DragOverlay>
            {activeExercise ? (
              <div className="opacity-80">
                <ExerciseCard
                  exercise={activeExercise}
                  onUpdate={async () => {}}
                  onDelete={async () => {}}
                  onImageUpload={async () => {}}
                  isSaving={false}
                  isUploading={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Finish Workout Button */}
        <div className="mt-8 flex justify-center pb-8">
          <button
            onClick={handleFinishWorkout}
            disabled={isFinishing || exercises.length === 0}
            className={`
              flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg
              ${isFinishing 
                ? 'bg-green-600/70 cursor-not-allowed' 
                : exercises.length === 0 
                  ? 'bg-green-600/50 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-xl active:scale-[0.98]'
              }
            `}
          >
            {isFinishing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{t('savingData')}</span>
              </>
            ) : (
              <>
                <Check className="w-6 h-6" />
                <span>{t('finishWorkout')}</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default WorkoutLog;
