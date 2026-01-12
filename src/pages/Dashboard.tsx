// Dashboard with onboarding flow
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrainingPlan } from '@/hooks/useTrainingPlan';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import LanguageSelector from '@/components/LanguageSelector';
import DailyTipCard from '@/components/dashboard/DailyTipCard';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { User, Dumbbell, TrendingUp, Trophy, Bot, Lock, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { isPlanMissing, loading: planLoading } = useTrainingPlan();
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show confetti when plan exists and coming from first setup
  useEffect(() => {
    const isFirstPlan = sessionStorage.getItem('firstPlanCreated');
    if (isFirstPlan && isPlanMissing === false && !hasShownConfetti) {
      sessionStorage.removeItem('firstPlanCreated');
      setHasShownConfetti(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#004d98', '#a50044', '#FFD700'],
      });
    }
  }, [isPlanMissing, hasShownConfetti]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleLockedClick = () => {
    toast({
      title: t('buildPlanFirst') || 'יש לבנות תוכנית אימונים תחילה',
      variant: 'destructive',
    });
  };

  const loading = authLoading || planLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044]" dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="p-6 flex items-center justify-between">
          <Skeleton className="h-10 w-32 bg-white/10" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-2 bg-white/10" />
            <Skeleton className="h-6 w-48 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-white/10" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const tiles = [
    {
      id: 'profile',
      title: t('cardProfile'),
      icon: User,
      route: '/weekly-setup',
      gradient: 'from-[#004d98] to-[#0066cc]',
      locked: false,
    },
    {
      id: 'workout-log',
      title: t('cardWorkout'),
      icon: Dumbbell,
      route: '/workout-log',
      gradient: 'from-[#a50044] to-[#cc0055]',
      locked: isPlanMissing,
    },
    {
      id: 'progress',
      title: t('cardProgress'),
      icon: TrendingUp,
      route: '/progress',
      gradient: 'from-[#0f766e] to-[#14b8a6]',
      locked: isPlanMissing,
    },
    {
      id: 'challenges',
      title: t('cardChallenges'),
      icon: Trophy,
      route: '/challenges',
      gradient: 'from-[#854d0e] to-[#ca8a04]',
      locked: isPlanMissing,
    },
    {
      id: 'ai-coach',
      title: t('cardAiCoach'),
      icon: Bot,
      route: '/ai-coach',
      gradient: 'from-[#7c3aed] to-[#a855f7]',
      locked: isPlanMissing,
    },
    {
      id: 'daily-tips',
      title: t('dailyTips'),
      icon: Lightbulb,
      route: '/daily-tips',
      gradient: 'from-[#7c3aed] to-[#eab308]',
      locked: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <FitBarcaLogo />
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <UserMenu onSignOut={handleSignOut} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t('greeting')}{user?.user_metadata?.first_name || ''}! 👋
          </h1>
          <p className="text-white/70 text-lg">{t('whatToDo')}</p>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => tile.locked ? handleLockedClick() : navigate(tile.route)}
              className={`
                group relative overflow-hidden rounded-2xl p-8
                bg-gradient-to-br ${tile.gradient}
                backdrop-blur-sm border border-white/20
                shadow-xl hover:shadow-2xl
                transition-all duration-300 ease-out
                ${tile.locked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-[1.02] hover:-translate-y-1'
                }
                ${isRtl ? 'text-right' : 'text-left'}
              `}
            >
              {/* Lock Overlay */}
              {tile.locked && (
                <div className="absolute top-4 left-4 p-2 rounded-full bg-black/40">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Background Glow */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <tile.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-2">{tile.title}</h2>

              {/* Arrow indicator */}
              {!tile.locked && (
                <div className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isRtl ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`}>
                  <span className="text-white text-2xl">{isRtl ? '←' : '→'}</span>
                </div>
              )}
            </button>
          ))}
          
          {/* Daily Tip Tile */}
          <DailyTipCard isRtl={isRtl} />
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
