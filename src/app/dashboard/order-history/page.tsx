
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PackageSearch, ArrowLeft, Loader2, AlertTriangle, Eye } from "lucide-react";
import { useState, useEffect, Suspense, useCallback } from 'react';
import TableRowSkeleton from "@/components/skeletons/TableRowSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import OrderDetailsDrawer from "@/components/orders/OrderDetailsDrawer";

const STATUS_MAP: Record<string, { text: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  confirmed: { text: 'Confirmed', variant: 'secondary' },
  processing: { text: 'Processing', variant: 'outline' },
  shipped: { text: 'Shipped', variant: 'outline' },
  delivered: { text: 'Delivered', variant: 'default' },
  cancelled: { text: 'Cancelled', variant: 'destructive' },
  returned: { text: 'Returned', variant: 'destructive' },
  failed: { text: 'Failed', variant: 'destructive' },
};

function OrderHistoryComponent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('user');
    
    if (!token || !userDataString) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userDataString);
      setUserType(user.type || null);
      
      let url = "";
      if (user.type === 'artist') {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/assigned-orders?take=10&offset=0`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/my-orders?limit=10&offset=0`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        setOrders(result.data);
      } else {
        setError(result.message || "Failed to fetch orders.");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = (id: string) => {
    setSelectedOrderId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" passHref>
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4"/>
            </Button>
        </Link>
        <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
          {userType === 'artist' ? "Assigned Orders" : "Order History"}
        </h1>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{userType === 'artist' ? "Manage Your Orders" : "Your Orders"}</CardTitle>
          <CardDescription>
            {userType === 'artist' ? "Review and update orders assigned to you." : "Review your past and current orders."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowSkeleton columns={6} rowCount={3} />
              </TableBody>
            </Table>
          ) : error ? (
            <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-medium">{error}</p>
                <Button variant="outline" onClick={fetchOrders} className="mt-4">Try Again</Button>
            </div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                        {order.custom_request ? (
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Custom</Badge>
                        ) : (
                            <span className="text-muted-foreground">Standard</span>
                        )}
                    </TableCell>
                    <TableCell>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[order.status]?.variant || 'outline'}>
                        {STATUS_MAP[order.status]?.text || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary flex items-center gap-1 ml-auto"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
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
                {userType === 'artist' ? "No orders found." : "You haven't placed any orders yet."}
              </p>
              {userType !== 'artist' && (
                <Link href="/products" className="mt-4 inline-block">
                  <Button>Start Shopping</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsDrawer 
        orderId={selectedOrderId} 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onOrderCancelled={fetchOrders}
      />
    </div>
  );
}

export default function OrderHistoryPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <OrderHistoryComponent />
        </Suspense>
    );
}
