import { useMemo, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addRequest } from '@/redux/leaveSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LeaveCalendar } from './LeaveCalendar';
import { LeaveRequestList } from './LeaveRequestList';
import { formatShortDate } from '@/utils/utility';
import { showToast } from '@/utils/toast';

export default function TimeOff() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();
  const requests = useAppSelector((state) => state.leave.requests);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const myRequests = useMemo(
    () => (employee ? requests.filter((r) => r.employeeId === employee.id) : []),
    [requests, employee]
  );

  const alreadyRequestedDates = useMemo(() => {
    const dates = new Set<string>();
    myRequests
      .filter((r) => r.status !== 'rejected')
      .forEach((r) => r.dates.forEach((d) => dates.add(d)));
    return dates;
  }, [myRequests]);

  if (!employee) return null;

  const toggleDate = (dateKey: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey].sort()
    );
    setFormError(null);
  };

  const removeDate = (dateKey: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== dateKey));
  };

  const isReasonEmpty = reason.trim().length === 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      setFormError('Please select one or more dates from the calendar first.');
      return;
    }
    if (isReasonEmpty) {
      setFormError('Please write a reason for your leave.');
      return;
    }
    const duplicateDate = selectedDates.find((d) => alreadyRequestedDates.has(d));
    if (duplicateDate) {
      setFormError(`You've already requested leave for ${formatShortDate(duplicateDate)}.`);
      return;
    }
    dispatch(
      addRequest({
        employeeId: employee.id,
        dates: selectedDates,
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
      })
    );
    showToast.success('Time off request sent!');
    setFormError(null);
    setSelectedDates([]);
    setReason('');
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Time Off</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select dates from the calendar to send a leave request.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Dates</CardTitle>
            <CardDescription>You can choose one or multiple dates.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <LeaveCalendar
              selectedDates={selectedDates}
              onToggleDate={toggleDate}
              disabledDates={Array.from(alreadyRequestedDates)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Confirm your selected dates and reason.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label>Selected Dates</Label>
                {selectedDates.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No dates selected yet.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDates.map((d) => (
                      <span
                        key={d}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                      >
                        {formatShortDate(d)}
                        <button
                          type="button"
                          onClick={() => removeDate(d)}
                          aria-label={`Remove ${d}`}
                          className="rounded-full hover:bg-black/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reason">
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Write your reason for leave"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setFormError(null);
                  }}
                  required
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-1 w-full" disabled={isReasonEmpty}>
                Send Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-foreground">My Requests</h2>
        <LeaveRequestList requests={myRequests} />
      </div>
    </div>
  );
}
