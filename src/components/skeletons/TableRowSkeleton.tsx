import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableRowSkeletonProps {
  columns: number;
  rowCount?: number;
}

export default function TableRowSkeleton({
  columns,
  rowCount = 1,
}: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, cellIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
