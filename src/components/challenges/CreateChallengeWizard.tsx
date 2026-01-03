import { useState } from 'react';
import { 
  CheckSquare, 
  TrendingUp, 
  Flame, 
  ArrowRight, 
  ArrowLeft,
  Dumbbell,
  Target,
  Zap,
  Trophy,
  Heart,
  Star,
  Timer,
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChallengeWorkoutManager } from './ChallengeWorkoutManager';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type ChallengeType = 'standard' | 'numeric' | 'habit';

export interface ChallengeFormData {
  type: ChallengeType;
  title: string;
  // Standard type
  targetPerWeek: number;
  workouts: { text: string; workoutIndex: number }[];
  // Numeric type
  targetValue?: number;
  metricUnit?: string;
  // Habit type
  durationDays?: number;
  frequency?: 'daily' | 'custom';
  // Visuals
  colorTheme: string;
  icon: string;
}

interface CreateChallengeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ChallengeFormData) => void;
}

const CHALLENGE_TYPES = [
  {
    type: 'standard' as ChallengeType,
    icon: CheckSquare,
    title: 'רגיל (צ\'קליסט)',
    description: 'X אימונים בשבוע',
    example: 'לדוגמה: 4 אימונים בשבוע',
  },
  {
    type: 'numeric' as ChallengeType,
    icon: TrendingUp,
    title: 'מספרי (צבירה)',
    description: 'צבור יעד מספרי',
    example: 'לדוגמה: לרוץ 100 ק"מ החודש',
  },
  {
    type: 'habit' as ChallengeType,
    icon: Flame,
    title: 'הרגל (רצף)',
    description: 'שמור על רצף ימים',
    example: 'לדוגמה: 30 ימים בלי סוכר',
  },
];

const METRIC_UNITS = [
  { value: 'km', label: 'קילומטר (ק"מ)' },
  { value: 'kg', label: 'קילוגרם (ק"ג)' },
  { value: 'liters', label: 'ליטרים' },
  { value: 'minutes', label: 'דקות' },
  { value: 'hours', label: 'שעות' },
  { value: 'reps', label: 'חזרות' },
  { value: 'sets', label: 'סטים' },
];

const COLOR_THEMES = [
  { value: 'blue', label: 'כחול', gradient: 'from-blue-600 to-blue-900', bg: 'bg-blue-600' },
  { value: 'red', label: 'אדום', gradient: 'from-red-600 to-red-900', bg: 'bg-red-600' },
  { value: 'green', label: 'ירוק', gradient: 'from-green-600 to-green-900', bg: 'bg-green-600' },
  { value: 'purple', label: 'סגול', gradient: 'from-purple-600 to-purple-900', bg: 'bg-purple-600' },
  { value: 'orange', label: 'כתום', gradient: 'from-orange-500 to-orange-800', bg: 'bg-orange-500' },
  { value: 'pink', label: 'ורוד', gradient: 'from-pink-500 to-pink-800', bg: 'bg-pink-500' },
];

const ICONS = [
  { value: 'dumbbell', label: 'משקולת', Icon: Dumbbell },
  { value: 'target', label: 'מטרה', Icon: Target },
  { value: 'zap', label: 'ברק', Icon: Zap },
  { value: 'trophy', label: 'גביע', Icon: Trophy },
  { value: 'heart', label: 'לב', Icon: Heart },
  { value: 'star', label: 'כוכב', Icon: Star },
  { value: 'timer', label: 'טיימר', Icon: Timer },
  { value: 'flame', label: 'אש', Icon: Flame },
  { value: 'droplets', label: 'טיפות', Icon: Droplets },
];

