import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import MinimalProductCardSkeleton from "./MinimalProductCardSkeleton";
import { Separator } from "../ui/separator";

export default function ProductDetailsSkeleton() {
  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-4">
          <Skeleton className="relative aspect-[4/3] w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-20 rounded-md" />
            <Skeleton className="w-20 h-20 rounded-md" />
            <Skeleton className="w-20 h-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-4/5 mb-2" />
            <Skeleton className="h-6 w-2/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-3/4" />
            </CardContent>
          </Card>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-12 w-1/3 rounded-md" />
          </div>
        </div>
      </div>

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
