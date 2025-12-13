import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'he' | 'en' | 'es' | 'ar';

const translations = {
  he: {
    dir: "rtl",
    label: "עברית",
    heroTitle: "תתאמן כמו אלוף.",
    heroSubtitle: "הצטרף לאלפי מתאמנים שכבר שברו את השיאים של עצמם.",
    ctaStart: "התחל את האתגר ⚽",
    login: "התחברות",
    back: "חזרה",
    loginTitle: "ברוך הבא, אלוף",
    emailLabel: "אימייל",
    passwordLabel: "סיסמה",
    loginButton: "התחבר",
    noAccount: "חדש ב-FitBarça? צור חשבון",
    myChallenges: "האתגרים שלי",
    createNew: "+ אתגר חדש",
    challenge30: "אתגר ה-30",
    challenge60: "אתגר ה-60",
    weekGoal: "יעד שבועי",
    workouts: "אימונים",
    createTitle: "יצירת אתגר חדש",
    inputName: "שם האתגר",
    inputTarget: "יעד אימונים בשבוע",
    step1: "שלב 1: בנה אימון על ידי בחירת תגיות",
    addWorkoutBtn: "הוסף אימון לאתגר +",
    saveChallengeBtn: "צור אתגר +",
    delete: "מחק",
    reset: "אפס",
    share: "שתף התקדמות",
    challengeTracker: "מעקב אתגרים",
    completed: "הושלם!",
    customChallenge: "אתגר מותאם",
    features: {
      build: "בנייה אישית",
      track: "מעקב צמוד",
      share: "שתף והצלח"
    },
    ticker: "🔥 יוסי סיים אימון חזה | 🏆 דנה השלימה אתגר | ⚽ עמית הצטרף | 💪 שירה שברה שיא אישי"
  },
  en: {
    dir: "ltr",
    label: "English",
    heroTitle: "Train Like a Champion.",
    heroSubtitle: "Join thousands of athletes who already broke their records.",
    ctaStart: "Start Challenge ⚽",
    login: "Login",
    back: "Back",
    loginTitle: "Welcome Back, Champion",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Login",
    noAccount: "New to FitBarça? Create an account",
    myChallenges: "My Challenges",
    createNew: "+ New Challenge",
    challenge30: "The 30 Challenge",
    challenge60: "The 60 Challenge",
    weekGoal: "Weekly Goal",
    workouts: "Workouts",
    createTitle: "Create New Challenge",
    inputName: "Challenge Name",
    inputTarget: "Weekly Workout Target",
    step1: "Step 1: Build workout by selecting tags",
    addWorkoutBtn: "Add Workout +",
    saveChallengeBtn: "Create Challenge +",
    delete: "Delete",
    reset: "Reset",
    share: "Share Progress",
    challengeTracker: "Challenge Tracker",
    completed: "Completed!",
    customChallenge: "Custom Challenge",
    features: {
      build: "Custom Build",
      track: "Track Progress",
      share: "Share Success"
    },
    ticker: "🔥 Yossi finished Chest Day | 🏆 Dana completed the challenge | ⚽ Amit joined | 💪 Shira broke a record"
  },
  es: {
    dir: "ltr",
    label: "Español",
    heroTitle: "Entrena como un Campeón.",
    heroSubtitle: "Únete a miles de atletas que ya rompieron sus récords.",
    ctaStart: "Empieza el Reto ⚽",
    login: "Iniciar Sesión",
    back: "Atrás",
    loginTitle: "Bienvenido Campeón",
    emailLabel: "Correo",
    passwordLabel: "Contraseña",
    loginButton: "Entrar",
    noAccount: "¿Nuevo en FitBarça? Crear cuenta",
    myChallenges: "Mis Retos",
    createNew: "+ Nuevo Reto",
    challenge30: "El Reto de 30",
    challenge60: "El Reto de 60",
    weekGoal: "Meta Semanal",
    workouts: "Entrenamientos",
    createTitle: "Crear Nuevo Reto",
    inputName: "Nombre del Reto",
    inputTarget: "Objetivo Semanal",
    step1: "Paso 1: Elige etiquetas",
    addWorkoutBtn: "Añadir Ejercicio +",
    saveChallengeBtn: "Crear Reto +",
    delete: "Eliminar",
    reset: "Reiniciar",
    share: "Compartir Progreso",
    challengeTracker: "Seguimiento de Retos",
    completed: "¡Completado!",
    customChallenge: "Reto Personalizado",
    features: {
      build: "Construcción",
      track: "Seguimiento",
      share: "Compartir"
    },
    ticker: "🔥 Jose terminó Pecho | 🏆 Maria completó el reto | ⚽ Carlos se unió | 💪 Ana rompió récord"
  },
  ar: {
    dir: "rtl",
    label: "العربية",
    heroTitle: "تدرب مثل البطل.",
    heroSubtitle: "انضم إلى الآلاف من الرياضيين الذين حطموا أرقامهم القياسية.",
    ctaStart: "ابدأ التحدي ⚽",
    login: "تسجيل الدخول",
    back: "عودة",
    loginTitle: "مرحباً بك أيها البطل",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    loginButton: "دخول",
    noAccount: "جديد في FitBarça؟ أنشئ حساباً",
    myChallenges: "تحدياتي",
    createNew: "+ تحدي جديد",
    challenge30: "تحدي الـ 30",
    challenge60: "تحدي الـ 60",
    weekGoal: "الهدف الأسبوعي",
    workouts: "تدريبات",
    createTitle: "إنشاء تحدي جديد",
    inputName: "اسم التحدي",
    inputTarget: "هدف التدريبات الأسبوعي",
    step1: "الخطوة 1: ابني تدريبك باختيار الوسوم",
    addWorkoutBtn: "أضف تدريب للتحدي +",
    saveChallengeBtn: "إنشاء التحدي +",
    delete: "حذف",
    reset: "إعادة تعيين",
    share: "شارك تقدمك",
    challengeTracker: "متتبع التحديات",
    completed: "مكتمل!",
    customChallenge: "تحدي مخصص",
    features: {
      build: "بناء شخصي",
      track: "تتبع دقيق",
      share: "شارك ونجح"
    },
    ticker: "🔥 يوسف أنهى تمرين الصدر | 🏆 دانا أكملت التحدي | ⚽ أحمد انضم | 💪 سارة حطمت الرقم القياسي"
  }
} as const;

type TranslationKeys = keyof Omit<typeof translations.he, 'features'>;
type FeatureKeys = keyof typeof translations.he.features;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
  tf: (key: FeatureKeys) => string;
  isRtl: boolean;
  translations: typeof translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fitbarca-language');
    return (saved as Language) || 'he';
  });

  const isRtl = language === 'he' || language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    localStorage.setItem('fitbarca-language', language);
  }, [language, isRtl]);

  const t = (key: TranslationKeys): string => {
    const value = translations[language][key];
    if (typeof value === 'string') return value;
    const fallback = translations.he[key];
    return typeof fallback === 'string' ? fallback : key;
  };

  const tf = (key: FeatureKeys): string => {
    return translations[language].features[key] || translations.he.features[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tf, isRtl, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { translations };
