import { useState, useRef, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
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

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ITEM_HEIGHT * 2; // 2 items padding top/bottom

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
    
    // Snap to exact position
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

  const getItemOpacity = (index: number, selectedValue: string, items: string[]) => {
    const selectedIndex = items.indexOf(selectedValue);
    const distance = Math.abs(index - selectedIndex);
    
    if (distance === 0) return 'text-white font-semibold text-xl';
    if (distance === 1) return 'text-white/50 text-base';
    return 'text-white/25 text-sm';
  };

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
          "w-[200px] p-0 overflow-hidden",
          "bg-zinc-950 border border-white/10",
          "shadow-2xl rounded-xl"
        )}
        align="start"
        sideOffset={8}
      >
        <div 
          className="relative flex"
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
              <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
              `}} />
              <div style={{ paddingTop: PADDING, paddingBottom: PADDING }}>
                {HOURS.map((hour, index) => (
                  <div
                    key={hour}
                    className={cn(
                      "flex items-center justify-center transition-all duration-150",
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
                    className={cn(
                      "flex items-center justify-center transition-all duration-150",
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
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
