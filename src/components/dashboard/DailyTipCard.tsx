import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

interface DailyTipCardProps {
  isRtl?: boolean;
}

const DailyTipCard = ({ isRtl = false }: DailyTipCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return <Skeleton className="h-40 rounded-2xl bg-white/10" />;
  }

  if (!tip) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/daily-tips')}
      className={`
        group relative overflow-hidden rounded-2xl p-8
        bg-gradient-to-br from-[#7c3aed] to-[#eab308]
        backdrop-blur-sm border border-white/20
        shadow-xl hover:shadow-2xl
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        ${isRtl ? 'text-right' : 'text-left'}
        w-full
      `}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon */}
      <div className="mb-4 inline-flex p-4 rounded-xl bg-white/10 backdrop-blur-sm">
        <Lightbulb className="h-8 w-8 text-white" />
      </div>

      {/* Content */}
      <h2 className="text-2xl font-bold text-white mb-2">{t('dailyMotivation')}</h2>

      {/* Arrow indicator */}
      <div className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isRtl ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`}>
        <span className="text-white text-2xl">{isRtl ? '←' : '→'}</span>
      </div>
    </button>
  );
};

export default DailyTipCard;
