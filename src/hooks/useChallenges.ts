import { useState, useEffect } from 'react';

export interface Workout {
  id: string;
  text: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  targetPerWeek: number;
  workouts: Workout[];
  createdAt: string;
}

const STORAGE_KEY = 'gym-challenges';

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-30',
    title: 'אתגר ה-30',
    targetPerWeek: 5,
    createdAt: new Date().toISOString(),
    workouts: [
      'אימון ריצה + בטן',
      'חזה/כתפיים/יד אחורית',
      'יד קדמית/גב',
      'רגליים',
      'ריצה/יד אחורית/חזה/בטן',
      'יד קדמית/גב/בטן',
      'כתפיים/רגליים',
      'חזה/יד אחורית',
      'רגליים/כתפיים',
      'חזה/יד אחורית',
      'יד קדמית/גב/בטן',
      'רגליים/כתפיים',
      'חזה/יד אחורית/בטן/אירובי',
      'רגליים/כתפיים/בטן',
      'יד קדמית/גב',
      'חזה/יד אחורית/בטן/אירובי',
      'יד קדמית/גב/בטן',
      'רגליים/כתפיים',
      'אירובי/בטן - פעם ראשונה ביום שבת!!!',
      'חזה/יד אחורית/בט',
      'יד קדמית/גב/קפיצה עם חבל',
      'רגליים/כתפיים',
      'אימון חלק עליון+תחתון/קפיצה עם החבל-יום שבת!!!',
      'חזה/יד אחורית/בטן/אירובי',
      'יד קדמית/גב/בטן',
      'רגליים/כתפיים',
      'חזה/יד אחורית/בטן/אירובי (קפיצה עם החבל)',
      'יד קדמית/גב/קפיצה עם חבל/בטן',
      'רגליים/כתפיים/בטן',
      'חזה/יד אחורית/בטן/אירובי',
    ].map((text, index) => ({
      id: `workout-30-${index}`,
      text,
      completed: false,
    })),
  },
  {
    id: 'challenge-60',
    title: 'אתגר ה-60',
    targetPerWeek: 4,
    createdAt: new Date().toISOString(),
    workouts: [
      'יד קדמית/גב/קפיצה עם חבל/בטן',
      'רגליים/כתפיים',
      'חזה/יד אחורית/אירובי/בטן',
      'יד קדמית/גב/בטן/אירובי/קפיצה עם החבל',
      'רגליים/כתפיים/אירובי/בטן (לא אימון מלא)',
      'רגליים/כתפיים/בטן',
      'חזה/יד אחורית/אירובי/בטן',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב',
      'כתפיים/אירובי',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב',
      'בטן',
      'כתפיים/תרגיל אחד רגליים',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב/אופניים אירובי',
      'כתפיים/בטן',
      'פול באדי',
      'חזה/יד אחורית',
      'יד קדמית/גב/בטן',
      'כתפיים',
      'גב/יד קדמית,אחורית/חזה/אירובי/בטן -סט 1',
      'חזה/יד אחורית/מתח/בטן',
      'יד קדמית/גב/בטן',
      'אימון ריצה',
      'כתפיים/רגליים',
      'גב/יד אחורית וקדמית/חזה/בטן',
      'חזה/יד אחורית/בטן',
      'יד קדמית/גב/בטן',
      'כתפיים/בטן',
      'גב/יד אחורית וקדמית/חזה/כתפיים/בטן',
      'חזה/יד אחורית/בטן',
      'כתפיים/בטן',
      'ריצה/מתח/בטן',
      'מתח/גב/יד קדמית/בטן',
      'מתח/יד אחורית/חזה/בטן',
      'מתח/גב/יד קדמית/בטן',
      'ריצה 30 דקות/מתח/שכיבות שמיכה',
      'כתפיים/מתח/בטן',
      'גב/יד קדמית/חזה/יד אחורית/מתח/בטן',
      'חזה/יד אחורית/מתח/בטן',
      'גב/יד קדמית/חזה/יד אחורית/מתח/בטן',
      'כתפיים/רגליים/מתח/בטן',
      'מתח/חיזוק forearms/בטן',
      'גב/יד קדמית/אמות',
      'כתפיים/רגליים/מתח/בטן',
      'ריצה/רגליים/כתפיים/גב/יד קדמית/אחורית/חזה',
      'חזה/יד אחורית/בטן',
      'גב/יד קדמית/אמות/מתח/בטן',
      'פול באדי כל תרגיל סט אחד',
      'חזה/יד אחורית/בטן/מתח',
      'גב/יד קדמית/אמות',
      'ריצה/מתח/שכיבות שמיכנ',
      'כתפיים/גב/מתח/בטן',
      'חזה/יד אחורית/מתח/בטן',
      'גב/יד קדמית/מתח/בטן',
      'אירובי/מתח/שכיבות שמיכה',
      'כתפיים/רגליים/מתח/בטן',
      'אימון השלמה 1',
      'אימון השלמה 2',
    ].map((text, index) => ({
      id: `workout-60-${index}`,
      text,
      completed: false,
    })),
  },
];

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setChallenges(JSON.parse(stored));
      } catch {
        setChallenges(DEFAULT_CHALLENGES);
      }
    } else {
      setChallenges(DEFAULT_CHALLENGES);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever challenges change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    }
  }, [challenges, isLoaded]);

  const addChallenge = (title: string, targetPerWeek: number, workoutsText: string) => {
    const workouts = workoutsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((text, index) => ({
        id: `workout-${Date.now()}-${index}`,
        text,
        completed: false,
      }));

    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title,
      targetPerWeek,
      workouts,
      createdAt: new Date().toISOString(),
    };

    setChallenges(prev => [...prev, newChallenge]);
    return newChallenge;
  };

  const deleteChallenge = (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
  };

  const toggleWorkout = (challengeId: string, workoutId: string) => {
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? {
              ...challenge,
              workouts: challenge.workouts.map(w =>
                w.id === workoutId ? { ...w, completed: !w.completed } : w
              ),
            }
          : challenge
      )
    );
  };

  const resetChallenge = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? {
              ...challenge,
              workouts: challenge.workouts.map(w => ({ ...w, completed: false })),
            }
          : challenge
      )
    );
  };

  const getProgress = (challenge: Challenge) => {
    const completed = challenge.workouts.filter(w => w.completed).length;
    const total = challenge.workouts.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  return {
    challenges,
    isLoaded,
    addChallenge,
    deleteChallenge,
    toggleWorkout,
    resetChallenge,
    getProgress,
  };
};
