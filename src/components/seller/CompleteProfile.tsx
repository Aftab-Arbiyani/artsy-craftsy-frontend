"use client";

import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  User,
  Home,
  MapPin,
  Check,
  Loader2,
} from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtworkUploadForm from "@/components/seller/ArtworkUploadForm";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  dob: z.date().optional(),
  country: z.string().min(1, "Country is required"),
  phoneCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(5, "Pincode is required"),
  bio: z.string().min(1, "Bio is required."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserData {
  name: string;
  email: string;
  product_count: number;
}

interface Category {
  id: string;
  name: string;
}

const Stepper = ({ steps }: { steps: { name: string; status: string }[] }) => {
  const getStepClass = (status: string) => {
    if (status === "complete") {
      return "bg-primary text-primary-foreground";
    }
    if (status === "current") {
      return "bg-primary text-primary-foreground";
    }
    return "bg-card border-2 border-border text-muted-foreground";
  };

  const getStepTextColor = (status: string) => {
    if (status === "current" || status === "complete") {
      return "text-primary font-semibold";
    }
    return "text-muted-foreground";
  };

  return (
    <nav aria-label="Progress">
      <div className="md:hidden">
        <ol role="list" className="flex items-start justify-between">
          {steps.map((step, stepIdx) => (
            <React.Fragment key={step.name}>
              <li className="relative flex flex-col items-center justify-start w-1/3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full z-10 ${getStepClass(step.status)}`}
                >
                  {step.status === "complete" ? (
                    <Check className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <span className="font-bold">{stepIdx + 1}</span>
                  )}
                </div>
                <p
                  className={`text-sm font-medium mt-2 text-center w-full ${getStepTextColor(step.status)}`}
                >
                  {step.name}
                </p>
              </li>
            </React.Fragment>
          ))}
        </ol>
      </div>
      <ol role="list" className="hidden md:flex md:flex-col md:space-y-4">
        {steps.map((step, index) => (
          <li key={step.name} className="relative md:flex-initial">
            {index !== steps.length - 1 ? (
              <div
                className="absolute left-5 top-5 -mt-px h-full w-0.5 bg-border"
                aria-hidden="true"
              />
            ) : null}
            <div className="relative flex flex-col items-center gap-2 md:flex-row md:items-start md:gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full z-10 ${getStepClass(step.status)}`}
              >
                {step.status === "complete" ? (
                  <Check className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </div>
              <p
                className={`text-sm text-center font-medium md:text-left md:pt-2 ${getStepTextColor(step.status)}`}
              >
                {step.name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const PublishShotForm = ({
  onContinue,
  categories,
  activeTab,
}: {
  onContinue: () => void;
  categories: Category[];
  activeTab: string;
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-2">
        Upload Your 3 Artworks
      </h3>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-center">
        Showcase your talent by uploading three of your best artworks. This will
        be the first thing potential buyers see on your profile.
      </p>

      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        className="w-full text-left"
      >
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-4">
          <TabsTrigger value="artwork-1">Artwork 1</TabsTrigger>
          <TabsTrigger value="artwork-2">Artwork 2</TabsTrigger>
          <TabsTrigger value="artwork-3">Artwork 3</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="artwork-1" className="mt-0">
            <ArtworkUploadForm
              artworkNumber={1}
              categories={categories}
              onSubmitSuccess={onContinue}
            />
          </TabsContent>
          <TabsContent value="artwork-2" className="mt-0">
            <ArtworkUploadForm
              artworkNumber={2}
              categories={categories}
              onSubmitSuccess={onContinue}
            />
          </TabsContent>
          <TabsContent value="artwork-3" className="mt-0">
            <ArtworkUploadForm
              artworkNumber={3}
              categories={categories}
              onSubmitSuccess={onContinue}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default function CompleteProfile({
  step,
  email,
}: {
  step: string;
  email: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [steps, setSteps] = useState([
    { id: "profile", name: "Artist Profile", status: "current" },
    { id: "publish", name: "Publish Your Shot", status: "upcoming" },
    { id: "payment", name: "Payment", status: "upcoming" },
  ]);
  const [currentStepId, setCurrentStepId] = useState("profile");
  const [activeTab, setActiveTab] = useState("artwork-1");

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      country: "India",
      phoneCode: "+91",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      bio: "",
      dob: undefined,
    },
  });

  useEffect(() => {
    if (step === "publish") {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const storedUser = JSON.parse(userDataString);
        const productCount = storedUser.product_count || 0;

        if (productCount >= 3) {
          goToNextStep("payment");
          return;
        }

        setActiveTab(`artwork-${productCount + 1}`);
      }

      setCurrentStepId("publish");
      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === "profile") return { ...step, status: "complete" };
          if (step.id === "publish") return { ...step, status: "current" };
          return step;
        }),
      );
    }
  }, [step]);

  useEffect(() => {
    const fetchProfileAndCategories = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      setIsFetchingProfile(true);
      try {
        // Fetch Profile
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (profileResponse.ok) {
          const result = await profileResponse.json();
          if (result.status === 1 && result.data) {
            const profileData = result.data;
            setUser({
              name: profileData.name,
              email: profileData.email,
              product_count: profileData.product_count,
            });

            const currentAddress =
              profileData.address && typeof profileData.address === "object"
                ? profileData.address
                : {};
            const dob = profileData.date_of_birth
              ? parse(profileData.date_of_birth, "yyyy-MM-dd", new Date())
              : undefined;

            if (profileData.profile_picture) {
              const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${profileData.profile_picture}`;
              setImagePreview(imageUrl);
              setProfilePictureUrl(profileData.profile_picture);
            }

            form.reset({
              name: profileData.name || "",
              phoneNumber: profileData.phone_number || "",
              bio: profileData.bio || "",
              address: currentAddress?.street || "",
              city: currentAddress?.city || "",
              state: currentAddress?.state || "",
              pincode: currentAddress?.zip_code || "",
              country: "India",
              phoneCode: "+91",
              dob: dob && isValid(dob) ? dob : undefined,
            });
          }
        }

        // Fetch Categories
        const categoryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (categoryResponse.ok) {
          const result = await categoryResponse.json();
          if (result.status === 1 && Array.isArray(result.data)) {
            setCategories(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({
          title: "Error",
          description: "Could not load profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfileAndCategories();
  }, [router, form, toast]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (response.ok && result.status === 1) {
        setProfilePictureUrl(result.data.image);
        toast({
          title: "Success",
          description: "Profile picture uploaded.",
          variant: "success",
        });
      } else {
        setImagePreview(
          profilePictureUrl
            ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${profilePictureUrl}`
            : null,
        ); // Revert preview on fail
        toast({
          title: "Upload Failed",
          description: result.message || "Could not upload image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setImagePreview(
        profilePictureUrl
          ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${profilePictureUrl}`
          : null,
      );
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsLoading(true);

    if (!data.dob) {
      toast({
        title: "Incomplete Profile",
        description: "Please provide your date of birth to continue.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in and try again.",
        variant: "destructive",
      });
      router.push("/login");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: data.name,
        phone_number: data.phoneNumber,
        date_of_birth: format(data.dob, "yyyy-MM-dd"),
        address: data.address,
        zip_code: data.pincode,
        country: data.country,
        state: data.state,
        city: data.city,
        bio: data.bio,
        profile_picture: profilePictureUrl,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/complete-profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.ok && result.status === 1) {
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === "profile") return { ...step, status: "complete" };
            if (step.id === "publish") return { ...step, status: "current" };
            return step;
          }),
        );
        setCurrentStepId("publish");

        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          const parsedUser = JSON.parse(userDataString);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...parsedUser, is_profile_complete: true }),
          );
        }
      } else {
        toast({
          title: "Profile Update Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = (nextStep: "publish" | "payment") => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id === currentStepId) return { ...step, status: "complete" };
        if (step.id === nextStep) return { ...step, status: "current" };
        return step;
      }),
    );
    setCurrentStepId(nextStep);
  };

  const handleProductSubmitted = () => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const storedUser = JSON.parse(userDataString);
      const newProductCount = (storedUser.product_count || 0) + 1;

      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, product_count: newProductCount }),
      );
      setUser((prev) =>
        prev ? { ...prev, product_count: newProductCount } : null,
      );

      if (newProductCount >= 3) {
        goToNextStep("payment");
      } else {
        setActiveTab(`artwork-${newProductCount + 1}`);
      }
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentStepInfo = steps.find((step) => step.id === currentStepId);

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="grid md:grid-cols-4 gap-x-12">
        <div className="md:col-span-1 mb-12 md:mb-0 md:pt-4">
          <div className="md:sticky md:top-24">
            <h2 className="font-headline text-3xl font-semibold mb-6 text-center md:text-left">
              {currentStepInfo?.name}
            </h2>
            <Stepper steps={steps} />
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="mb-8">
            {currentStepId === "profile" && (
              <div className="border-b pb-6 my-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={imagePreview || "https://placehold.co/100x100.png"}
                        alt={user.name}
                        data-ai-hint="profile avatar"
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date().getFullYear()}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif"
                      disabled={isUploading}
                    />
                    <Button
                      variant="link"
                      className="p-0 h-auto text-red-500 text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Upload new picture
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentStepId === "profile" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            className="pl-10"
                          />
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
                    render={({ field }) => {
                      const [dateString, setDateString] = useState<string>("");
                      const [isPopoverOpen, setIsPopoverOpen] = useState(false);

                      useEffect(() => {
                        if (field.value) {
                          setDateString(format(field.value, "dd-MM-yyyy"));
                        } else {
                          setDateString("");
                        }
                      }, [field.value]);

                      const handleDateSelect = (date: Date | undefined) => {
                        field.onChange(date);
                        setIsPopoverOpen(false);
                      };

                      const handleInputChange = (
                        e: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        setDateString(e.target.value);
                      };

                      const handleInputBlur = () => {
                        const parsedDate = parse(
                          dateString,
                          "dd-MM-yyyy",
                          new Date(),
                        );
                        if (isValid(parsedDate)) {
                          field.onChange(parsedDate);
                        } else {
                          field.onChange(undefined);
                        }
                      };

                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover
                            open={isPopoverOpen}
                            onOpenChange={setIsPopoverOpen}
                          >
                            <div className="relative">
                              <FormControl>
                                <Input
                                  placeholder="dd-MM-yyyy"
                                  value={dateString}
                                  onChange={handleInputChange}
                                  onBlur={handleInputBlur}
                                  className="pr-10"
                                />
                              </FormControl>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"ghost"}
                                  className="absolute right-0 top-0 h-full rounded-l-none px-3 hover:bg-transparent"
                                >
                                  <span className="sr-only">Open calendar</span>
                                  <CalendarIcon className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                            </div>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={handleDateSelect}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
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
                                <FormControl>
                                  <Input
                                    {...codeField}
                                    disabled
                                    className="w-[80px]"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              {...field}
                            />
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
                            <Input
                              placeholder="Enter your address"
                              {...field}
                              className="pl-10"
                            />
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
                            <Input
                              placeholder="Enter your city"
                              {...field}
                              className="pl-10"
                            />
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
                          <Input placeholder="Enter your state" {...field} />
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
                          <Input placeholder="Enter your pincode" {...field} />
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
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save &amp; Continue
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {currentStepId === "publish" && (
            <PublishShotForm
              onContinue={handleProductSubmitted}
              categories={categories}
              activeTab={activeTab}
            />
          )}
          {currentStepId === "payment" && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Payment integration is under construction.
              </p>
              <Button size="lg" disabled>
                Finish Setup (Coming Soon)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
