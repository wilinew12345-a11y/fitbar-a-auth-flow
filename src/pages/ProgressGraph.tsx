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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

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
type StrengthMetric = 'weight' | 'reps' | 'sets';
type Metric = CardioMetric | StrengthMetric;

// Multilingual cardio keywords for fallback detection
const CARDIO_KEYWORDS = [
  // English
  'cardio', 'aerobic', 'running', 'treadmill', 'cycling', 'bike', 'elliptical', 'rowing',
  // Hebrew
  'אירובי', 'ריצה', 'הליכון', 'אופניים', 'אליפטי',
  // Spanish
  'aeróbico', 'correr', 'cinta', 'bicicleta', 'elíptica',
  // Arabic
  'كارديو', 'تمارين هوائية', 'ركض', 'جري', 'دراجة'
];

// Helper function to check if text contains cardio keywords (case-insensitive)
const containsCardioKeyword = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return CARDIO_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

// Custom Tooltip component with premium styling
const CustomChartTooltip = ({ 
  active, 
  payload, 
  label,
  formatter 
}: TooltipProps<ValueType, NameType> & { formatter: (value: number) => [string, string] }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const value = payload[0].value as number;
  const [formattedValue, metricLabel] = formatter(value);
  const color = payload[0].payload.color;
  
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div 
          className="w-2.5 h-2.5 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <span className="text-white font-semibold text-lg">{formattedValue}</span>
        <span className="text-slate-400 text-sm">{metricLabel}</span>
      </div>
    </div>
  );
};

