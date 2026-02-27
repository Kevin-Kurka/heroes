export default function LocationLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-8 w-32 rounded-lg shimmer mb-6" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[4/3] rounded-xl shimmer" />
        <div className="flex flex-col gap-4">
          <div className="h-24 rounded-xl shimmer" />
          <div className="h-20 rounded-xl shimmer" />
          <div className="h-48 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}
