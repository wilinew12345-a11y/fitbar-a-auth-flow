import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import FitBarcaLogo from '@/components/FitBarcaLogo';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WorkoutHistory {
  id: string;
  exercise_name: string;
  weight: number;
  sets: number;
  reps: number;
  speed: number;
  incline: number;
  duration: number;
  created_at: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  color: string;
}

// Custom dot component with traffic light colors
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  
  const color = payload.color || '#fbbf24';
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

const ProgressGraph = () => {
  const { user, loading } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [historyData, setHistoryData] = useState<WorkoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch distinct exercise names
  useEffect(() => {
    const fetchExerciseNames = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('exercises')
        .select('name')
        .eq('user_id', user.id);

      if (!error && data) {
        const uniqueNames = [...new Set(data.map(d => d.name))];
        setExerciseNames(uniqueNames);
        if (uniqueNames.length > 0) {
          setSelectedExercise(uniqueNames[0]);
        }
      }
      setIsLoading(false);
    };

    if (user) {
      fetchExerciseNames();
    }
  }, [user]);

  // Fetch history for selected exercise
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !selectedExercise) return;

      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_name', selectedExercise)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setHistoryData(data as WorkoutHistory[]);
      }
    };

    fetchHistory();
  }, [user, selectedExercise]);

  // Determine if this is a cardio exercise based on data
  const isCardioExercise = useMemo(() => {
    if (historyData.length === 0) return false;
    // Check if most entries have speed/duration > 0 and weight = 0
    const cardioEntries = historyData.filter(
      item => (Number(item.speed) > 0 || Number(item.duration) > 0) && Number(item.weight) === 0
    );
    return cardioEntries.length > historyData.length / 2;
  }, [historyData]);

  // Determine primary metric for cardio
  const primaryCardioMetric = useMemo(() => {
    if (!isCardioExercise || historyData.length === 0) return 'speed';
    // Use speed if it has meaningful values, otherwise duration
    const avgSpeed = historyData.reduce((sum, item) => sum + Number(item.speed), 0) / historyData.length;
    return avgSpeed > 0 ? 'speed' : 'duration';
  }, [historyData, isCardioExercise]);

  // Process data for chart with traffic light logic
  const chartData: ChartDataPoint[] = useMemo(() => {
    return historyData.map((item, index) => {
      // Get the appropriate value based on exercise type
      let currentValue: number;
      if (isCardioExercise) {
        currentValue = primaryCardioMetric === 'speed' 
          ? Number(item.speed) || 0 
          : Number(item.duration) || 0;
      } else {
        currentValue = Number(item.weight) || 0;
      }

      let color = '#fbbf24'; // Yellow - default/first/stagnation
      
      if (index > 0) {
        let prevValue: number;
        if (isCardioExercise) {
          prevValue = primaryCardioMetric === 'speed'
            ? Number(historyData[index - 1].speed) || 0
            : Number(historyData[index - 1].duration) || 0;
        } else {
          prevValue = Number(historyData[index - 1].weight) || 0;
        }
        
        if (currentValue > prevValue) {
          color = '#22c55e'; // Green - progress
        } else if (currentValue < prevValue) {
          color = '#ef4444'; // Red - regression
        }
      }

      return {
        date: format(new Date(item.created_at), 'dd/MM'),
        value: currentValue,
        color,
      };
    });
  }, [historyData, isCardioExercise, primaryCardioMetric]);

  // Get the appropriate Y-axis label
  const yAxisLabel = useMemo(() => {
    if (isCardioExercise) {
      return primaryCardioMetric === 'speed' ? t('speed') : t('time');
    }
    return t('weightKg');
  }, [isCardioExercise, primaryCardioMetric, t]);

  // Get the appropriate tooltip formatter
  const tooltipFormatter = useMemo(() => {
    if (isCardioExercise) {
      if (primaryCardioMetric === 'speed') {
        return (value: number) => [`${value} km/h`, t('speed')];
      }
      return (value: number) => [`${value} min`, t('time')];
    }
    return (value: number) => [`${value} kg`, t('weight')];
  }, [isCardioExercise, primaryCardioMetric, t]);

  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d98] via-[#0a1628] to-[#a50044]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between sticky top-0 z-50 bg-gradient-to-b from-[#004d98]/90 to-transparent backdrop-blur-sm">
        <FitBarcaLogo />
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <BackIcon className="h-5 w-5 mx-2" />
            {t('back')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">{t('progressGraph')}</h1>

        {/* Exercise Selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 border border-white/20">
          <label className="text-white/80 text-sm block mb-2">{t('selectExercise')}</label>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder={t('selectExercise')} />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2a4a] border-white/20">
              {exerciseNames.map((name) => (
                <SelectItem 
                  key={name} 
                  value={name}
                  className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                >
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Show exercise type indicator */}
          {historyData.length > 0 && (
            <div className="mt-3 text-sm text-white/60">
              {isCardioExercise ? (
                <span>📍 {t('aerobic')} - {primaryCardioMetric === 'speed' ? t('speed') : t('time')}</span>
              ) : (
                <span>💪 {t('strength')} - {t('weight')}</span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-white/80 text-sm">{t('progress')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
            <span className="text-white/80 text-sm">{t('noChange')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-white/80 text-sm">{t('decline')}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-white/60">
              {t('noData')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  label={{ 
                    value: yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: 'rgba(255,255,255,0.6)',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(26, 42, 74, 0.95)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  formatter={tooltipFormatter}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgressGraph;