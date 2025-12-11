import { useRef, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  min?: number;
  step?: number;
}

export const NumberInput = ({
  label,
  value,
  onChange,
  onBlur,
  onPointerDown,
  onMouseDown,
  onKeyDown,
  min = 0,
  step = 1,
}: NumberInputProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const increment = useCallback(() => {
    onChange(value + step);
  }, [value, step, onChange]);

  const decrement = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [value, step, min, onChange]);

  const startContinuousChange = useCallback((action: 'increment' | 'decrement', currentValue: number) => {
    const fn = action === 'increment' ? increment : decrement;
    fn(); // Immediate first action
    
    let val = action === 'increment' ? currentValue + step : Math.max(min, currentValue - step);
    
    // Start rapid changes after 400ms delay
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (action === 'increment') {
          val = val + step;
        } else {
          val = Math.max(min, val - step);
        }
        onChange(val);
      }, 80);
    }, 400);
  }, [increment, decrement, onChange, step, min]);

  const stopContinuousChange = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const isAtMin = value <= min;

  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span className="text-[10px] text-white/50 font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isAtMin}
          onMouseDown={(e) => {
            onMouseDown(e);
            if (!isAtMin) startContinuousChange('decrement', value);
          }}
          onMouseUp={stopContinuousChange}
          onMouseLeave={stopContinuousChange}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!isAtMin) startContinuousChange('decrement', value);
          }}
          onTouchEnd={stopContinuousChange}
          onPointerDown={onPointerDown}
          className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#DB0030] text-white font-bold transition-all select-none
            ${isAtMin 
              ? 'opacity-40 cursor-not-allowed' 
              : 'hover:bg-[#ff1a4d] hover:scale-105 active:scale-95 active:bg-[#b8002a] cursor-pointer shadow-md hover:shadow-lg'
            }`}
        >
          <Minus className="h-4 w-4 stroke-[3]" />
        </button>

        {/* Input Field */}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          placeholder="0"
          className="w-12 h-8 bg-white/20 border border-white/30 rounded-lg text-white text-center text-sm font-bold placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#004d98] focus:border-transparent caret-[#DB0030]"
        />

        <button
          type="button"
          onMouseDown={(e) => {
            onMouseDown(e);
            startContinuousChange('increment', value);
          }}
          onMouseUp={stopContinuousChange}
          onMouseLeave={stopContinuousChange}
          onTouchStart={(e) => {
            e.preventDefault();
            startContinuousChange('increment', value);
          }}
          onTouchEnd={stopContinuousChange}
          onPointerDown={onPointerDown}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#DB0030] text-white font-bold transition-all select-none cursor-pointer shadow-md hover:bg-[#ff1a4d] hover:scale-105 hover:shadow-lg active:scale-95 active:bg-[#b8002a]"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};