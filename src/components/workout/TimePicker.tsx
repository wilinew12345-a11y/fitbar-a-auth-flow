import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

const TimePicker = ({ value, onChange, disabled = false, className = '' }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedHour, selectedMinute] = value ? value.split(':') : ['09', '00'];
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Scroll to selected values when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const hourIndex = HOURS.indexOf(selectedHour);
        const minuteIndex = MINUTES.indexOf(selectedMinute);
        
        if (hourRef.current && hourIndex >= 0) {
          const scrollTop = Math.max(0, hourIndex * 40 - 80);
          hourRef.current.scrollTop = scrollTop;
        }
        if (minuteRef.current && minuteIndex >= 0) {
          const scrollTop = Math.max(0, minuteIndex * 40 - 80);
          minuteRef.current.scrollTop = scrollTop;
        }
      }, 50);
    }
  }, [open, selectedHour, selectedMinute]);

  const handleTimeSelect = (hour: string, minute: string) => {
    onChange(`${hour}:${minute}`);
    setOpen(false);
  };

  const handleHourClick = (hour: string) => {
    handleTimeSelect(hour, selectedMinute);
  };

  const handleMinuteClick = (minute: string) => {
    handleTimeSelect(selectedHour, minute);
  };

  const displayTime = value || '09:00';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-[130px] justify-start gap-2 px-3 py-2",
            "bg-white/10 border-white/20 hover:bg-white/15 hover:border-primary/50",
            "text-white font-medium text-sm",
            "focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            className
          )}
        >
          <Clock className="w-4 h-4 text-white/60" />
          <span>{displayTime}</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[180px] p-0 bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl"
        align="start"
        sideOffset={8}
      >
        <div className="flex items-center justify-center py-2 border-b border-white/10">
          <span className="text-xs text-muted-foreground font-medium">בחר שעה</span>
        </div>
        
        <div className="flex h-[200px]">
          {/* Hours Column */}
          <div className="flex-1 border-l border-white/10">
            <div 
              ref={hourRef}
              className="h-full overflow-y-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="py-2">
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => handleHourClick(hour)}
                    className={cn(
                      "w-full py-2.5 text-center text-sm font-medium transition-all duration-150",
                      hour === selectedHour
                        ? "text-primary bg-primary/20 shadow-[0_0_12px_rgba(255,237,2,0.3)]"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center justify-center w-4 text-white/40 font-bold text-lg">
            :
          </div>

          {/* Minutes Column */}
          <div className="flex-1 border-r border-white/10">
            <div 
              ref={minuteRef}
              className="h-full overflow-y-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="py-2">
                {MINUTES.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => handleMinuteClick(minute)}
                    className={cn(
                      "w-full py-2.5 text-center text-sm font-medium transition-all duration-150",
                      minute === selectedMinute
                        ? "text-primary bg-primary/20 shadow-[0_0_12px_rgba(255,237,2,0.3)]"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Selection Footer */}
        <div className="flex items-center justify-center py-2 border-t border-white/10 bg-white/5">
          <span className="text-lg font-bold text-primary">{displayTime}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
