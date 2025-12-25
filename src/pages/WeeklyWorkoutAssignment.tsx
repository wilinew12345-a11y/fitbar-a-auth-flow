import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FitBarcaLogo from "@/components/FitBarcaLogo";
import LanguageSelector from "@/components/LanguageSelector";
import TimePicker from "@/components/workout/TimePicker";
import PlanSuccessModal from "@/components/workout/PlanSuccessModal";
import SyncManagementCard from "@/components/workout/SyncManagementCard";
import { Plus, Trash2, Pencil, X, Loader2, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import MuscleRecommendation from "@/components/workout/MuscleRecommendation";


interface Schedule {
  id: string;
  day_of_week: string;
  workout_types: string[];
  workout_time: string | null;
}

const WeeklyWorkoutAssignment = () => {
  const navigate = useNavigate();
  const { t, isRtl, language } = useLanguage();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(true);
  const [initialScheduleCount, setInitialScheduleCount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Days of week with translations
  const DAYS_OF_WEEK = useMemo(() => [
    { key: 'sunday', label: t('sunday'), short: t('sunShort') },
    { key: 'monday', label: t('monday'), short: t('monShort') },
    { key: 'tuesday', label: t('tuesday'), short: t('tueShort') },
    { key: 'wednesday', label: t('wednesday'), short: t('wedShort') },
    { key: 'thursday', label: t('thursday'), short: t('thuShort') },
    { key: 'friday', label: t('friday'), short: t('friShort') },
    { key: 'saturday', label: t('saturday'), short: t('satShort') },
  ], [t]);

  // Muscle groups with translations
  const MUSCLE_GROUPS = useMemo(() => [
    { key: 'chest', label: t('chest') },
    { key: 'triceps', label: t('triceps') },
    { key: 'biceps', label: t('biceps') },
    { key: 'back', label: t('backMuscle') },
    { key: 'legs', label: t('legs') },
    { key: 'shoulders', label: t('shoulders') },
    { key: 'abs', label: t('abs') },
    { key: 'stretch', label: t('pullups') },
    { key: 'aerobic', label: t('aerobic') },
    { key: 'fullbody', label: t('fullBody') },
  ], [t]);

  // Check auth and fetch schedules
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      await fetchSchedules(true);
      setLoading(false);
    };
    checkAuthAndFetch();
  }, [navigate]);

  const fetchSchedules = async (isInitial: boolean = false) => {
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

    const count = data?.length || 0;
    setSchedules(data || []);
    
    if (isInitial) {
      setInitialScheduleCount(count);
      setIsFirstTimeSetup(count === 0);
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
    if (!selectedDay || selectedMuscles.length === 0) {
      toast({
        title: t('selectDayAndMuscles'),
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
            workout_time: selectedTime,
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({ title: t('workoutUpdated') });
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
              workout_time: selectedTime,
            })
            .eq('id', existingSchedule.id);

          if (error) throw error;
          toast({ title: t('workoutUpdated') });
        } else {
          // Insert new
          const { error } = await supabase
            .from('weekly_schedules')
            .insert({
              user_id: user.id,
              day_of_week: selectedDay,
              workout_types: selectedMuscles,
              workout_time: selectedTime,
            });

          if (error) throw error;
          toast({ title: t('workoutAdded') });
        }
      }

      await fetchSchedules();
      setSelectedDay(null);
      setSelectedMuscles([]);
      setSelectedTime("09:00");
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error saving",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedDay(schedule.day_of_week);
    setSelectedMuscles(schedule.workout_types);
    setSelectedTime(schedule.workout_time || "09:00");
    setEditingId(schedule.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('weekly_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting",
        variant: "destructive",
      });
      return;
    }

    toast({ title: t('workoutDeleted') });
    await fetchSchedules();
  };

  const handleResetRequest = () => {
    setShowResetDialog(true);
  };

  const handleResetConfirm = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsResetting(true);

    try {
      // Delete all schedules
      const { error } = await supabase
        .from('weekly_schedules')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error resetting",
          variant: "destructive",
        });
        return;
      }

      // Also disable integrations in profile
      await supabase
        .from('profiles')
        .update({ 
          calendar_sync_enabled: false, 
          notifications_enabled: false 
        })
        .eq('id', user.id);

      toast({ title: t('allWorkoutsDeleted') });
      setSchedules([]);
      setSelectedDay(null);
      setSelectedMuscles([]);
      setSelectedTime("09:00");
      setEditingId(null);
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  const getDayLabel = (dayKey: string) => {
    return DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
  };

  const getMuscleLabels = (muscleKeys: string[]) => {
    return muscleKeys
      .map(key => MUSCLE_GROUPS.find(m => m.key === key)?.label || key)
      .join(', ');
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM format
  };

  const handleContinue = () => {
    if (initialScheduleCount === 0) {
      // First time setup - show success modal
      setShowSuccessModal(true);
    } else {
      navigate('/workout-log');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    sessionStorage.setItem('firstPlanCreated', 'true');
    navigate('/dashboard');
  };

  // Calendar sync is now handled automatically by SyncManagementCard
  const handleDownloadCalendar = () => {
    // This function is now deprecated - calendar sync happens via edge function
    console.log('Calendar sync triggered');
  };

  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

  // Time picker translations
  const timePickerLabel = {
    he: 'שעת אימון:',
    en: 'Workout time:',
    es: 'Hora del entrenamiento:',
    ar: 'وقت التمرين:',
  }[language] || 'שעת אימון:';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-barca">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-barca p-4 overflow-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <FitBarcaLogo size="md" />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="min-w-[40px] min-h-[40px] text-white/70 hover:text-[#A50044] hover:bg-white/10 transition-all duration-200 rounded-full"
              aria-label={t('back')}
            >
              <BackIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Guidance Header for first-time setup */}
        {isFirstTimeSetup && (
          <div className="bg-gradient-to-r from-[#004d98]/30 to-[#a50044]/30 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20 animate-slide-up">
            <p className="text-white text-center font-medium">{t('buildPlanGuidance')}</p>
          </div>
        )}

        {/* Builder Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl animate-slide-up-delay-1">
          {/* Day Selector */}
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">{t('selectDayOfWeek')}</h2>
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

          {/* Time Picker */}
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">{timePickerLabel}</h2>
            <div className="flex justify-center">
              <TimePicker
                value={selectedTime}
                onChange={setSelectedTime}
                disabled={!selectedDay}
              />
            </div>
          </div>

          {/* Muscle Selector */}
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">{t('selectMuscleGroups')}</h2>
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

          {/* Smart Muscle Recommendation */}
          <div className="mb-6">
            <MuscleRecommendation selectedMuscles={selectedMuscles} />
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
                  <Plus className="h-5 w-5 mx-2" />
                  {editingId ? t('updateWorkout') : t('addToMyWorkouts')}
                </>
              )}
            </Button>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setSelectedDay(null);
                  setSelectedMuscles([]);
                  setSelectedTime("09:00");
                }}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5 mx-1" />
                {t('cancelEdit')}
              </Button>
            )}
          </div>
        </div>

        {/* Schedule Display */}
        <div className="mt-8 animate-slide-up-delay-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">{t('myPlan')}</h2>
            {schedules.length > 0 && (
              <Button
                onClick={handleResetRequest}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                size="sm"
                disabled={isResetting}
              >
                {isResetting ? <Loader2 className="h-4 w-4 mx-1 animate-spin" /> : <RotateCcw className="h-4 w-4 mx-1" />}
                {t('resetAll')}
              </Button>
            )}
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
              <p className="text-white/60">{t('noWorkoutsYet')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-bold text-lg">{t('day')} {getDayLabel(schedule.day_of_week)}</h3>
                      {schedule.workout_time && (
                        <span className="text-[#FFED02] text-sm font-medium bg-white/10 px-2 py-1 rounded-lg">
                          {formatTime(schedule.workout_time)}
                        </span>
                      )}
                    </div>
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

        {/* Sync Management Card */}
        <div className="mt-8 animate-slide-up-delay-2">
          <SyncManagementCard
            schedules={schedules}
            getMuscleLabels={getMuscleLabels}
            onDownloadCalendar={handleDownloadCalendar}
          />
        </div>

        {/* Continue Button */}
        {schedules.length > 0 && (
          <div className="mt-8 text-center animate-slide-up-delay-2">
            <Button
              onClick={handleContinue}
              className="bg-[hsl(213,100%,30%)] hover:bg-[hsl(213,100%,40%)] text-white px-12 py-6 text-lg font-bold rounded-xl shadow-lg"
            >
              {initialScheduleCount === 0 ? t('goHome') : t('continueToNextStep')}
            </Button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">{t('stepOf').replace('{0}', '2').replace('{1}', '3')}</p>
        </div>
      </div>

      {/* Success Modal */}
      <PlanSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {language === 'he' ? 'האם אתה בטוח?' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {language === 'he' 
                ? 'פעולה זו תמחק את התוכנית, תסיר את האימונים מלוח השנה ותבטל את התראות המוטיבציה.'
                : 'This action will delete your plan, remove workouts from your calendar, and disable motivation alerts.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRtl ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel disabled={isResetting}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin mx-2" /> : null}
              {language === 'he' ? 'אפס הכל' : 'Reset All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WeeklyWorkoutAssignment;
