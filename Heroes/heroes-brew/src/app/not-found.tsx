import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
      <p className="text-muted mb-8 max-w-md">
        Looks like this play got called back. Head back to the bar and try again.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-accent text-background font-semibold px-6 py-3 rounded-xl hover:bg-accent/90 transition-all"
        >
          Go Home
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center bg-card border border-border text-foreground font-medium px-6 py-3 rounded-xl hover:border-accent/30 transition-all"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}
