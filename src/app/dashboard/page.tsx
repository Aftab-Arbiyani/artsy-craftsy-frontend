
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered, Edit3, UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-semibold">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" className="mt-4 sm:mt-0" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/order-history" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">Order History</CardTitle>
              <ListOrdered className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your past purchases and track current orders.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/my-requests" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">My Custom Art Requests</CardTitle>
              <Edit3 className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track the status of your custom art commissions.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/profile" passHref>
         <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">Profile Settings</CardTitle>
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage your account details and preferences.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Placeholder for recent activity or important notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display. (Placeholder)</p>
        </CardContent>
      </Card>
    </div>
  );
}
