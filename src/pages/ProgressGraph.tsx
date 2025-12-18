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
  speed: number | null;
  incline: number | null;
  duration: number | null;
  duration_minutes: number | null;
  created_at: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  color: string;
}

type CardioMetric = 'speed' | 'incline' | 'duration';

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
  const [selectedMetric, setSelectedMetric] = useState<CardioMetric>('speed');

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
        .select('id, exercise_name, weight, sets, reps, speed, incline, duration, duration_minutes, created_at')
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
      item => (Number(item.speed) > 0 || Number(item.duration) > 0 || Number(item.duration_minutes) > 0) && Number(item.weight) === 0
    );
    return cardioEntries.length > historyData.length / 2;
  }, [historyData]);

  // Auto-select best metric when exercise changes
  useEffect(() => {
    if (!isCardioExercise || historyData.length === 0) return;
    
    // Check which metrics have meaningful data
    const avgSpeed = historyData.reduce((sum, item) => sum + (Number(item.speed) || 0), 0) / historyData.length;
    const avgIncline = historyData.reduce((sum, item) => sum + (Number(item.incline) || 0), 0) / historyData.length;
    const avgDuration = historyData.reduce((sum, item) => sum + (Number(item.duration_minutes) || Number(item.duration) || 0), 0) / historyData.length;
    
    // Default to speed, then incline, then duration
    if (avgSpeed > 0) {
      setSelectedMetric('speed');
    } else if (avgIncline > 0) {
      setSelectedMetric('incline');
    } else if (avgDuration > 0) {
      setSelectedMetric('duration');
    }
  }, [historyData, isCardioExercise, selectedExercise]);

  // Get value for the selected metric
  const getMetricValue = (item: WorkoutHistory): number => {
    if (!isCardioExercise) {
      return Number(item.weight) || 0;
    }
    
    switch (selectedMetric) {
      case 'speed':
        return Number(item.speed) || 0;
      case 'incline':
        return Number(item.incline) || 0;
      case 'duration':
        return Number(item.duration_minutes) || Number(item.duration) || 0;
      default:
        return 0;
    }
  };

  // Process data for chart with traffic light logic
  const chartData: ChartDataPoint[] = useMemo(() => {
    return historyData.map((item, index) => {
      const currentValue = getMetricValue(item);
      let color = '#fbbf24'; // Yellow - default/first/stagnation
      
      if (index > 0) {
        const prevValue = getMetricValue(historyData[index - 1]);
        
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
  }, [historyData, isCardioExercise, selectedMetric]);

  // Get the appropriate Y-axis label
  const yAxisLabel = useMemo(() => {
    if (!isCardioExercise) {
      return t('weightKg');
    }
    
    switch (selectedMetric) {
      case 'speed':
        return `${t('speed')} (km/h)`;
      case 'incline':
        return `${t('incline')} (%)`;
      case 'duration':
        return `${t('time')} (min)`;
      default:
        return '';
    }
  }, [isCardioExercise, selectedMetric, t]);

  // Get the appropriate tooltip formatter
  const tooltipFormatter = useMemo(() => {
    if (!isCardioExercise) {
      return (value: number) => [`${value} kg`, t('weight')];
    }
    
    switch (selectedMetric) {
      case 'speed':
        return (value: number) => [`${value} km/h`, t('speed')];
      case 'incline':
        return (value: number) => [`${value}%`, t('incline')];
      case 'duration':
        return (value: number) => [`${value} min`, t('time')];
      default:
        return (value: number) => [`${value}`, ''];
    }
  }, [isCardioExercise, selectedMetric, t]);

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
          
          {/* Metric Selector for Cardio */}
          {historyData.length > 0 && isCardioExercise && (
            <div className="mt-4">
              <label className="text-white/80 text-sm block mb-2">{t('selectExercise')} Metric:</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedMetric === 'speed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric('speed')}
                  className={selectedMetric === 'speed' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                >
                  {t('speed')} (km/h)
                </Button>
                <Button
                  variant={selectedMetric === 'incline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric('incline')}
                  className={selectedMetric === 'incline' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                >
                  {t('incline')} (%)
                </Button>
                <Button
                  variant={selectedMetric === 'duration' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric('duration')}
                  className={selectedMetric === 'duration' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                >
                  {t('time')} (min)
                </Button>
              </div>
            </div>
          )}

          {/* Show exercise type indicator */}
          {historyData.length > 0 && (
            <div className="mt-3 text-sm text-white/60">
              {isCardioExercise ? (
                <span>📍 {t('aerobic')}</span>
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