import { Mail, MessageCircleQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQS = [
  {
    q: 'How do I clock in?',
    a: 'Go to the Dashboard and tap the green "CLOCK IN" button. When your shift ends, tap the blue "CLOCK OUT" button.',
  },
  {
    q: 'Where can I see my past attendance?',
    a: 'In the "My Logs" tab, select a month to view your past attendance — clock in/out time, hours and status.',
  },
  {
    q: 'How do I send a leave/time off request?',
    a: 'In the "Time Off" tab, select one or multiple dates from the calendar, write a reason and tap "Send Request". The approval status will show up in the "Requests" tab.',
  },
  {
    q: 'Can I cancel my request?',
    a: 'Yes, as long as the request is in "Pending" status, you can cancel it from the Requests tab.',
  },
];

export default function Help() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Help & Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">Frequently asked questions and contact details.</p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((item) => (
          <Card key={item.q}>
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <MessageCircleQuestion className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <CardTitle className="text-base">{item.q}</CardTitle>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Need more help?</p>
            <p className="text-sm text-muted-foreground">Email us at hr@kuberya.ai.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
