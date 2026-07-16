import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NoMatch() {
  return (
    <div className="office-backdrop flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Button asChild>
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
