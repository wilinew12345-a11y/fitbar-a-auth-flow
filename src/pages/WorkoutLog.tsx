import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FitBarcaLogo from '@/components/FitBarcaLogo';
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
import { ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { KanbanColumn } from '@/components/workout/KanbanColumn';
import { ExerciseCard, Exercise } from '@/components/workout/ExerciseCard';

const BODY_PART_CATEGORIES = [
  { key: 'חזה', label: 'חזה (Chest)' },
  { key: 'יד אחורית', label: 'יד אחורית (Triceps)' },
  { key: 'יד קדמית', label: 'יד קדמית (Biceps)' },
  { key: 'גב', label: 'גב (Back)' },
  { key: 'כתפיים', label: 'כתפיים (Shoulders)' },
  { key: 'רגליים', label: 'רגליים (Legs)' },
  { key: 'בטן', label: 'בטן (Abs)' },
  { key: 'מתח', label: 'מתח (Pull-ups)' },
  { key: 'Full Body', label: 'Full Body' },
];

const WorkoutLog = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const [newExercise, setNewExercise] = useState({
    name: '',
    body_part: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

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
      toast({ title: 'שגיאה בטעינת התרגילים', variant: 'destructive' });
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
  }, [exercises]);

  const handleAddExercise = async () => {
    if (!user || !newExercise.name.trim() || !newExercise.body_part) {
      toast({ title: 'נא למלא שם תרגיל ולבחור קטגוריה', variant: 'destructive' });
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
      toast({ title: 'שגיאה בהוספת התרגיל', variant: 'destructive' });
    } else {
      setExercises([data, ...exercises]);
      setNewExercise({ name: '', body_part: '' });
      toast({ title: 'התרגיל נוסף בהצלחה!' });
    }
  };

  const handleUpdateExercise = async (id: string, updates: Partial<Exercise>) => {
    setSavingId(id);
    
    const { error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'שגיאה בעדכון התרגיל', variant: 'destructive' });
    } else {
      setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
      toast({ title: 'נשמר!' });
    }
    setSavingId(null);
  };

  const handleDeleteExercise = async (id: string) => {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'שגיאה במחיקת התרגיל', variant: 'destructive' });
    } else {
      setExercises(exercises.filter(ex => ex.id !== id));
      toast({ title: 'התרגיל נמחק' });
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
      toast({ title: 'שגיאה בהעלאת התמונה', variant: 'destructive' });
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
      toast({ title: 'שגיאה בעדכון הקטגוריה', variant: 'destructive' });
    } else {
      toast({ title: `התרגיל הועבר ל${newCategory}` });
    }
  };

  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      toast({ title: 'אין תרגילים לשמור', variant: 'destructive' });
      return;
    }

    setIsFinishing(true);

    const historyRecords = exercises.map(ex => ({
      user_id: user!.id,
      exercise_name: ex.name,
      weight: ex.weight || 0,
      sets: ex.sets || 0,
      reps: ex.reps || 0,
    }));

    const { error } = await supabase
      .from('workout_history')
      .insert(historyRecords);

    if (error) {
      toast({ title: 'שגיאה בשמירת האימון', variant: 'destructive' });
    } else {
      toast({ title: 'האימון נשמר! 💪' });
    }

    setIsFinishing(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044]" dir="rtl">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between sticky top-0 z-50 bg-gradient-to-b from-[#004d98]/90 to-transparent backdrop-blur-sm">
        <FitBarcaLogo />
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowRight className="h-5 w-5 ml-2" />
          חזרה
        </Button>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">יומן אימונים</h1>

        {/* Add New Exercise Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">הוסף תרגיל חדש</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">שם התרגיל</Label>
              <Input
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="לדוגמה: לחיצת חזה"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">קטגוריה</Label>
              <Select
                value={newExercise.body_part}
                onValueChange={(value) => setNewExercise({ ...newExercise, body_part: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-10">
                  <SelectValue placeholder="בחר קטגוריה" />
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
              <Label className="text-white/80 text-sm invisible">פעולה</Label>
              <Button
                onClick={handleAddExercise}
                className="w-full bg-[#a50044] hover:bg-[#8a0039] text-white h-10"
              >
                <Plus className="h-5 w-5 ml-2" />
                הוסף תרגיל
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
          <Button
            onClick={handleFinishWorkout}
            disabled={isFinishing || exercises.length === 0}
            className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg"
          >
            <CheckCircle className="h-6 w-6 ml-2" />
            {isFinishing ? 'שומר...' : 'סיום אימון'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WorkoutLog;
