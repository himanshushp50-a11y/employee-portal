import { useMemo } from 'react';
import { PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FestivalCalendar } from './FestivalCalendar';
import { FESTIVALS_2026 } from '@/data/festivals';
import { toDateKey, formatFullDate } from '@/utils/utility';

export default function AdminTimeOff() {
  const today = toDateKey(new Date());

  const upcoming = useMemo(
    () => FESTIVALS_2026.filter((f) => f.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [today]
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Time Off</h1>
        <p className="mt-1 text-sm text-muted-foreground">Company holiday calendar for upcoming festivals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Holiday Calendar</CardTitle>
            <CardDescription>Highlighted dates are company holidays.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <FestivalCalendar festivals={FESTIVALS_2026} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Festivals</CardTitle>
            <CardDescription>Next holidays on the calendar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No more holidays this year.</p>
            ) : (
              upcoming.map((festival) => (
                <div
                  key={festival.date}
                  className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <PartyPopper className="h-4 w-4 text-primary" />
                    {festival.name}
                  </span>
                  <span className="text-muted-foreground">{formatFullDate(festival.date)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
