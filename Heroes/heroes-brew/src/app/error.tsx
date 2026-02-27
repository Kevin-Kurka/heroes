'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-2">Something went wrong</h1>
      <p className="text-muted mb-8 max-w-md">
        We hit a snag loading this page. Give it another shot.
      </p>
      <button
        onClick={reset}
        className="bg-accent text-background font-semibold px-6 py-3 rounded-sm hover:bg-accent/90 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
