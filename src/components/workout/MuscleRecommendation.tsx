import { Lightbulb } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface MuscleRecommendationProps {
  selectedMuscles: string[];
}

// Recommendation tips for each muscle in all 4 languages
const muscleRecommendations: Record<string, Record<Language, string>> = {
  chest: {
    he: "טיפ: מומלץ לשלב חזה עם יד אחורית לאימון דחיפה.",
    en: "Tip: Chest pairs well with Triceps for a push workout.",
    es: "Consejo: El pecho combina bien con los tríceps para ejercicios de empuje.",
    ar: "نصيحة: الصدر يتناسب جيدًا مع العضلة ثلاثية الرؤوس لتمارين الدفع."
  },
  back: {
    he: "טיפ: גב עובד מצוין בשילוב עם יד קדמית ליום משיכה.",
    en: "Tip: Back works great with Biceps (Pull day).",
    es: "Consejo: La espalda funciona muy bien con los bíceps (día de tracción).",
    ar: "نصيحة: الظهر يعمل بشكل ممتاز مع العضلة ثنائية الرؤوس (يوم السحب)."
  },
  legs: {
    he: "טיפ: אימון רגליים הוא עצים. מומלץ לשלב עם כתפיים או בטן.",
    en: "Tip: Legs are intense. Pair with Shoulders or Abs.",
    es: "Consejo: Piernas es intenso. Combínalo con Hombros o Abdominales.",
    ar: "نصيحة: تمارين الأرجل مكثفة. يفضل دمجها مع الأكتاف أو البطن."
  },
  shoulders: {
    he: "טיפ: כתפיים משתלבות נהדר עם בטן או יד אחורית.",
    en: "Tip: Shoulders pair great with Abs or Triceps.",
    es: "Consejo: Los hombros combinan muy bien con abdominales o tríceps.",
    ar: "نصيحة: الأكتاف تتناسب جيدًا مع البطن أو العضلة ثلاثية الرؤوس."
  },
  biceps: {
    he: "טיפ: יד קדמית היא שריר משיכה. משתלב מעולה בסוף אימון גב, או כאימון ידיים מלא עם יד אחורית.",
    en: "Tip: Biceps are pull muscles. Best paired with Back workouts or with Triceps for an arm day.",
    es: "Consejo: Los bíceps son músculos de tracción. Combínalos con Espalda o Tríceps.",
    ar: "نصيحة: العضلة ذات الرأسين هي عضلة سحب. يفضل دمجها مع تمارين الظهر أو مع العضلة ثلاثية الرؤوس."
  },
  triceps: {
    he: "טיפ: יד אחורית היא שריר דחיפה. עובדת חזק בתרגילי חזה וכתפיים, ולכן מומלץ לשלב אותה איתם.",
    en: "Tip: Triceps are push muscles. They work hard during Chest and Shoulder presses, so pair them together.",
    es: "Consejo: Los tríceps son músculos de empuje. Combínalos con Pecho u Hombros.",
    ar: "نصيحة: العضلة ثلاثية الرؤوس هي عضلة دفع. تعمل بقوة أثناء تمارين الصدر والأكتاف."
  },
  abs: {
    he: "טיפ: בטן ניתן לשלב עם כל אימון - מומלץ בסוף.",
    en: "Tip: Abs can be paired with any workout - best at the end.",
    es: "Consejo: Abdominales se pueden combinar con cualquier entrenamiento - mejor al final.",
    ar: "نصيحة: البطن يمكن دمجها مع أي تمرين - الأفضل في النهاية."
  },
  stretch: {
    he: "טיפ: מתיחות חשובות להתאוששות ומניעת פציעות.",
    en: "Tip: Stretching is key for recovery and injury prevention.",
    es: "Consejo: El estiramiento es clave para la recuperación y prevención de lesiones.",
    ar: "نصيحة: التمدد مهم للتعافي ومنع الإصابات."
  },
  full_body: {
    he: "טיפ: אימון Full Body מצוין 2-3 פעמים בשבוע.",
    en: "Tip: Full Body workouts are great 2-3 times a week.",
    es: "Consejo: Los entrenamientos de cuerpo completo son geniales 2-3 veces por semana.",
    ar: "نصيحة: تمارين الجسم الكامل رائعة 2-3 مرات في الأسبوع."
  }
};

// Default tip when no muscle is selected
const defaultTip: Record<Language, string> = {
  he: "בחר קבוצת שרירים כדי לקבל טיפים.",
  en: "Select a muscle group to see tips.",
  es: "Selecciona un grupo muscular para ver consejos.",
  ar: "اختر مجموعة عضلية لرؤية النصائح."
};

const MuscleRecommendation = ({ selectedMuscles }: MuscleRecommendationProps) => {
  const { language, isRtl } = useLanguage();

  // Debug logging to verify component renders with correct data
  console.log('Muscle Recommendations Rendered:', { selectedMuscles, language });

  // Get the first selected muscle's recommendation
  const getRecommendation = (): string => {
    if (selectedMuscles.length === 0) {
      return defaultTip[language];
    }
    
    // Show recommendation for the first selected muscle
    const firstMuscle = selectedMuscles[0];
    const recommendation = muscleRecommendations[firstMuscle];
    
    if (recommendation) {
      return recommendation[language];
    }
    
    return defaultTip[language];
  };

  return (
    <div 
      className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/30 border-2 border-amber-400/50 backdrop-blur-sm shadow-lg"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Lightbulb className="h-6 w-6 text-amber-300" />
      </div>
      <p className="text-base font-medium text-amber-100 leading-relaxed">
        {getRecommendation()}
      </p>
    </div>
  );
};

export default MuscleRecommendation;
