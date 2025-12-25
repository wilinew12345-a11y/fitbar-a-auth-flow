// AI Motivational Push Notification Messages Service

// Message templates with {muscles} placeholder
const MOTIVATION_MESSAGES_HE = [
  "זמן לטרוף! היום {muscles} על המוקד 💪",
  "התוכנית שלך מחכה, והשרירים (בעיקר {muscles}) לא יגדלו לבד!",
  "מאמן ה-AI כאן להזכיר: היום זה היום של ה-{muscles}. צא לדרך!",
  "יאללה אלוף! ה-{muscles} מחכים לך בחדר כושר 🏋️",
  "הגוף שלך יודע מה הוא צריך: אימון {muscles}. בוא נעשה את זה!",
  "⚽ שחקני ברצלונה לא מדלגים על אימונים. היום אנחנו עובדים על {muscles}!",
  "האם אתה מוכן? ה-{muscles} שלך מחכים להתפתח 🔥",
  "זה הזמן! אימון {muscles} מחכה לך. אל תוותר!",
  "תזכור: כל אימון מקרב אותך למטרה. היום {muscles} על הכוונת!",
  "האלופים לא מפסיקים! היום אנחנו מתמקדים ב-{muscles} 💯",
  "הגיע הזמן להזיע! {muscles} על לוח הזמנים 🏆",
  "ברצלונה DNA: מסירות ועבודה קשה. היום אנחנו עובדים על {muscles}!",
  "🔥 היום אתה הולך לעשות את ההבדל! אימון {muscles} מתחיל עכשיו",
  "המאמן שלך מאמין בך! היום זה יום {muscles} - בוא נעשה היסטוריה",
  "השרירים שלך מחכים להתעורר! {muscles} ביומן - בוא נתחיל!",
];

const MOTIVATION_MESSAGES_EN = [
  "Time to crush it! {muscles} on the menu today 💪",
  "Your plan is waiting, and those {muscles} won't grow themselves!",
  "AI Coach reminder: Today is {muscles} day. Let's go!",
  "Let's go champ! {muscles} are waiting at the gym 🏋️",
  "Your body knows what it needs: {muscles} workout. Let's do this!",
  "⚽ Barcelona players never skip training. Today we work on {muscles}!",
  "Are you ready? Your {muscles} are waiting to grow 🔥",
  "It's time! {muscles} workout awaits. Don't give up!",
  "Remember: Every workout brings you closer to your goal. {muscles} today!",
  "Champions don't stop! Today we focus on {muscles} 💯",
  "Time to sweat! {muscles} on the schedule 🏆",
  "Barcelona DNA: Dedication and hard work. {muscles} day today!",
  "🔥 Today you make the difference! {muscles} workout starts now",
  "Your coach believes in you! {muscles} day - let's make history",
  "Your muscles are ready to wake up! {muscles} on the agenda - let's begin!",
];

const MOTIVATION_MESSAGES_ES = [
  "¡Hora de arrasar! Hoy toca {muscles} 💪",
  "Tu plan te espera, ¡y esos {muscles} no crecerán solos!",
  "Recordatorio del entrenador IA: Hoy es día de {muscles}. ¡Vamos!",
  "¡Vamos campeón! Los {muscles} te esperan en el gimnasio 🏋️",
  "Tu cuerpo sabe lo que necesita: entrenamiento de {muscles}. ¡Hagámoslo!",
  "⚽ Los jugadores del Barcelona nunca faltan. ¡Hoy trabajamos {muscles}!",
  "¿Estás listo? Tus {muscles} esperan crecer 🔥",
  "¡Es hora! El entrenamiento de {muscles} te espera. ¡No te rindas!",
  "Recuerda: Cada entrenamiento te acerca a tu meta. ¡{muscles} hoy!",
  "¡Los campeones no paran! Hoy nos enfocamos en {muscles} 💯",
  "¡Hora de sudar! {muscles} en el programa 🏆",
  "ADN Barcelona: Dedicación y trabajo duro. ¡Hoy día de {muscles}!",
  "🔥 ¡Hoy marcas la diferencia! Entrenamiento de {muscles} empieza ahora",
  "¡Tu entrenador cree en ti! Día de {muscles} - hagamos historia",
  "¡Tus músculos están listos! {muscles} en la agenda - ¡empecemos!",
];

const MOTIVATION_MESSAGES_AR = [
  "حان وقت التحطيم! اليوم {muscles} على الجدول 💪",
  "خطتك تنتظرك، وتلك {muscles} لن تنمو وحدها!",
  "تذكير من المدرب الذكي: اليوم يوم {muscles}. هيا بنا!",
  "يلا بطل! {muscles} تنتظرك في الصالة 🏋️",
  "جسمك يعرف ما يحتاجه: تمرين {muscles}. هيا نفعلها!",
  "⚽ لاعبو برشلونة لا يتغيبون عن التدريب. اليوم نعمل على {muscles}!",
  "هل أنت جاهز؟ {muscles} تنتظر النمو 🔥",
  "حان الوقت! تمرين {muscles} ينتظرك. لا تستسلم!",
  "تذكر: كل تمرين يقربك من هدفك. {muscles} اليوم!",
  "الأبطال لا يتوقفون! اليوم نركز على {muscles} 💯",
  "وقت التعرق! {muscles} على الجدول 🏆",
  "حمض برشلونة النووي: التفاني والعمل الشاق. اليوم يوم {muscles}!",
  "🔥 اليوم تصنع الفرق! تمرين {muscles} يبدأ الآن",
  "مدربك يؤمن بك! يوم {muscles} - لنصنع التاريخ",
  "عضلاتك جاهزة للاستيقاظ! {muscles} في الجدول - لنبدأ!",
];

type Language = 'he' | 'en' | 'es' | 'ar';

const MESSAGES_BY_LANGUAGE: Record<Language, string[]> = {
  he: MOTIVATION_MESSAGES_HE,
  en: MOTIVATION_MESSAGES_EN,
  es: MOTIVATION_MESSAGES_ES,
  ar: MOTIVATION_MESSAGES_AR,
};

// Track last used index to ensure variety
let lastUsedIndex: Record<Language, number> = {
  he: -1,
  en: -1,
  es: -1,
  ar: -1,
};

export function getMotivationalMessage(muscles: string, language: Language = 'he'): string {
  const messages = MESSAGES_BY_LANGUAGE[language] || MESSAGES_BY_LANGUAGE.he;
  
  // Get a random index that's different from the last one
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * messages.length);
  } while (newIndex === lastUsedIndex[language] && messages.length > 1);
  
  lastUsedIndex[language] = newIndex;
  
  return messages[newIndex].replace('{muscles}', muscles);
}

export function getRandomMotivationalMessage(muscles: string, language: Language = 'he'): string {
  return getMotivationalMessage(muscles, language);
}

// Get all messages for a language (useful for previews)
export function getAllMessages(language: Language = 'he'): string[] {
  return MESSAGES_BY_LANGUAGE[language] || MESSAGES_BY_LANGUAGE.he;
}
