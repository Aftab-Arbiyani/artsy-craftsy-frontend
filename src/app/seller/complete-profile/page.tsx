
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, User, Home, MapPin, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  country: z.string().min(1, "Country is required"),
  phoneCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(5, "Pincode is required"),
  bio: z.string().min(1, "Bio is required."),
  profilePicture: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserData {
    name: string;
    email: string;
}

const steps = [
  { name: 'Artist Profile', status: 'current' },
  { name: 'Publish Your Shot', status: 'upcoming' },
  { name: 'Payment', status: 'upcoming' },
];

const Stepper = () => {
  const getStepClass = (status: string) => {
    if (status === 'current' || status === 'complete') {
      return 'bg-primary text-primary-foreground';
    }
    return 'bg-card border-2 border-border text-muted-foreground';
  };
  
  const getStepTextColor = (status: string) => {
    if (status === 'current' || status === 'complete') {
      return 'text-primary font-semibold';
    }
    return 'text-muted-foreground';
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-8">
        {steps.map((step, index) => (
          <li key={step.name} className="relative flex items-center">
            {/* Connecting line */}
            {index !== steps.length - 1 ? (
              <div
                className="absolute left-5 top-5 -ml-px mt-0.5 h-full w-0.5 bg-border"
                aria-hidden="true"
              />
            ) : null}

            {/* Step icon */}
            <div className="relative flex items-center">
              <div
                className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${getStepClass(step.status)}`}
              >
                <span className="font-bold">{index + 1}</span>
                {step.status === 'complete' && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-primary">
                        <Check className="h-3 w-3 text-primary" />
                    </div>
                )}
              </div>
            </div>

            {/* Step name */}
            <div className="ml-4 min-w-0">
              <span className={`text-sm font-medium ${getStepTextColor(step.status)}`}>
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};


export default function CompleteProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<UserData | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
          name:  '',
          country: 'India',
          phoneCode: '+91',
          phoneNumber: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          bio: '',
        },
    });

    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            const parsedUser = JSON.parse(userDataString);
            setUser(parsedUser);
            // Pre-fill form if user data is available
            form.reset({
                ...form.getValues(),
                name: parsedUser.name || '',
            });
        } else {
            // If no user data, redirect to login
            router.push('/login');
        }
    }, [router, form]);

  const onSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    console.log("Profile data:", data);
    toast({
      title: "Profile Completed (Simulation)",
      description: "Your profile is now complete. Welcome aboard!",
      variant: "success",
    });
    // Mark profile as complete in local storage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
        const parsedUser = JSON.parse(userDataString);
        localStorage.setItem('user', JSON.stringify({...parsedUser, is_profile_complete: true}));
    }
    router.push('/'); // Redirect to homepage or seller dashboard
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
        <Card>
            <CardHeader className="border-b p-6">
                <div className="flex items-center space-x-4">
                     <Avatar className="h-20 w-20">
                        <AvatarImage src="https://placehold.co/100x100.png" alt={user.name} data-ai-hint="profile avatar"/>
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xl font-semibold">{user.email}</p>
                        <p className="text-sm text-muted-foreground">Member since {new Date().getFullYear()}</p>
                        <Button variant="link" className="p-0 h-auto text-red-500 text-sm">Upload new picture</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-12">
                <div className="md:col-span-1 pt-4 hidden md:block">
                  <Stepper />
                </div>
                <div className="md:col-span-3">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                          <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                      <div className="relative">
                                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input placeholder="Enter your full name" {...field} className="pl-10" />
                                      </div>
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <div className="grid md:grid-cols-2 gap-8">
                              <FormField
                                  control={form.control}
                                  name="dob"
                                  render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                      <FormLabel>Date of Birth</FormLabel>
                                      <Popover>
                                          <PopoverTrigger asChild>
                                          <FormControl>
                                              <Button
                                              variant={"outline"}
                                              className={cn(
                                                  "pl-3 text-left font-normal",
                                                  !field.value && "text-muted-foreground"
                                              )}
                                              >
                                              {field.value ? (
                                                  format(field.value, "dd/MM/yyyy")
                                              ) : (
                                                  <span>Pick a date</span>
                                              )}
                                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                              </Button>
                                          </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                              mode="single"
                                              selected={field.value}
                                              onSelect={field.onChange}
                                              disabled={(date) =>
                                              date > new Date() || date < new Date("1900-01-01")
                                              }
                                              initialFocus
                                          />
                                          </PopoverContent>
                                      </Popover>
                                      <FormMessage />
                                      </FormItem>
                                  )}
                                  />
                              <FormField
                                  control={form.control}
                                  name="country"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Country</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                      <FormControl>
                                          <SelectTrigger>
                                          <SelectValue placeholder="Select a country" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          <SelectItem value="India">India</SelectItem>
                                      </SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                              <FormField
                                  control={form.control}
                                  name="phoneNumber"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Phone Number</FormLabel>
                                          <div className="flex gap-2">
                                              <FormField
                                                  control={form.control}
                                                  name="phoneCode"
                                                  render={({ field: codeField }) => (
                                                      <FormItem>
                                                          <Select onValueChange={codeField.onChange} defaultValue={codeField.value}>
                                                              <FormControl>
                                                                  <SelectTrigger className="w-[80px]">
                                                                      <SelectValue placeholder="+91"/>
                                                                  </SelectTrigger>
                                                              </FormControl>
                                                              <SelectContent>
                                                                  <SelectItem value="+91">+91</SelectItem>
                                                              </SelectContent>
                                                          </Select>
                                                      </FormItem>
                                                  )}
                                              />
                                              <FormControl>
                                                  <Input type="tel" placeholder="1234567890" {...field} />
                                              </FormControl>
                                          </div>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="address"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Address</FormLabel>
                                      <FormControl>
                                          <div className="relative">
                                              <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                              <Input placeholder="123 Art Street" {...field} className="pl-10"/>
                                          </div>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                          </div>

                          <div className="grid md:grid-cols-3 gap-8">
                              <FormField
                                  control={form.control}
                                  name="city"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                          <div className="relative">
                                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                              <Input placeholder="Artville" {...field} className="pl-10"/>
                                          </div>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="state"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>State</FormLabel>
                                      <FormControl>
                                          <Input placeholder="State" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="pincode"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Pincode</FormLabel>
                                      <FormControl>
                                          <Input placeholder="12345" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                          </div>

                          <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Add your Bio</FormLabel>
                                  <FormControl>
                                      <Textarea
                                      placeholder="Tell us about yourself, your style, and what inspires you."
                                      rows={4}
                                      {...field}
                                      />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <div className="flex justify-end">
                              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                                  Save & Continue
                              </Button>
                          </div>
                      </form>
                  </Form>
                </div>
              </div>
            </CardContent>
        </Card>
    </div>
  );
}
