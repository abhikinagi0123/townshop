import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-24" />
      <CardContent className="p-2">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-2 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  );
}

export function StoreCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductSectionSkeleton() {
  return (
    <section className="py-3">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-28">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