const ProgressGraph = () => {
  const { user, loading } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [historyData, setHistoryData] = useState<WorkoutHistory[]>([]);
  const [exerciseBodyPart, setExerciseBodyPart] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<Metric>('weight');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch distinct exercise names with body_part
  useEffect(() => {
    const fetchExerciseNames = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('exercises')
        .select('name, body_part')
        .eq('user_id', user.id);

      if (!error && data) {
        const uniqueNames = [...new Set(data.map(d => d.name))];
        setExerciseNames(uniqueNames);
        if (uniqueNames.length > 0) {
          setSelectedExercise(uniqueNames[0]);
          // Set initial body part
          const firstExercise = data.find(d => d.name === uniqueNames[0]);
          setExerciseBodyPart(firstExercise?.body_part || '');
        }
      }
      setIsLoading(false);
    };

    if (user) {
      fetchExerciseNames();
    }
  }, [user]);

  // Fetch body_part when exercise changes
  useEffect(() => {
    const fetchBodyPart = async () => {
      if (!user || !selectedExercise) return;

      const { data } = await supabase
        .from('exercises')
        .select('body_part')
        .eq('user_id', user.id)
        .eq('name', selectedExercise)
        .maybeSingle();

      setExerciseBodyPart(data?.body_part || '');
    };

    fetchBodyPart();
  }, [user, selectedExercise]);

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

  // Robust cardio detection: Data-driven (primary) + Keyword-based (fallback)
  const isCardioExercise = useMemo(() => {
    // Strategy A: Data-Driven (Universal) - Check if ANY data has cardio metrics
    const hasCardioData = historyData.some(
      item => (Number(item.speed) > 0 || Number(item.duration_minutes) > 0 || Number(item.duration) > 0)
    );
    
    if (hasCardioData) {
      return true;
    }

    // Strategy B: Multilingual Keywords (Fallback) - Check body_part and exercise name
    if (containsCardioKeyword(exerciseBodyPart) || containsCardioKeyword(selectedExercise)) {
      return true;
    }

    // Final check: If all entries have weight = 0 and we have data, likely cardio
    if (historyData.length > 0) {
      const allZeroWeight = historyData.every(item => Number(item.weight) === 0);
      if (allZeroWeight) {
        return true;
      }
    }

    return false;
  }, [historyData, exerciseBodyPart, selectedExercise]);

  // Reset metric when switching between cardio and strength exercises
  useEffect(() => {
    if (isCardioExercise) {
      // Check which cardio metric has data and default to it
      const hasSpeed = historyData.some(item => Number(item.speed) > 0);
      const hasIncline = historyData.some(item => Number(item.incline) > 0);
      const hasDuration = historyData.some(item => Number(item.duration_minutes) > 0 || Number(item.duration) > 0);
      
      if (hasSpeed) {
        setSelectedMetric('speed');
      } else if (hasIncline) {
        setSelectedMetric('incline');
      } else if (hasDuration) {
        setSelectedMetric('duration');
      } else {
        setSelectedMetric('speed'); // default
      }
    } else {
      // Strength exercise - default to weight
      setSelectedMetric('weight');
    }
  }, [isCardioExercise, selectedExercise]);

  // Get value for the selected metric
  const getMetricValue = (item: WorkoutHistory): number => {
    switch (selectedMetric) {
      // Cardio metrics
      case 'speed':
        return Number(item.speed) || 0;
      case 'incline':
        return Number(item.incline) || 0;
      case 'duration':
        return Number(item.duration_minutes) || Number(item.duration) || 0;
      // Strength metrics
      case 'weight':
        return Number(item.weight) || 0;
      case 'reps':
        return Number(item.reps) || 0;
      case 'sets':
        return Number(item.sets) || 0;
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
    switch (selectedMetric) {
      // Cardio
      case 'speed':
        return `${t('speed')} (km/h)`;
      case 'incline':
        return `${t('incline')} (%)`;
      case 'duration':
        return `${t('time')} (min)`;
      // Strength
      case 'weight':
        return t('weightKg');
      case 'reps':
        return t('reps');
      case 'sets':
        return t('sets');
      default:
        return '';
    }
  }, [selectedMetric, t]);

  // Get the appropriate tooltip formatter
  const tooltipFormatter = useMemo((): ((value: number) => [string, string]) => {
    switch (selectedMetric) {
      // Cardio
      case 'speed':
        return (value: number): [string, string] => [`${value} km/h`, t('speed')];
      case 'incline':
        return (value: number): [string, string] => [`${value}%`, t('incline')];
      case 'duration':
        return (value: number): [string, string] => [`${value} min`, t('time')];
      // Strength
      case 'weight':
        return (value: number): [string, string] => [`${value} kg`, t('weight')];
      case 'reps':
        return (value: number): [string, string] => [`${value}`, t('reps')];
      case 'sets':
        return (value: number): [string, string] => [`${value}`, t('sets')];
      default:
        return (value: number): [string, string] => [`${value}`, ''];
    }
  }, [selectedMetric, t]);

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
          
          {/* Metric Selector */}
          {historyData.length > 0 && (
            <div className="mt-4">
              <label className="text-white/80 text-sm block mb-2">
                {isCardioExercise ? '📍 ' + t('aerobic') : '💪 ' + t('strength')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {isCardioExercise ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Button
                      variant={selectedMetric === 'weight' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('weight')}
                      className={selectedMetric === 'weight' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      {t('weight')} (kg)
                    </Button>
                    <Button
                      variant={selectedMetric === 'sets' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('sets')}
                      className={selectedMetric === 'sets' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      {t('sets')}
                    </Button>
                    <Button
                      variant={selectedMetric === 'reps' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMetric('reps')}
                      className={selectedMetric === 'reps' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      {t('reps')}
                    </Button>
                  </>
                )}
              </div>
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
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.08)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  label={{ 
                    value: yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: 'rgba(255,255,255,0.5)',
                    style: { textAnchor: 'middle', fontSize: 11 }
                  }}
                />
                <Tooltip 
                  content={<CustomChartTooltip formatter={tooltipFormatter} />}
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#818cf8"
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 0, 
                    fill: '#a78bfa',
                    filter: 'drop-shadow(0 0 6px rgba(167, 139, 250, 0.6))'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgressGraph;