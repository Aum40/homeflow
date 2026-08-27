import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
          >
            <div className="flex flex-1 items-center gap-4">
              <Skeleton className="hidden size-16 shrink-0 rounded-lg sm:block" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-full max-w-xs" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
