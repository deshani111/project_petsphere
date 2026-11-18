function LoadingBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl border border-[#EEDFE1] bg-white ${className}`} />;
}

export default function OwnerProfileLoading() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-295">
        <div className="mb-4 flex justify-between"><div className="h-7 w-36 animate-pulse rounded bg-rose-100" /><div className="h-8 w-28 animate-pulse rounded bg-rose-100" /></div>
        <LoadingBlock className="mb-4 h-32" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4"><LoadingBlock className="h-64" /><LoadingBlock className="h-36" /></div>
          <div className="grid gap-4"><LoadingBlock className="h-64" /><LoadingBlock className="h-56" /></div>
          </div>
        <LoadingBlock className="mt-4 h-44" />
      </div>
    </main>
  );
}
