import { useNavigate } from 'react-router-dom';
import { Trophy, Wrench, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004D98] to-[#021024] overflow-hidden" dir="rtl">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-yellow-400 p-3 rounded-xl">
            <Trophy className="h-8 w-8 text-[#021024]" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Fit<span className="text-yellow-400">Barça</span>
          </h1>
        </div>

        {/* Headline */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
          תתאמן כמו אלוף.
        </h2>
        <p className="text-blue-200 text-lg md:text-xl mb-12 max-w-md mx-auto">
          הצטרף לאלפי מתאמנים שכבר שברו את השיאים של עצמם.
        </p>

        {/* CSS Phone Mockup */}
        <div className="flex justify-center mb-12">
          <div className="relative animate-float">
            {/* Phone Frame */}
            <div className="w-[280px] h-[550px] bg-black rounded-[3rem] border-4 border-gray-600 p-3 shadow-2xl shadow-black/50">
              {/* Phone Screen */}
              <div className="w-full h-full bg-gradient-to-b from-[#061E40] to-[#021024] rounded-[2.5rem] p-4 overflow-hidden">
                {/* Screen Header */}
                <div className="text-center mb-6 pt-4">
                  <p className="text-blue-200 text-sm mb-1">מעקב אתגרים</p>
                  <h3 className="text-white font-bold text-lg">האתגרים שלי</h3>
                </div>

                {/* Challenge Cards */}
                <div className="space-y-4">
                  {/* Card 1 - Completed */}
                  <div className="bg-blue-900/60 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold text-sm">אתגר ה-30</span>
                      <span className="text-green-400 text-xs font-bold">100%</span>
                    </div>
                    <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-500 rounded-full" />
                    </div>
                    <p className="text-blue-300 text-xs mt-2">🏆 הושלם!</p>
                  </div>

                  {/* Card 2 - In Progress */}
                  <div className="bg-blue-900/60 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold text-sm">אתגר ה-60</span>
                      <span className="text-yellow-400 text-xs font-bold">40%</span>
                    </div>
                    <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-[#A50044] rounded-full" />
                    </div>
                    <p className="text-blue-300 text-xs mt-2">24/60 אימונים</p>
                  </div>

                  {/* Card 3 - Just Started */}
                  <div className="bg-blue-900/60 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold text-sm">אתגר מותאם</span>
                      <span className="text-blue-300 text-xs font-bold">10%</span>
                    </div>
                    <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden">
                      <div className="h-full w-[10%] bg-[#A50044] rounded-full" />
                    </div>
                    <p className="text-blue-300 text-xs mt-2">3/30 אימונים</p>
                  </div>
                </div>

                {/* Mini FAB */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                  <div className="w-10 h-10 bg-[#A50044] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/auth')}
          className="bg-[#A50044] hover:bg-[#800033] text-white text-xl px-10 py-6 rounded-full shadow-lg shadow-[#A50044]/40 animate-pulse-glow"
        >
          התחל את האתגר ⚽
        </Button>
      </div>

      {/* Feature Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="text-center">
            <div className="bg-blue-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-700/30">
              <Wrench className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-white font-semibold text-sm">בנייה אישית</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-700/30">
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-white font-semibold text-sm">מעקב צמוד</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-700/30">
              <Users className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-white font-semibold text-sm">שתף והצלח</p>
          </div>
        </div>
      </div>

      {/* Live Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-yellow-400 mx-8">🔥 יוסי סיים אימון חזה</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">🏆 דנה השלימה אתגר ה-30</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">⚽ עמית הצטרף לאתגר חדש</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">💪 שירה שברה שיא אישי</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">🔥 יוסי סיים אימון חזה</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">🏆 דנה השלימה אתגר ה-30</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">⚽ עמית הצטרף לאתגר חדש</span>
          <span className="text-yellow-400 mx-8">|</span>
          <span className="text-yellow-400 mx-8">💪 שירה שברה שיא אישי</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
