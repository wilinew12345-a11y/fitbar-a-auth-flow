import { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const QUICK_TIMES = ['07:00', '09:00', '12:00', '17:00', '18:30', '20:00'];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * 2;

const TimePicker = ({ value, onChange, disabled = false, className = '' }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedHour, selectedMinute] = value ? value.split(':') : ['09', '00'];
  
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to selected values when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const hourIndex = HOURS.indexOf(selectedHour);
        const minuteIndex = MINUTES.indexOf(selectedMinute);
        
        if (hourScrollRef.current && hourIndex >= 0) {
          hourScrollRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
        }
        if (minuteScrollRef.current && minuteIndex >= 0) {
          minuteScrollRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
        }
      }, 50);
    }
  }, [open, selectedHour, selectedMinute]);

  const handleScrollEnd = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    type: 'hour' | 'minute'
  ) => {
    if (!ref.current) return;
    
    const scrollTop = ref.current.scrollTop;
    const centeredIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, centeredIndex));
    const newValue = items[clampedIndex];
    
    ref.current.scrollTo({
      top: clampedIndex * ITEM_HEIGHT,
      behavior: 'smooth'
    });
    
    if (type === 'hour' && newValue !== selectedHour) {
      onChange(`${newValue}:${selectedMinute}`);
    } else if (type === 'minute' && newValue !== selectedMinute) {
      onChange(`${selectedHour}:${newValue}`);
    }
  }, [selectedHour, selectedMinute, onChange]);

  const handleScroll = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    type: 'hour' | 'minute'
  ) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      handleScrollEnd(ref, items, type);
    }, 100);
  }, [handleScrollEnd]);

  // Scroll to specific hour
  const scrollToHour = useCallback((targetHour: string) => {
    const hourIndex = HOURS.indexOf(targetHour);
    if (hourScrollRef.current && hourIndex >= 0) {
      hourScrollRef.current.scrollTo({
        top: hourIndex * ITEM_HEIGHT,
        behavior: 'smooth'
      });
      onChange(`${targetHour}:${selectedMinute}`);
    }
  }, [selectedMinute, onChange]);

  // Scroll to specific minute
  const scrollToMinute = useCallback((targetMinute: string) => {
    const minuteIndex = MINUTES.indexOf(targetMinute);
    if (minuteScrollRef.current && minuteIndex >= 0) {
      minuteScrollRef.current.scrollTo({
        top: minuteIndex * ITEM_HEIGHT,
        behavior: 'smooth'
      });
      onChange(`${selectedHour}:${targetMinute}`);
    }
  }, [selectedHour, onChange]);

  // Handle quick time selection
  const handleQuickTimeSelect = useCallback((time: string) => {
    onChange(time);
    setOpen(false);
  }, [onChange]);

  const getItemOpacity = (index: number, selectedValue: string, items: string[]) => {
    const selectedIndex = items.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    
    if (distance === 0) return 'text-white font-semibold text-xl';
    if (distance === 1) return 'text-white/50 text-base';
    return 'text-white/25 text-sm';
  };

  // Determine if morning or evening is active
  const hourNum = parseInt(selectedHour, 10);
  const isMorningActive = hourNum >= 5 && hourNum <= 11;
  const isEveningActive = hourNum >= 17 && hourNum <= 23;

  const displayTime = value || '09:00';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-[140px] h-11 justify-start gap-2.5 px-4",
            "bg-zinc-900/80 backdrop-blur-sm",
            "border border-white/10 hover:border-primary/30",
            "text-white font-semibold text-base",
            "focus:ring-2 focus:ring-primary/40 focus:ring-offset-0",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            className
          )}
        >
          <Clock className="w-4 h-4 text-white/50" />
          <span>{displayTime}</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className={cn(
          "w-[240px] p-0 overflow-hidden",
          "bg-zinc-950 border border-white/10",
          "shadow-2xl rounded-xl"
        )}
        align="start"
        sideOffset={8}
      >
        {/* Day-Part Presets */}
        <div className="flex gap-2 p-3 border-b border-white/10">
          <Button
            type="button"
            onClick={() => scrollToHour('07')}
            className={cn(
              "flex-1 h-9 gap-1.5 text-sm font-medium",
              "bg-gradient-to-r from-amber-500/20 to-orange-400/10",
              "border border-amber-400/30 hover:border-amber-400/50",
              "text-amber-200 hover:text-amber-100",
              "transition-all duration-200",
              isMorningActive && "ring-1 ring-amber-400/50 bg-amber-500/30"
            )}
            variant="ghost"
          >
            <Sun className="w-4 h-4" />
            בוקר
          </Button>
          
          <Button
            type="button"
            onClick={() => scrollToHour('18')}
            className={cn(
              "flex-1 h-9 gap-1.5 text-sm font-medium",
              "bg-gradient-to-r from-purple-500/20 to-indigo-400/10",
              "border border-purple-400/30 hover:border-purple-400/50",
              "text-purple-200 hover:text-purple-100",
              "transition-all duration-200",
              isEveningActive && "ring-1 ring-purple-400/50 bg-purple-500/30"
            )}
            variant="ghost"
          >
            <Moon className="w-4 h-4" />
            ערב
          </Button>
        </div>

        {/* Scroll Wheels */}
        <div 
          className="relative flex px-2"
          style={{ height: CONTAINER_HEIGHT }}
        >
          {/* Center selection highlighter */}
          <div 
            className="absolute left-2 right-2 pointer-events-none z-20"
            style={{ 
              top: '50%', 
              height: ITEM_HEIGHT,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
            <div className="absolute inset-0 bg-white/5 rounded-lg" />
          </div>

          {/* Top fade gradient */}
          <div 
            className="absolute top-0 left-0 right-0 pointer-events-none z-10"
            style={{ 
              height: PADDING,
              background: 'linear-gradient(to bottom, rgb(9, 9, 11) 0%, transparent 100%)'
            }}
          />

          {/* Bottom fade gradient */}
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
            style={{ 
              height: PADDING,
              background: 'linear-gradient(to top, rgb(9, 9, 11) 0%, transparent 100%)'
            }}
          />

          {/* Hours Column */}
          <div className="flex-1 relative">
            <div 
              ref={hourScrollRef}
              className="h-full overflow-y-auto scroll-smooth"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'y mandatory'
              }}
              onScroll={() => handleScroll(hourScrollRef, HOURS, 'hour')}
            >
              <div style={{ paddingTop: PADDING, paddingBottom: PADDING }}>
                {HOURS.map((hour, index) => (
                  <div
                    key={hour}
                    onClick={() => scrollToHour(hour)}
                    className={cn(
                      "flex items-center justify-center transition-all duration-150 cursor-pointer",
                      "hover:bg-white/10 rounded mx-1",
                      getItemOpacity(index, selectedHour, HOURS)
                    )}
                    style={{ 
                      height: ITEM_HEIGHT,
                      scrollSnapAlign: 'center'
                    }}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center justify-center w-6 text-white/60 font-bold text-xl z-20">
            :
          </div>

          {/* Minutes Column */}
          <div className="flex-1 relative">
            <div 
              ref={minuteScrollRef}
              className="h-full overflow-y-auto scroll-smooth"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'y mandatory'
              }}
              onScroll={() => handleScroll(minuteScrollRef, MINUTES, 'minute')}
            >
              <div style={{ paddingTop: PADDING, paddingBottom: PADDING }}>
                {MINUTES.map((minute, index) => (
                  <div
                    key={minute}
                    onClick={() => scrollToMinute(minute)}
                    className={cn(
                      "flex items-center justify-center transition-all duration-150 cursor-pointer",
                      "hover:bg-white/10 rounded mx-1",
                      getItemOpacity(index, selectedMinute, MINUTES)
                    )}
                    style={{ 
                      height: ITEM_HEIGHT,
                      scrollSnapAlign: 'center'
                    }}
                  >
                    {minute}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Time Chips */}
        <div className="flex gap-1.5 p-3 border-t border-white/10 justify-center flex-wrap">
          {QUICK_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => handleQuickTimeSelect(time)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                "bg-white/5 border border-white/10",
                "hover:bg-white/10 hover:border-white/20",
                "text-white/70 hover:text-white",
                "transition-all duration-150",
                value === time && "bg-primary/20 border-primary/40 text-primary"
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
