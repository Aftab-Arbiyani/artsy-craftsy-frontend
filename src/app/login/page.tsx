'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/shared/Icons';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Determine device type using the user agent
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const deviceType = isMobile ? "mobile" : "web";

      // Generate or retrieve a unique device id stored in localStorage
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('device_id', deviceId);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          device_id: deviceId,
          device_type: deviceType,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        localStorage.setItem('authToken', result.data.jwt);
        localStorage.setItem('user', JSON.stringify(result.data));
        toast({
          title: "Login Successful",
          description: result.message || "Welcome back to ArtsyCraftsy!",
          variant: "success",
        });

        const userProductCount = Number(result.data.product_count);
        if (result.data.type === 'artist') {
          if (result.data.is_profile_complete === false) {
            router.push('/seller/complete-profile');
          } else if (result.data.is_profile_complete === true && userProductCount < 3) {
            router.push('/seller/complete-profile?step=publish');
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }

        router.refresh(); // To update header state
      } else {
        toast({
          title: "Login Failed",
          description: result.message || `An error occurred: ${response.statusText}`,
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
    <div className="flex items-center justify-center py-12">
      <div className="w-full lg:grid lg:max-w-4xl lg:grid-cols-2 border rounded-lg overflow-hidden shadow-lg">
        <div className="relative hidden flex-col items-center justify-center bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <Image
            src="https://placehold.co/1080x1920.png"
            alt="Image"
            width={1080}
            height={1920}
            className="w-full object-cover dark:brightness-[0.4]"
            data-ai-hint="indian art"
          />
          <div className="absolute bottom-10 left-10 z-20">
            <h2 className="text-4xl font-bold text-white shadow-2xl">Two Friends</h2>
            <p className="text-lg text-white/90 shadow-lg">By Varsha Kharatmal</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[400px] gap-6 px-4">
            <div className="grid gap-2 text-center">
              <h1 className="text-2xl font-bold">Login With ArtsyCraftsy</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="hover:bg-background hover:text-foreground">
                <Icons.google className="mr-2 h-4 w-4" />
                Login with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or Login Using Email
                </span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} className="pl-10" />
                        </div>
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
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
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
                  Login
                </Button>
              </form>
            </Form>
            <div className="mt-8 space-y-4 text-center text-sm">
              <p className="text-foreground">
                Create your <span className="font-bold">Collector</span> account <Link href="/signup?type=customer" className="underline text-red-500 font-medium">SignUp</Link>
              </p>
              <p className="text-foreground">
                Create your <span className="font-bold">Seller Artist</span> account <Link href="/signup?type=artist" className="underline text-red-500 font-medium">Register Now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
