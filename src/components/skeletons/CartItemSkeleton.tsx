import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CartItemSkeleton() {
  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 shadow-sm">
      <Skeleton className="relative w-full sm:w-24 h-32 sm:h-24 aspect-square rounded-md shrink-0" />
      <div className="flex-grow space-y-2 py-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/4 mt-1" />
      </div>
      <div className="flex items-center space-x-2 sm:ml-auto shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </Card>
  );
}
