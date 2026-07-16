import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toDateKey } from '@/utils/utility';
import type { Festival } from '@/types';

interface FestivalCalendarProps {
  festivals: Festival[];
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function FestivalCalendar({ festivals }: FestivalCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

  const festivalsByDate = useMemo(() => {
    const map = new Map<string, Festival>();
    festivals.forEach((f) => map.set(f.date, f));
    return map;
  }, [festivals]);

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
          const festival = festivalsByDate.get(dateKey);

          return (
            <div
              key={dateKey}
              title={festival?.name}
              className={cn(
                'flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-medium',
                !inMonth && 'text-muted-foreground/40',
                inMonth && !festival && 'text-foreground',
                festival && 'bg-accent font-bold text-accent-foreground',
                isToday(day) && !festival && 'ring-1 ring-inset ring-primary/40'
              )}
            >
              {format(day, 'd')}
              {festival && <span className="h-1 w-1 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
