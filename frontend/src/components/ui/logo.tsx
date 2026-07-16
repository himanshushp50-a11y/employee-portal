import { cn } from '@/utils/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl shadow-soft',
        className
      )}
    >
      <span className="relative flex items-center">
        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 1v20M2 11l11-10M2 11l11 10" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white/80" />
      </span>
    </div>
  );
}
