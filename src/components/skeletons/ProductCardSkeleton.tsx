import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg">
      <CardHeader className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="w-1/3">
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-10 rounded-md" />
          <Skeleton className="h-9 w-10 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
