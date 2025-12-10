import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import { User, Dumbbell, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const tiles = [
    {
      id: 'profile',
      title: 'הפרופיל שלי',
      description: 'צפה ועדכן את הפרטים האישיים שלך',
      icon: User,
      route: '/weekly-setup',
      gradient: 'from-[#004d98] to-[#0066cc]',
    },
    {
      id: 'workout-log',
      title: 'יומן אימונים',
      description: 'נהל ועקוב אחר התרגילים שלך',
      icon: Dumbbell,
      route: '/workout-log',
      gradient: 'from-[#a50044] to-[#cc0055]',
    },
    {
      id: 'progress',
      title: 'גרף התקדמות',
      description: 'צפה בהתקדמות שלך לאורך זמן',
      icon: TrendingUp,
      route: '/progress',
      gradient: 'from-[#0f766e] to-[#14b8a6]',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044]" dir="rtl">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <FitBarcaLogo />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            שלום, {user?.user_metadata?.first_name || 'ספורטאי'}! 👋
          </h1>
          <p className="text-white/70 text-lg">מה נעשה היום?</p>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => navigate(tile.route)}
              className={`
                group relative overflow-hidden rounded-2xl p-8
                bg-gradient-to-br ${tile.gradient}
                backdrop-blur-sm border border-white/20
                shadow-xl hover:shadow-2xl
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:-translate-y-1
                text-right
              `}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="mb-4 inline-flex p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <tile.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-2">{tile.title}</h2>
              <p className="text-white/70">{tile.description}</p>

              {/* Arrow indicator */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <span className="text-white text-2xl">←</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
