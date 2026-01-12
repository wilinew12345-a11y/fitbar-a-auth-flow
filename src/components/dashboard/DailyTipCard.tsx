import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ExternalLink } from 'lucide-react';

const DailyTipCard = () => {
  const { t } = useLanguage();

  const { data: tip, isLoading } = useQuery({
    queryKey: ['daily-tip'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-pink-500/10 border border-yellow-500/30 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-white/10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full bg-white/10 mb-2" />
          <Skeleton className="h-4 w-3/4 bg-white/10" />
        </CardContent>
      </Card>
    );
  }

  if (!tip) {
    return null;
  }

  const handleReadMore = () => {
    if (tip.original_url) {
      window.open(tip.original_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-pink-500/10 border border-yellow-500/30 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          {tip.title || t('dailyMotivation')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/80 leading-relaxed">{tip.content}</p>
      </CardContent>
      {tip.original_url && (
        <CardFooter className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReadMore}
            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 gap-2"
          >
            {t('readFullArticle')}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DailyTipCard;
