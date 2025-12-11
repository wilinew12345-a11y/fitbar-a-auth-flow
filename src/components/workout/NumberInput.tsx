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
  const increment = () => {
    onChange(value + step);
  };

  const decrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
      <span className="text-[10px] text-white/50">{label}</span>
      <div className="flex items-center gap-0.5">
        {/* Minus Button */}
        <button
          type="button"
          onClick={decrement}
          onPointerDown={onPointerDown}
          onMouseDown={onMouseDown}
          className="flex items-center justify-center w-5 h-8 text-[#DB0030] hover:text-[#ff1a4d] hover:bg-white/10 rounded-l-lg transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>

        {/* Input */}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          placeholder="0"
          className="w-10 h-8 bg-white/20 border-y border-white/30 text-white text-center text-sm font-medium placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#004d98] focus:border-transparent caret-[#DB0030]"
        />

        {/* Plus Button */}
        <button
          type="button"
          onClick={increment}
          onPointerDown={onPointerDown}
          onMouseDown={onMouseDown}
          className="flex items-center justify-center w-5 h-8 text-[#DB0030] hover:text-[#ff1a4d] hover:bg-white/10 rounded-r-lg transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};