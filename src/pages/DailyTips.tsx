import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Lightbulb, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LanguageSelector from '@/components/LanguageSelector';
import { format } from 'date-fns';

interface TipTranslation {
  title?: string;
  content?: string;
}

interface TipContent {
  he?: TipTranslation;
  en?: TipTranslation;
  ar?: TipTranslation;
  es?: TipTranslation;
}

const DailyTips = () => {
  const navigate = useNavigate();
  const { t, isRtl, language } = useLanguage();

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

  // Parse JSON content and get translation for current language
  const getLocalizedContent = (contentStr: string): TipTranslation => {
    try {
      const parsed: TipContent = JSON.parse(contentStr);
      // Try current language first, fallback to English
      return parsed[language] || parsed.en || { title: '', content: contentStr };
    } catch {
      // If parsing fails, treat content as plain text (legacy format)
      return { title: '', content: contentStr };
    }
  };

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
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-3xl bg-white/5 backdrop-blur-xl" />
            ))}
          </div>
        ) : tips && tips.length > 0 ? (
          <div className="space-y-6">
            {tips.map((tip) => {
              const localized = getLocalizedContent(tip.content);
              
              return (
                <article
                  key={tip.id}
                  className={`
                    relative overflow-hidden p-8 rounded-3xl
                    bg-white/10 backdrop-blur-xl
                    border border-white/10
                    hover:shadow-lg hover:shadow-yellow-500/10
                    hover:border-white/20
                    transition-all duration-300
                    ${isRtl ? 'text-right' : 'text-left'}
                  `}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  {/* Decorative Background Element */}
                  <div className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-6 opacity-[0.05] pointer-events-none`}>
                    <Sparkles className="w-28 h-28 text-yellow-400" />
                  </div>

                  {/* Date - Small, uppercase, tracking-wide at top */}
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-4">
                    {format(new Date(tip.created_at), 'dd MMM yyyy')}
                  </p>

                  {/* Title - Gradient text, bold */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {localized.title || t('dailyMotivation')}
                    </h2>
                  </div>

                  {/* Content - Light weight, relaxed line height */}
                  <p className="text-white/90 leading-relaxed font-light whitespace-pre-wrap text-base">
                    {localized.content}
                  </p>

                  {/* Footer with External Link Button */}
                  {tip.original_url && (
                    <div className={`mt-6 pt-5 border-t border-white/5 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                      <a
                        href={tip.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex items-center gap-2
                          px-5 py-2.5 rounded-full
                          bg-yellow-500 text-black
                          font-semibold text-sm
                          hover:bg-yellow-400
                          hover:scale-105
                          active:scale-95
                          transition-all duration-200
                          shadow-lg shadow-yellow-500/25
                        "
                        title={t('readFullArticle')}
                      >
                        <span>{t('readMore') || 'Read Article'}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
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
