
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg">
      <CardHeader className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <Skeleton className="h-6 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 flex-1 rounded-md" />
      </CardFooter>
    </Card>
  );
}
