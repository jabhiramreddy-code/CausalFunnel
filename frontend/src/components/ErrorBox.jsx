import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ErrorBox — displays an error message with an optional retry button.
 * Reused on every page that fetches data.
 */
export default function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/30">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Something went wrong</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
