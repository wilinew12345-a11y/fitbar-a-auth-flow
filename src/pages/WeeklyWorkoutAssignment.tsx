import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import FitBarcaLogo from "@/components/FitBarcaLogo";
import { Plus, Trash2, Pencil, X, Loader2, RotateCcw, ArrowRight } from "lucide-react";

// Days of week in Hebrew
const DAYS_OF_WEEK = [
  { key: 'sunday', label: 'ראשון', short: 'א' },
  { key: 'monday', label: 'שני', short: 'ב' },
  { key: 'tuesday', label: 'שלישי', short: 'ג' },
  { key: 'wednesday', label: 'רביעי', short: 'ד' },
  { key: 'thursday', label: 'חמישי', short: 'ה' },
  { key: 'friday', label: 'שישי', short: 'ו' },
  { key: 'saturday', label: 'שבת', short: 'ש' },
];

// Muscle groups
const MUSCLE_GROUPS = [
  { key: 'chest', label: 'חזה' },
  { key: 'triceps', label: 'יד אחורית' },
  { key: 'biceps', label: 'יד קדמית' },
  { key: 'back', label: 'גב' },
  { key: 'legs', label: 'רגליים' },
  { key: 'shoulders', label: 'כתפיים' },
  { key: 'abs', label: 'בטן' },
  { key: 'stretch', label: 'מתח' },
  { key: 'aerobic', label: 'אירובי' },
  { key: 'fullbody', label: 'Full Body' },
];

interface Schedule {
  id: string;
  day_of_week: string;
  workout_types: string[];
}

const WeeklyWorkoutAssignment = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check auth and fetch schedules
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      await fetchSchedules();
      setLoading(false);
    };
    checkAuthAndFetch();
  }, [navigate]);

  const fetchSchedules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('weekly_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
      return;
    }

    setSchedules(data || []);
  };

  const handleDaySelect = (dayKey: string) => {
    setSelectedDay(dayKey === selectedDay ? null : dayKey);
  };

  const handleMuscleToggle = (muscleKey: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscleKey)
        ? prev.filter(m => m !== muscleKey)
        : [...prev, muscleKey]
    );
  };

  const handleAddToSchedule = async () => {
    if (!selectedDay || selectedMuscles.length === 0) {
      toast({
        title: "שגיאה",
        description: "יש לבחור יום וקבוצות שרירים",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('weekly_schedules')
          .update({
            day_of_week: selectedDay,
            workout_types: selectedMuscles,
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({ title: "האימון עודכן בהצלחה!" });
        setEditingId(null);
      } else {
        // Check if day already has a schedule
        const existingSchedule = schedules.find(s => s.day_of_week === selectedDay);
        
        if (existingSchedule) {
          // Update existing schedule for this day
          const { error } = await supabase
            .from('weekly_schedules')
            .update({
              workout_types: selectedMuscles,
            })
            .eq('id', existingSchedule.id);

          if (error) throw error;
          toast({ title: "האימון עודכן בהצלחה!" });
        } else {
          // Insert new
          const { error } = await supabase
            .from('weekly_schedules')
            .insert({
              user_id: user.id,
              day_of_week: selectedDay,
              workout_types: selectedMuscles,
            });

          if (error) throw error;
          toast({ title: "האימון נוסף בהצלחה!" });
        }
      }

      await fetchSchedules();
      setSelectedDay(null);
      setSelectedMuscles([]);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "שגיאה בשמירה",
        description: "נסה שוב",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedDay(schedule.day_of_week);
    setSelectedMuscles(schedule.workout_types);
    setEditingId(schedule.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('weekly_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "שגיאה במחיקה",
        description: "נסה שוב",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "האימון נמחק" });
    await fetchSchedules();
  };

  const handleResetAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('weekly_schedules')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "שגיאה באיפוס",
        description: "נסה שוב",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "כל האימונים נמחקו" });
    setSchedules([]);
    setSelectedDay(null);
    setSelectedMuscles([]);
    setEditingId(null);
  };

  const getDayLabel = (dayKey: string) => {
    return DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
  };

  const getMuscleLabels = (muscleKeys: string[]) => {
    return muscleKeys
      .map(key => MUSCLE_GROUPS.find(m => m.key === key)?.label || key)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-barca">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-barca p-4 overflow-auto" dir="rtl">
      <div className="max-w-2xl mx-auto py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <FitBarcaLogo size="md" />
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowRight className="h-5 w-5 ml-2" />
            חזרה
          </Button>
        </div>

        {/* Builder Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl animate-slide-up-delay-1">
          {/* Day Selector */}
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">1. בחר יום בשבוע:</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.key}
                  onClick={() => handleDaySelect(day.key)}
                  className={`
                    w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                    ${selectedDay === day.key
                      ? 'bg-[hsl(45,100%,50%)] text-[hsl(213,100%,20%)] scale-110 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }
                  `}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Selector */}
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">2. סמן את קבוצות השרירים לאימון:</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle.key}
                  onClick={() => handleMuscleToggle(muscle.key)}
                  className={`
                    px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${selectedMuscles.includes(muscle.key)
                      ? 'bg-[hsl(213,100%,50%)] text-white shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }
                  `}
                >
                  {muscle.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAddToSchedule}
              disabled={saving || !selectedDay || selectedMuscles.length === 0}
              className="bg-[hsl(345,100%,32%)] hover:bg-[hsl(345,100%,40%)] text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  {editingId ? 'עדכן אימון' : 'הוסף לאימונים שלי'}
                </>
              )}
            </Button>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setSelectedDay(null);
                  setSelectedMuscles([]);
                }}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5 mr-1" />
                ביטול
              </Button>
            )}
          </div>
        </div>

        {/* Schedule Display */}
        <div className="mt-8 animate-slide-up-delay-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">התוכנית שלי:</h2>
            {schedules.length > 0 && (
              <Button
                onClick={handleResetAll}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                איפוס הכל
              </Button>
            )}
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
              <p className="text-white/60">עדיין לא הוספת אימונים. בחר יום ושרירים והוסף לרשימה!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-white font-bold text-lg">יום {getDayLabel(schedule.day_of_week)}</h3>
                    <p className="text-white/80 mt-1">• {getMuscleLabels(schedule.workout_types)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-[hsl(345,100%,32%)] text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        {schedules.length > 0 && (
          <div className="mt-8 text-center animate-slide-up-delay-2">
            <Button
              onClick={() => navigate('/workout-log')}
              className="bg-[hsl(213,100%,30%)] hover:bg-[hsl(213,100%,40%)] text-white px-12 py-6 text-lg font-bold rounded-xl shadow-lg"
            >
              המשך לשלב הבא
            </Button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">שלב 2 מתוך 3</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyWorkoutAssignment;
