"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserPlus, Loader2, Eye, EyeOff, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const signupSchema = z
  .object({
    accountType: z.enum(["customer", "artist"]),
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.accountType === "artist") {
        return data.phoneNumber && data.phoneNumber.trim().length >= 10;
      }
      return true;
    },
    {
      message: "Phone number must be at least 10 digits for artists.",
      path: ["phoneNumber"],
    },
  );

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupFormComponent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccessful, setSignupSuccessful] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const accountTypeParam =
    searchParams.get("type") === "artist" ? "artist" : "customer";

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: accountTypeParam,
      phoneNumber: "",
    },
  });

  useEffect(() => {
    form.setValue("accountType", accountTypeParam);
  }, [accountTypeParam, form]);

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const payload: any = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        type: data.accountType,
      };

      if (data.accountType === "artist") {
        payload.phone_number = data.phoneNumber;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.status === 201 && result.status === 1) {
        setSignupSuccessful(true);
        setUserEmail(data.email);
      } else {
        toast({
          title: "Signup Failed",
          description:
            result.message || `An error occurred: ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccessful) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8 px-4">
        <Card className="w-full max-w-lg shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
              <MailCheck className="h-12 w-12" />
            </div>
            <CardTitle className="font-headline text-3xl mt-4">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please click the link sent to{" "}
              <span className="font-semibold text-foreground">{userEmail}</span>{" "}
              to activate your account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, please check your spam folder.
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/login" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full lg:grid lg:max-w-4xl lg:grid-cols-2 border rounded-lg overflow-hidden shadow-lg">
        <div
          className="relative hidden flex-col items-center justify-center bg-black p-10 text-white dark:border-r lg:flex"
          style={{ height: "700px" }}
        >
          {" "}
          {/* Adjust this height as needed */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}public/images/login.jpg`}
              alt="Two Friends by Varsha Kharatmal"
              fill
              priority
              className="object-cover"
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="relative z-10 mt-auto w-full">
            <div className="bottom-7 left-7">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                Endless Sea
              </h2>
              <p className="text-lg text-white/90 drop-shadow-md">
                By Dhruv Nayak
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[400px] gap-6 px-4">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">
                Create Your{" "}
                {accountTypeParam === "artist" ? "Artist" : "Customer"} Account
              </h1>
              <p className="text-balance text-muted-foreground">
                Join ArtsyCraftsy and explore a world of art.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Full Name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {accountTypeParam === "artist" && (
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Your Phone Number"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
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
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline text-primary">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupFormComponent />
    </Suspense>
  );
}
