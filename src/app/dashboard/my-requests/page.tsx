
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit3, PlusCircle, ArrowLeft } from "lucide-react";
import type { CustomArtRequest } from "@/lib/types";
import { useState, useEffect } from 'react';
import TableRowSkeleton from "@/components/skeletons/TableRowSkeleton";

// Placeholder data
const mockRequestsData: CustomArtRequest[] = [
  { id: "REQ001", description: "Surreal landscape with floating islands...", status: "In Progress", createdAt: new Date("2023-11-05") },
  { id: "REQ002", description: "Portrait of my pet dog in renaissance style.", status: "Pending", createdAt: new Date("2023-12-10") },
  { id: "REQ003", description: "Abstract sculpture representing family.", status: "Completed", createdAt: new Date("2023-09-20") },
];

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<CustomArtRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests(mockRequestsData);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4"/>
                </Button>
            </Link>
            <h1 className="font-headline text-2xl sm:text-3xl font-semibold">My Custom Art Requests</h1>
        </div>
        <Link href="/custom-art" passHref>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> New Request
          </Button>
        </Link>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Track your custom art commissions here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Description (Excerpt)</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowSkeleton columns={5} rowCount={3} />
              </TableBody>
            </Table>
          ) : requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Description (Excerpt)</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.description.substring(0, 50)}...</TableCell>
                    <TableCell>{request.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'Completed' ? 'default' : request.status === 'In Progress' ? 'secondary' : 'outline'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" className="text-primary">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Edit3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">You haven't made any custom art requests yet.</p>
              <Link href="/custom-art" className="mt-4 inline-block">
                <Button>Create a Request</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
