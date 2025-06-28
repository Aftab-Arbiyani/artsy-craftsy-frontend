
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MinimalProductCardSkeleton from "./MinimalProductCardSkeleton";

export default function ProductDetailsSkeleton() {
  return (
    <div className="space-y-12">
      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <Skeleton className="relative aspect-[4/3] md:aspect-auto min-h-[300px] md:min-h-[500px]" />
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4">
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <Skeleton className="h-px w-full bg-border my-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="h-px w-full bg-border my-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-12 w-1/3 rounded-md" />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
      
      <div>
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MinimalProductCardSkeleton />
          <MinimalProductCardSkeleton />
          <MinimalProductCardSkeleton />
        </div>
      </div>
    </div>
  );
}
