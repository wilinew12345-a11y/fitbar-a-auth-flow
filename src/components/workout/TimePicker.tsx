import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

const TimePicker = ({ value, onChange, disabled = false, className = '' }: TimePickerProps) => {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Clock className="absolute left-3 w-4 h-4 text-white/60 pointer-events-none z-10" />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-[120px] pl-10 pr-3 py-2 rounded-lg
          bg-white/10 border border-white/20
          text-white text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-[#FFED02]/50 focus:border-[#FFED02]/50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          [&::-webkit-calendar-picker-indicator]:filter
          [&::-webkit-calendar-picker-indicator]:invert
          [&::-webkit-calendar-picker-indicator]:opacity-60
          [&::-webkit-calendar-picker-indicator]:hover:opacity-100
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
        `}
      />
    </div>
  );
};

export default TimePicker;
