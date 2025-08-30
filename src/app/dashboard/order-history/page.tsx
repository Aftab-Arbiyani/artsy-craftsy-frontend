"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PackageSearch, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import TableRowSkeleton from "@/components/skeletons/TableRowSkeleton";

// Placeholder data
const mockOrdersData = [
  {
    id: "ORD001",
    date: "2023-10-26",
    total: 450,
    status: "Delivered",
    items: 1,
  },
  { id: "ORD002", date: "2023-11-15", total: 780, status: "Shipped", items: 1 },
  {
    id: "ORD003",
    date: "2023-12-01",
    total: 150,
    status: "Processing",
    items: 1,
  },
];

function OrderHistoryComponent() {
  const [orders, setOrders] = useState<typeof mockOrdersData>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(mockOrdersData);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
          Order History
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            Review your past and current orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowSkeleton columns={6} rowCount={3} />
              </TableBody>
            </Table>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>
                      ₹{order.total.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Shipped"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-primary">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                You haven't placed any orders yet.
              </p>
              <Link href="/products" className="mt-4 inline-block">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <OrderHistoryComponent />
    </Suspense>
  );
}
