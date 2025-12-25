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
  
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = Number(value) || 0;
    onChange(current + step);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = Number(value) || 0;
    const newValue = current - step;
    onChange(Math.max(min, newValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(e.target.value);
    if (isNaN(parsed)) {
      onChange(min);
    } else {
      onChange(Math.max(min, parsed));
    }
  };

  const isAtMin = (Number(value) || 0) <= min;

  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0 max-w-full box-border">
      <span className="text-[9px] md:text-[10px] text-white/50 font-medium">{label}</span>
      <div className="flex items-center gap-1 max-w-full">
        {/* Plus Button (Left) */}
        <button
          type="button"
          onClick={handleIncrement}
          className="relative flex items-center justify-center w-5 h-5 text-[#DB0030] hover:text-[#ff1a4d] active:text-[#b8002a] transition-colors select-none cursor-pointer flex-shrink-0
            before:content-[''] before:absolute before:inset-[-6px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Input Field (Center) */}
        <input
          type="number"
          value={value || ''}
          onChange={handleInputChange}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          placeholder="0"
          step="any"
          className="w-10 md:w-12 h-7 bg-white/10 border border-white/20 rounded-md text-white text-center text-sm font-semibold placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#004d98] focus:border-transparent caret-[#DB0030] min-w-0 flex-shrink box-border"
        />

        {/* Minus Button (Right) */}
        <button
          type="button"
          disabled={isAtMin}
          onClick={handleDecrement}
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
