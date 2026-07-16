import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toDateKey } from '@/utils/utility';

interface LeaveCalendarProps {
  selectedDates: string[];
  onToggleDate: (dateKey: string) => void;
  disabledDates?: string[];
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function LeaveCalendar({ selectedDates, onToggleDate, disabledDates = [] }: LeaveCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-foreground">{format(visibleMonth, 'MMMM yyyy')}</p>
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={`${label}-${i}`} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const inMonth = isSameMonth(day, visibleMonth);
          const isPast = isBefore(day, today) && !isSameDay(day, today);
          const isRequested = disabledDates.includes(dateKey);
          const isDisabled = isPast || isRequested;
          const isSelected = selectedDates.includes(dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isDisabled}
              title={isRequested ? 'You already have a request for this date' : undefined}
              onClick={() => onToggleDate(dateKey)}
              className={cn(
                'flex h-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                !inMonth && 'text-muted-foreground/40',
                inMonth && !isSelected && !isDisabled && 'text-foreground hover:bg-secondary',
                isPast && 'cursor-not-allowed text-muted-foreground/30',
                isRequested && 'cursor-not-allowed text-muted-foreground/30 line-through',
                isSelected && 'brand-gradient text-white shadow-soft',
                isToday(day) && !isSelected && 'ring-1 ring-inset ring-primary/40'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
