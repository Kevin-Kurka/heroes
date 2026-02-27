export default function MenuLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-8 w-32 rounded-lg shimmer mb-4" />
      <div className="h-10 rounded-full shimmer mb-6" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl shimmer" />
        ))}
      </div>
    </div>
  );
}
