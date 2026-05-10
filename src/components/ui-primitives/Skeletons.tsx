import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonChunk = () => (
  <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6">
    <Skeleton className="h-5 w-3/5" />
    <div className="mt-4 space-y-2.5">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);

export const SkeletonChunkList = ({
  count = 3,
  className = "",
}: { count?: number; className?: string }) => (
  <div className={`flex flex-col gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonChunk key={i} />
    ))}
  </div>
);

export const SkeletonGuideCard = () => (
  <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 sm:p-6">
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-3 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-4/5" />
      </div>
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
  </div>
);

export const SkeletonStackCard = () => (
  <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5">
    <Skeleton className="h-5 w-3/5" />
    <Skeleton className="mt-2.5 h-3 w-11/12" />
  </div>
);

export const SkeletonHeroCard = () => (
  <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 md:p-8">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-3 h-6 w-3/5" />
    <div className="mt-4 space-y-2.5">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
    </div>
    <Skeleton className="mt-5 h-9 w-40" />
  </div>
);
