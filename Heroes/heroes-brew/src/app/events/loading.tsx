export default function EventsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-8 w-40 rounded-lg shimmer mb-4" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-16 rounded-full shimmer" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-xl shimmer" />
        ))}
      </div>
    </div>
  );
}