export const CreateChallengeWizard = ({ open, onOpenChange, onSave }: CreateChallengeWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ChallengeFormData>({
    type: 'standard',
    title: '',
    targetPerWeek: 4,
    workouts: [],
    targetValue: undefined,
    metricUnit: 'km',
    durationDays: 30,
    frequency: 'daily',
    colorTheme: 'blue',
    icon: 'dumbbell',
  });

  const totalSteps = 3;

  const resetForm = () => {
    setStep(1);
    setFormData({
      type: 'standard',
      title: '',
      targetPerWeek: 4,
      workouts: [],
      targetValue: undefined,
      metricUnit: 'km',
      durationDays: 30,
      frequency: 'daily',
      colorTheme: 'blue',
      icon: 'dumbbell',
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  const handleTypeSelect = (type: ChallengeType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.type) {
      toast.error('שגיאה', { description: 'יש לבחור סוג אתגר' });
      return;
    }
    
    if (step === 2) {
      if (!formData.title.trim()) {
        toast.error('שגיאה', { description: 'יש להזין שם לאתגר' });
        return;
      }
      
      if (formData.type === 'standard') {
        if (formData.targetPerWeek <= 0) {
          toast.error('שגיאה', { description: 'יש להזין יעד אימונים שבועי' });
          return;
        }
        if (formData.workouts.length === 0) {
          toast.error('שגיאה', { description: 'יש להוסיף לפחות אימון אחד' });
          return;
        }
      }
      
      if (formData.type === 'numeric') {
        if (!formData.targetValue || formData.targetValue <= 0) {
          toast.error('שגיאה', { description: 'יש להזין יעד מספרי' });
          return;
        }
      }
      
      if (formData.type === 'habit') {
        if (!formData.durationDays || formData.durationDays <= 0) {
          toast.error('שגיאה', { description: 'יש להזין מספר ימים' });
          return;
        }
      }
    }

    if (step < totalSteps) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    onSave(formData);
    resetForm();
    onOpenChange(false);
  };

  const handleAddWorkout = (workoutText: string) => {
    setFormData(prev => ({
      ...prev,
      workouts: [...prev.workouts, { text: workoutText, workoutIndex: prev.workouts.length }],
    }));
  };

  const handleRemoveWorkout = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workouts: prev.workouts.filter((_, i) => i !== index),
    }));
  };

  const handleDuplicateWorkout = (index: number) => {
    setFormData(prev => {
      const newWorkouts = [...prev.workouts];
      newWorkouts.splice(index + 1, 0, { ...prev.workouts[index], workoutIndex: prev.workouts.length });
      return { ...prev, workouts: newWorkouts };
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#061E40]/95 backdrop-blur-xl border-blue-800 text-white max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#A50044]/30">
              <Dumbbell className="w-6 h-6 text-red-400" />
            </div>
            יצירת אתגר חדש
          </DialogTitle>
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    step >= s
                      ? "bg-[#A50044] text-white"
                      : "bg-blue-900/50 text-blue-400"
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-12 h-1 mx-1 rounded transition-all",
                      step > s ? "bg-[#A50044]" : "bg-blue-900/50"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-blue-300 text-sm mt-2">
            שלב {step} מתוך {totalSteps}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-5 mt-4" dir="rtl">
            {/* Step 1: Choose Type */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-200">בחר סוג אתגר</h3>
                <div className="grid gap-4">
                  {CHALLENGE_TYPES.map((ct) => {
                    const Icon = ct.icon;
                    const isSelected = formData.type === ct.type;
                    return (
                      <button
                        key={ct.type}
                        onClick={() => handleTypeSelect(ct.type)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 transition-all text-right",
                          isSelected
                            ? "border-[#A50044] bg-[#A50044]/20"
                            : "border-blue-800 bg-blue-900/30 hover:border-blue-600"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-xl",
                              isSelected ? "bg-[#A50044]" : "bg-blue-800"
                            )}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white">{ct.title}</h4>
                            <p className="text-blue-300 text-sm mt-1">{ct.description}</p>
                            <p className="text-blue-400/70 text-xs mt-2">{ct.example}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#A50044] flex items-center justify-center">
                              <CheckSquare className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Define Goal */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-blue-200">הגדר את היעד</h3>

                {/* Title - Common for all types */}
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">
                    שם האתגר <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="לדוגמה: אתגר ה-30"
                    className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>

                {/* Standard Type Fields */}
                {formData.type === 'standard' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">
                        יעד אימונים בשבוע <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={7}
                        value={formData.targetPerWeek}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetPerWeek: parseInt(e.target.value) || 0 }))}
                        placeholder="לדוגמה: 4"
                        className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400 w-24"
                      />
                    </div>

                    <ChallengeWorkoutManager
                      workouts={formData.workouts}
                      onAddWorkout={handleAddWorkout}
                      onRemoveWorkout={handleRemoveWorkout}
                      onDuplicateWorkout={handleDuplicateWorkout}
                    />
                  </>
                )}

                {/* Numeric Type Fields */}
                {formData.type === 'numeric' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">
                        יעד מספרי <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.targetValue || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || undefined }))}
                        placeholder="לדוגמה: 100"
                        className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">
                        יחידת מדידה <span className="text-red-400">*</span>
                      </label>
                      <Select
                        value={formData.metricUnit}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, metricUnit: value }))}
                      >
                        <SelectTrigger className="bg-[#021024] border-blue-800 text-white">
                          <SelectValue placeholder="בחר יחידה" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#061E40] border-blue-800">
                          {METRIC_UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value} className="text-white hover:bg-blue-800">
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Habit Type Fields */}
                {formData.type === 'habit' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">
                        משך האתגר (ימים) <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.durationDays || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationDays: parseInt(e.target.value) || undefined }))}
                        placeholder="לדוגמה: 30"
                        className="bg-[#021024] border-blue-800 text-white placeholder:text-blue-400/50 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">
                        תדירות <span className="text-red-400">*</span>
                      </label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value: 'daily' | 'custom') => setFormData(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger className="bg-[#021024] border-blue-800 text-white">
                          <SelectValue placeholder="בחר תדירות" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#061E40] border-blue-800">
                          <SelectItem value="daily" className="text-white hover:bg-blue-800">יומי</SelectItem>
                          <SelectItem value="custom" className="text-white hover:bg-blue-800">מותאם אישית</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Visuals */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-blue-200">עיצוב האתגר</h3>

                {/* Color Theme */}
                <div className="space-y-3">
                  <label className="text-sm text-blue-200">ערכת צבעים</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setFormData(prev => ({ ...prev, colorTheme: theme.value }))}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          formData.colorTheme === theme.value
                            ? "border-yellow-400"
                            : "border-blue-800 hover:border-blue-600"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full", theme.bg)} />
                        <span className="text-xs text-white">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div className="space-y-3">
                  <label className="text-sm text-blue-200">אייקון</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ICONS.map((icon) => {
                      const IconComponent = icon.Icon;
                      return (
                        <button
                          key={icon.value}
                          onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                            formData.icon === icon.value
                              ? "border-yellow-400 bg-yellow-400/10"
                              : "border-blue-800 hover:border-blue-600"
                          )}
                        >
                          <IconComponent className={cn(
                            "w-6 h-6",
                            formData.icon === icon.value ? "text-yellow-400" : "text-blue-300"
                          )} />
                          <span className="text-xs text-white">{icon.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-700">
                  <p className="text-xs text-blue-400 mb-2">תצוגה מקדימה</p>
                  <div className={cn(
                    "p-4 rounded-lg bg-gradient-to-br",
                    COLOR_THEMES.find(t => t.value === formData.colorTheme)?.gradient || 'from-blue-600 to-blue-900'
                  )}>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComponent = ICONS.find(i => i.value === formData.icon)?.Icon || Dumbbell;
                        return <IconComponent className="w-8 h-8 text-white" />;
                      })()}
                      <div>
                        <h4 className="text-white font-bold">{formData.title || 'שם האתגר'}</h4>
                        <p className="text-white/70 text-sm">
                          {formData.type === 'standard' && `${formData.targetPerWeek} אימונים בשבוע`}
                          {formData.type === 'numeric' && `יעד: ${formData.targetValue || 0} ${METRIC_UNITS.find(u => u.value === formData.metricUnit)?.label || ''}`}
                          {formData.type === 'habit' && `${formData.durationDays || 0} ימים`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4 border-t border-blue-800">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 border-blue-700 text-blue-200 hover:bg-blue-800"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              הקודם
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              className="flex-1 bg-[#A50044] hover:bg-[#800033] text-white font-bold"
            >
              הבא
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#A50044] hover:bg-[#800033] text-white font-bold shadow-lg shadow-red-900/30"
            >
              צור אתגר
              <CheckSquare className="w-4 h-4 mr-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
