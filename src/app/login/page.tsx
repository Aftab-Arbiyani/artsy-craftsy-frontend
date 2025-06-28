
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          device_id: "we2323423", // As per your example
          device_type: "web",
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        localStorage.setItem('authToken', result.data.jwt);
        localStorage.setItem('user', JSON.stringify(result.data));
        toast({
          title: "Login Successful",
          description: result.message || "Welcome back to ArtsyCraftsy!",
        });
        router.push('/');
        router.refresh(); // To update header state
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
          <CardDescription>Log in to your ArtsyCraftsy account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Logging In...' : 'Log In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Link href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
