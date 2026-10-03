import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-chocolate-500 animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-chocolate-800 font-medium mb-2">Something went wrong</p>
      <p className="text-sm text-chocolate-500 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-chocolate-800 text-cream text-sm font-medium hover:bg-chocolate-700 transition-all duration-200 hover:-translate-y-0.5"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-in">
      {icon && <div className="mb-4 text-chocolate-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-chocolate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-chocolate-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
