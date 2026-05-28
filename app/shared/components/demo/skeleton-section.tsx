import { Skeleton } from "~/shared/components/ui/skeleton";

export function SkeletonSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Skeleton</h2>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Basic shapes</p>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">Card skeleton</p>
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-32 w-full max-w-sm rounded-xl" />
      </div>
    </section>
  );
}
