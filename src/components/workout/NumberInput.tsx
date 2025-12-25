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
    // Trigger save after button interaction ends
    onBlur();
  }, [onBlur]);

  const stopContinuousChangeNoSave = useCallback(() => {
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
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0 max-w-full box-border">
      <span className="text-[9px] md:text-[10px] text-white/50 font-medium">{label}</span>
      <div className="flex items-center gap-1 max-w-full">
        {/* Plus Button (Left) - minimalist icon */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            startContinuousChange('increment', value);
          }}
          onMouseUp={stopContinuousChange}
          onMouseLeave={stopContinuousChangeNoSave}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
            startContinuousChange('increment', value);
          }}
          onTouchEnd={stopContinuousChange}
          className="relative flex items-center justify-center w-5 h-5 text-[#DB0030] hover:text-[#ff1a4d] active:text-[#b8002a] transition-colors select-none cursor-pointer flex-shrink-0
            before:content-[''] before:absolute before:inset-[-6px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Input Field (Center) */}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          placeholder="0"
          className="w-10 md:w-12 h-7 bg-white/10 border border-white/20 rounded-md text-white text-center text-sm font-semibold placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#004d98] focus:border-transparent caret-[#DB0030] min-w-0 flex-shrink box-border"
        />

        {/* Minus Button (Right) - minimalist icon */}
        <button
          type="button"
          disabled={isAtMin}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isAtMin) startContinuousChange('decrement', value);
          }}
          onMouseUp={stopContinuousChange}
          onMouseLeave={stopContinuousChangeNoSave}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isAtMin) startContinuousChange('decrement', value);
          }}
          onTouchEnd={stopContinuousChange}
          className={`relative flex items-center justify-center w-5 h-5 transition-colors select-none flex-shrink-0
            before:content-[''] before:absolute before:inset-[-6px]
            ${isAtMin 
              ? 'text-[#DB0030]/40 cursor-not-allowed' 
              : 'text-[#DB0030] hover:text-[#ff1a4d] active:text-[#b8002a] cursor-pointer'
            }`}
        >
          <Minus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};