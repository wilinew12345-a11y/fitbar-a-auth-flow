import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Lightbulb, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LanguageSelector from '@/components/LanguageSelector';
import { format } from 'date-fns';

const DailyTips = () => {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const { data: tips, isLoading } = useQuery({
    queryKey: ['daily-tips-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#0a1628]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <BackArrow className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              <h1 className="text-xl font-bold text-white">{t('dailyTips')}</h1>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-white/10" />
            ))}
          </div>
        ) : tips && tips.length > 0 ? (
          <div className="space-y-4">
            {tips.map((tip) => (
              <article
                key={tip.id}
                className={`
                  relative p-6 rounded-2xl
                  bg-white/5 backdrop-blur-md
                  border border-white/10
                  hover:bg-white/10 transition-colors
                  ${isRtl ? 'text-right' : 'text-left'}
                `}
              >
                {/* Header: Title + External Link */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      {tip.title || t('dailyMotivation')}
                    </h2>
                  </div>
                  
                  {tip.original_url && (
                    <a
                      href={tip.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-colors flex-shrink-0"
                      title={t('readFullArticle')}
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>

                {/* Date */}
                <p className="text-white/50 text-sm mb-3">
                  {format(new Date(tip.created_at), 'dd/MM/yyyy')}
                </p>

                {/* Content */}
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {tip.content}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
              <Lightbulb className="h-8 w-8 text-white/40" />
            </div>
            <p className="text-white/60 text-lg">{t('noTipsAvailable')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DailyTips;
