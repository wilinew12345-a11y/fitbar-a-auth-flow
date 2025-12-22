import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FitBarcaLogo from "@/components/FitBarcaLogo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, RotateCcw, ArrowRight } from "lucide-react";
import MuscleRecommendation from "@/components/workout/MuscleRecommendation";
import { useLanguage } from "@/contexts/LanguageContext";

const DAYS_OF_WEEK = [
  { key: "sunday", label: "ראשון", short: "א'" },
  { key: "monday", label: "שני", short: "ב'" },
  { key: "tuesday", label: "שלישי", short: "ג'" },
  { key: "wednesday", label: "רביעי", short: "ד'" },
  { key: "thursday", label: "חמישי", short: "ה'" },
  { key: "friday", label: "שישי", short: "ו'" },
  { key: "saturday", label: "שבת", short: "ש'" },
];

const MUSCLE_GROUPS = [
  { key: "chest", label: "חזה" },
  { key: "back", label: "גב" },
  { key: "legs", label: "רגליים" },
  { key: "shoulders", label: "כתפיים" },
  { key: "front_arms", label: "יד קדמית" },
  { key: "back_arms", label: "יד אחורית" },
  { key: "abs", label: "בטן" },
  { key: "stretch", label: "מתח" },
  { key: "full_body", label: "Full Body" },
];

interface Schedule {
  id: string;
  day_of_week: string;
  workout_types: string[];
}

const WeeklyWorkoutPlan = () => {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      await fetchSchedules();
    };
    checkAuthAndFetch();
  }, [navigate]);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_schedules')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('שגיאה בטעינת התוכנית');
    } finally {
      setLoading(false);
    }
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
    if (!selectedDay) {
      toast.error('יש לבחור יום');
      return;
    }
    if (selectedMuscles.length === 0) {
      toast.error('יש לבחור לפחות שריר אחד');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingId) {
        // Update existing schedule
        const { error } = await supabase
          .from('weekly_schedules')
          .update({ 
            day_of_week: selectedDay, 
            workout_types: selectedMuscles 
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('האימון עודכן בהצלחה');
        setEditingId(null);
      } else {
        // Check if day already exists
        const existingSchedule = schedules.find(s => s.day_of_week === selectedDay);
        
        if (existingSchedule) {
          // Update existing day
          const { error } = await supabase
            .from('weekly_schedules')
            .update({ workout_types: selectedMuscles })
            .eq('id', existingSchedule.id);

          if (error) throw error;
          toast.success('האימון עודכן בהצלחה');
        } else {
          // Insert new schedule
          const { error } = await supabase
            .from('weekly_schedules')
            .insert({
              user_id: user.id,
              day_of_week: selectedDay,
              workout_types: selectedMuscles
            });

          if (error) throw error;
          toast.success('האימון נוסף בהצלחה');
        }
      }

      await fetchSchedules();
      setSelectedDay(null);
      setSelectedMuscles([]);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('שגיאה בשמירת האימון');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setSelectedDay(schedule.day_of_week);
    setSelectedMuscles(schedule.workout_types);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('האימון נמחק בהצלחה');
      await fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('שגיאה במחיקת האימון');
    }
  };

  const handleResetAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('weekly_schedules')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('כל האימונים נמחקו');
      setSchedules([]);
      setSelectedDay(null);
      setSelectedMuscles([]);
      setEditingId(null);
    } catch (error) {
      console.error('Error resetting schedules:', error);
      toast.error('שגיאה באיפוס התוכנית');
    }
  };

  const getDayLabel = (dayKey: string) => {
    const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
    return day ? day.label : dayKey;
  };

  const getMuscleLabels = (muscleKeys: string[]) => {
    return muscleKeys.map(key => {
      const muscle = MUSCLE_GROUPS.find(m => m.key === key);
      return muscle ? muscle.label : key;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004D98] via-[#003366] to-[#A50044]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004D98] via-[#003366] to-[#A50044] p-4 pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header with Back Button */}
      <div className="flex items-center justify-between pt-6 pb-4 max-w-2xl mx-auto">
        <FitBarcaLogo size="lg" />
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowRight className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2 rotate-180'}`} />
          {t('back')}
        </Button>
      </div>

      {/* Builder Section - Glassmorphism Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
          {/* Day Selector */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-3">{t('selectDayOfWeek')}</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.key}
                  onClick={() => handleDaySelect(day.key)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                    selectedDay === day.key
                      ? 'bg-white text-[#004D98] shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Selector */}
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-3">{t('selectMuscleGroups')}</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle.key}
                  onClick={() => handleMuscleToggle(muscle.key)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedMuscles.includes(muscle.key)
                      ? 'bg-white text-[#004D98] shadow-lg scale-105 ring-2 ring-barca-gold'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  {muscle.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Muscle Recommendation */}
          <div className="mb-6">
            <MuscleRecommendation selectedMuscles={selectedMuscles} />
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddToSchedule}
            disabled={saving || !selectedDay || selectedMuscles.length === 0}
            className="w-full bg-[#A50044] hover:bg-[#8A0039] text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mx-2" />
            {editingId ? t('updateWorkout') : t('addToMyWorkouts')}
          </Button>

          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setSelectedDay(null);
                setSelectedMuscles([]);
              }}
              variant="ghost"
              className="w-full mt-2 text-white hover:bg-white/10"
            >
              {t('cancelEdit')}
            </Button>
          )}
        </div>

        {/* Schedule Display Section */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-xl font-bold">{t('myPlan')}</h3>
            {schedules.length > 0 && (
              <Button
                onClick={handleResetAll}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4 mx-1" />
                {t('resetAll')}
              </Button>
            )}
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">{t('noWorkoutsYet')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-xl p-4 shadow-md flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-bold text-[#004D98] text-lg">
                      {t('day')} {getDayLabel(schedule.day_of_week)}
                    </h4>
                    <p className="text-gray-600 mt-1">
                      {getMuscleLabels(schedule.workout_types)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="p-2 rounded-lg bg-[#004D98]/10 hover:bg-[#004D98]/20 text-[#004D98] transition-colors"
                      title="ערוך"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 rounded-lg bg-[#A50044]/10 hover:bg-[#A50044]/20 text-[#A50044] transition-colors"
                      title="מחק"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyWorkoutPlan;
