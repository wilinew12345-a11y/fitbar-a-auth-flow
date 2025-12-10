import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Trash2, Upload, Image as ImageIcon, Save } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  body_part: string;
  weight: number;
  sets: number;
  reps: number;
  image_url: string | null;
}

const WorkoutLog = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // New exercise form state
  const [newExercise, setNewExercise] = useState({
    name: '',
    body_part: '',
  });

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

  const handleAddExercise = async () => {
    if (!user || !newExercise.name.trim() || !newExercise.body_part.trim()) {
      toast({ title: 'נא למלא שם תרגיל וחלק גוף', variant: 'destructive' });
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
      <header className="p-4 md:p-6 flex items-center justify-between">
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

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">יומן אימונים</h1>

        {/* Add New Exercise Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">הוסף תרגיל חדש</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-white/80 text-sm">שם התרגיל</Label>
              <Input
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="לדוגמה: לחיצת חזה"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <Label className="text-white/80 text-sm">חלק גוף</Label>
              <Input
                value={newExercise.body_part}
                onChange={(e) => setNewExercise({ ...newExercise, body_part: e.target.value })}
                placeholder="לדוגמה: חזה"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>
          <Button
            onClick={handleAddExercise}
            className="w-full bg-[#a50044] hover:bg-[#8a0039] text-white"
          >
            <Plus className="h-5 w-5 ml-2" />
            הוסף תרגיל
          </Button>
        </div>

        {/* Exercises List */}
        <div className="space-y-6">
          {exercises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">אין תרגילים עדיין. הוסף את התרגיל הראשון שלך!</p>
            </div>
          ) : (
            exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={handleUpdateExercise}
                onDelete={handleDeleteExercise}
                onImageUpload={handleImageUpload}
                isSaving={savingId === exercise.id}
                isUploading={uploadingId === exercise.id}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (id: string, updates: Partial<Exercise>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onImageUpload: (id: string, file: File) => Promise<void>;
  isSaving: boolean;
  isUploading: boolean;
}

const ExerciseCard = ({ exercise, onUpdate, onDelete, onImageUpload, isSaving, isUploading }: ExerciseCardProps) => {
  const [localValues, setLocalValues] = useState({
    body_part: exercise.body_part,
    weight: exercise.weight,
    sets: exercise.sets,
    reps: exercise.reps,
  });

  const hasChanges = 
    localValues.body_part !== exercise.body_part ||
    localValues.weight !== exercise.weight ||
    localValues.sets !== exercise.sets ||
    localValues.reps !== exercise.reps;

  const handleSave = () => {
    onUpdate(exercise.id, localValues);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 transition-all hover:bg-white/15">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image Section */}
        <div className="flex-shrink-0">
          <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative group">
            {exercise.image_url ? (
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white/30" />
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-6 w-6 text-white" />
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

        {/* Content Section */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(exercise.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Input Fields Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-white/60 text-xs mb-1 block">חלק גוף</Label>
              <Input
                value={localValues.body_part}
                onChange={(e) => setLocalValues({ ...localValues, body_part: e.target.value })}
                className="bg-white/10 border-white/20 text-white text-sm h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-1 block">משקל (ק״ג)</Label>
              <Input
                type="number"
                value={localValues.weight}
                onChange={(e) => setLocalValues({ ...localValues, weight: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white text-sm h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-1 block">סטים</Label>
              <Input
                type="number"
                value={localValues.sets}
                onChange={(e) => setLocalValues({ ...localValues, sets: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white text-sm h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-1 block">חזרות</Label>
              <Input
                type="number"
                value={localValues.reps}
                onChange={(e) => setLocalValues({ ...localValues, reps: Number(e.target.value) })}
                className="bg-white/10 border-white/20 text-white text-sm h-10"
              />
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-4 bg-[#004d98] hover:bg-[#003d7a] text-white"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ml-2"></div>
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              שמור שינויים
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutLog;
