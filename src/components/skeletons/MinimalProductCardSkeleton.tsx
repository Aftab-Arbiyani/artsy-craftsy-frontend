import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function MinimalProductCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="relative aspect-video w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/4 mt-1" />
      </CardContent>
    </Card>
  );
}
