import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import FitBarcaLogo from "@/components/FitBarcaLogo";
import AuthBackground from "@/components/AuthBackground";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Save, SkipForward, AlertTriangle, Loader2, Calendar, Dumbbell } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type WorkoutType = 'rest' | 'chest_triceps' | 'biceps_back' | 'cardio' | 'legs_shoulders' | 'full_body';

interface WeeklySchedule {
  sunday: WorkoutType;
  monday: WorkoutType;
  tuesday: WorkoutType;
  wednesday: WorkoutType;
  thursday: WorkoutType;
  friday: WorkoutType;
  saturday: WorkoutType;
}

const WORKOUT_OPTIONS: { value: WorkoutType; label: string }[] = [
  { value: 'rest', label: 'יום מנוחה' },
  { value: 'chest_triceps', label: 'אימון חזה + יד אחורית + מתח + בטן' },
  { value: 'biceps_back', label: 'אימון יד קדמית + גב + מתח + בטן' },
  { value: 'cardio', label: 'אימון אירובי + שכיבות שמיכה + מתח + בטן' },
  { value: 'legs_shoulders', label: 'אימון רגליים וכתפיים + מתח + בטן' },
  { value: 'full_body', label: 'אימון Full Body + מתח + בטן' },
];

const DAYS_OF_WEEK: { key: keyof WeeklySchedule; label: string }[] = [
  { key: 'sunday', label: 'יום ראשון' },
  { key: 'monday', label: 'יום שני' },
  { key: 'tuesday', label: 'יום שלישי' },
  { key: 'wednesday', label: 'יום רביעי' },
  { key: 'thursday', label: 'יום חמישי' },
  { key: 'friday', label: 'יום שישי' },
  { key: 'saturday', label: 'יום שבת' },
];

const WeeklyWorkoutAssignment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [plannedWorkouts, setPlannedWorkouts] = useState(3);
  const [showMismatchWarning, setShowMismatchWarning] = useState(false);
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    sunday: 'rest',
    monday: 'rest',
    tuesday: 'rest',
    wednesday: 'rest',
    thursday: 'rest',
    friday: 'rest',
    saturday: 'rest',
  });

  // Load existing schedule
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('weekly_workout_schedule')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading schedule:', error);
        }

        if (data) {
          setPlannedWorkouts(data.planned_workouts_count);
          setSchedule({
            sunday: data.sunday as WorkoutType,
            monday: data.monday as WorkoutType,
            tuesday: data.tuesday as WorkoutType,
            wednesday: data.wednesday as WorkoutType,
            thursday: data.thursday as WorkoutType,
            friday: data.friday as WorkoutType,
            saturday: data.saturday as WorkoutType,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [navigate]);

  // Count actual workout days
  const actualWorkoutDays = Object.values(schedule).filter(
    (workout) => workout !== 'rest'
  ).length;

  const handleDayChange = (day: keyof WeeklySchedule, value: WorkoutType) => {
    setSchedule(prev => ({ ...prev, [day]: value }));
    setShowMismatchWarning(false);
  };

  const validateAndSave = async () => {
    // Check mismatch between planned and actual
    if (actualWorkoutDays !== plannedWorkouts && !showMismatchWarning) {
      setShowMismatchWarning(true);
      return;
    }

    await saveSchedule();
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר לחשבון כדי לשמור את התוכנית.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('weekly_workout_schedule')
        .upsert({
          user_id: user.id,
          planned_workouts_count: plannedWorkouts,
          ...schedule,
          skipped_setup: false,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "התוכנית נשמרה בהצלחה!",
        description: "מעבר לשלב הבא...",
      });

      navigate('/workout-planning');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "שגיאה בשמירה",
        description: "אירעה שגיאה בשמירת התוכנית. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save that user skipped this step
        await supabase
          .from('weekly_workout_schedule')
          .upsert({
            user_id: user.id,
            planned_workouts_count: 3,
            sunday: 'rest',
            monday: 'rest',
            tuesday: 'rest',
            wednesday: 'rest',
            thursday: 'rest',
            friday: 'rest',
            saturday: 'rest',
            skipped_setup: true,
          }, {
            onConflict: 'user_id'
          });
      }

      toast({
        title: "דילוג על ההגדרות",
        description: "תוכל להגדיר את תוכנית האימונים מאוחר יותר.",
      });

      navigate('/workout-planning');
    } catch (error) {
      console.error('Skip error:', error);
      navigate('/workout-planning');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AuthBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <AuthBackground />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 animate-slide-up">
          <FitBarcaLogo size="md" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            הגדרת תוכנית אימונים שבועית
          </h1>
          <p className="mt-2 text-muted-foreground">
            שבץ את האימונים שלך לכל יום בשבוע
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-border/50 animate-slide-up-delay-1">
          {/* Planned Workouts Slider */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold text-foreground">
                כמות אימונים מתוכננת לשבוע
              </Label>
            </div>
            <div className="flex items-center gap-6">
              <Slider
                value={[plannedWorkouts]}
                onValueChange={(value) => {
                  setPlannedWorkouts(value[0]);
                  setShowMismatchWarning(false);
                }}
                min={1}
                max={7}
                step={1}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-primary min-w-[3rem] text-center">
                {plannedWorkouts}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              בחרת {actualWorkoutDays} ימי אימון מתוך {plannedWorkouts} מתוכננים
            </p>
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-accent" />
              <Label className="text-base font-semibold text-foreground">
                שיבוץ ימי השבוע
              </Label>
            </div>
            
            <div className="grid gap-3">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div 
                  key={key} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/30"
                >
                  <span className="font-medium text-foreground min-w-[100px]">
                    {label}
                  </span>
                  <Select
                    value={schedule[key]}
                    onValueChange={(value: WorkoutType) => handleDayChange(key, value)}
                  >
                    <SelectTrigger className="flex-1 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {WORKOUT_OPTIONS.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className={option.value === 'rest' ? 'text-muted-foreground' : 'text-foreground'}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Mismatch Warning */}
          {showMismatchWarning && (
            <Alert className="mt-6 border-barca-gold bg-barca-gold/10">
              <AlertTriangle className="h-4 w-4 text-barca-gold" />
              <AlertDescription className="text-foreground">
                <strong>שים לב:</strong> בחרת {actualWorkoutDays} ימי אימון, 
                אך הגדרת {plannedWorkouts} אימונים מתוכננים לשבוע.
                <br />
                לחץ שוב על "שמור והמשך" כדי לשמור בכל זאת.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="barca-blue"
              size="lg"
              className="flex-1"
              onClick={validateAndSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {showMismatchWarning ? 'שמור בכל זאת' : 'שמור תוכנית והמשך'}
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleSkip}
              disabled={isSaving}
            >
              <SkipForward className="h-5 w-5" />
              דלג כרגע
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="text-center mt-6 animate-slide-up-delay-2">
          <p className="text-sm text-muted-foreground">
            שלב 2 מתוך 3
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyWorkoutAssignment;
