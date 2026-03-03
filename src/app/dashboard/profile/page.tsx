"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  Edit,
  User,
  Home,
  MapPin,
  Plus,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Address } from "@/lib/types";
import { Label } from "@/components/ui/label";

// Updated schema for personal information
const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "A valid phone number is required."),
  bio: z.string().min(1, "Bio is required."),
});
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// Schema for address form
const addressFormSchema = z.object({
  street: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip_code: z.string().min(5, "Pincode is required"),
  country: z.string().min(2, "Country is required"),
  type: z.enum(["home", "work", "other"]),
});
type AddressFormValues = z.infer<typeof addressFormSchema>;

// Schema for changing password
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters."),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface UserProfile {
  name: string;
  email: string;
  type: "customer" | "artist";
  phone_number?: string;
  bio?: string;
  profile_picture?: string;
  addresses?: Address[];
}

// Personal Information Form Component
function PersonalInfoForm({
  user,
  onProfileUpdate,
}: {
  user: UserProfile;
  onProfileUpdate: (data: Partial<UserProfile>) => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    user.profile_picture || null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.profile_picture
      ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${user.profile_picture}`
      : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: user.name || "",
      email: user.email || "",
      phoneNumber: user.phone_number || "",
      bio: user.bio || "",
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "profiles");
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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
        );
        toast({
          title: "Upload Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setImagePreview(
        profilePictureUrl
          ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${profilePictureUrl}`
          : null,
      );
      toast({
        title: "Network Error",
        description: "Could not upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit: SubmitHandler<PersonalInfoFormValues> = async (data) => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload: {
        name: string;
        bio: string;
        phone_number: string;
        profile_picture?: string | null;
      } = {
        name: data.fullName,
        bio: data.bio,
        phone_number: data.phoneNumber,
      };

      if (profilePictureUrl) {
        payload.profile_picture = profilePictureUrl;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update-profile`,
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
        toast({
          title: "Profile Updated",
          description:
            result.message || "Your personal information has been saved.",
          variant: "success",
        });
        onProfileUpdate({
          name: data.fullName,
          phone_number: data.phoneNumber,
          bio: data.bio,
          profile_picture: profilePictureUrl ?? undefined,
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Could not update your profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {user.type === "artist" && (
              <FormItem>
                <div className="flex items-center gap-4 mt-2">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={imagePreview || "https://placehold.co/100x100.png"}
                        alt={user.name || ""}
                      />
                      <AvatarFallback className="text-4xl">
                        {user.name ? user.name.charAt(0) : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    disabled={isUploading}
                  />
                </div>
              </FormItem>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
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
                      <Input type="email" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        disabled={isLoading}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {user.type === "artist" && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tell everyone about your art and inspiration..."
                        {...field}
                        disabled={isLoading}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isLoading || isUploading}
              >
                {(isLoading || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <User className="mr-2 h-4 w-4" /> Update Profile
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}

// Address Form Dialog Component
function AddressFormDialog({
  address,
  onSave,
  children,
}: {
  address?: Address | null;
  onSave: () => void;
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isEditing = !!address;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "India",
      type: "home",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && address) {
        form.reset({
          street: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          country: address.country,
          type: address.type,
        });
      } else {
        form.reset({
          street: "",
          city: "",
          state: "",
          zip_code: "",
          country: "India",
          type: "home",
        });
      }
    }
  }, [address, open, form, isEditing]);

  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-address/${address.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-address`;

    const method = isEditing ? "PATCH" : "POST";

    let body;
    if (isEditing) {
      const changedData: Partial<AddressFormValues> = {};
      (Object.keys(data) as Array<keyof AddressFormValues>).forEach((key) => {
        if (data[key] !== address?.[key]) {
          changedData[key] = data[key] as any;
        }
      });
      body = JSON.stringify(changedData);
      if (Object.keys(changedData).length === 0) {
        toast({
          title: "No Changes",
          description: "You haven't made any changes to the address.",
          variant: "default",
        });
        setIsLoading(false);
        setOpen(false);
        return;
      }
    } else {
      body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({
          title: `Address ${isEditing ? "Updated" : "Added"}`,
          description: result.message,
          variant: "success",
        });
        onSave();
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your address below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Pincode" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Address Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="home" />
                        </FormControl>
                        <FormLabel className="font-normal">Home</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="work" />
                        </FormControl>
                        <FormLabel className="font-normal">Work</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Address"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-semibold">
              {address.street}, {address.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.state} - {address.zip_code}
            </p>
            <p className="text-sm text-muted-foreground">{address.country}</p>
            <Badge variant="outline" className="capitalize mt-2">
              {address.type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function AddressManager() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Error",
        description: "You are not authenticated.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-address`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        setAddresses(result.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not fetch addresses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
  };

  useEffect(() => {
    if (editingAddress) {
      const trigger = document.getElementById("edit-address-dialog-trigger");
      if (trigger) {
        trigger.click();
      }
    }
  }, [editingAddress]);

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-address/${deletingAddressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({
          title: "Address Deleted",
          description: "The address has been removed.",
          variant: "success",
        });
        fetchAddresses();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Address Book</CardTitle>
        <CardDescription>Manage your shipping addresses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </>
          ) : (
            addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => handleEdit(addr)}
                onDelete={() => setDeletingAddressId(addr.id)}
              />
            ))
          )}
          <AddressFormDialog onSave={fetchAddresses}>
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center cursor-pointer hover:border-primary hover:text-primary h-full">
              <Plus className="h-6 w-6" />
              <span className="font-semibold text-primary">
                Add New Address
              </span>
            </div>
          </AddressFormDialog>
        </div>
      </CardContent>

      <AddressFormDialog
        address={editingAddress}
        onSave={() => {
          fetchAddresses();
          setEditingAddress(null);
        }}
      >
        <button id="edit-address-dialog-trigger" className="hidden"></button>
      </AddressFormDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAddressId}
        onOpenChange={(open) => !open && setDeletingAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Change Password Form Component
function ChangePasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleShowPassword = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: data.currentPassword,
            password: data.newPassword,
          }),
        },
      );

      const result = await response.json();

      if (response.ok && result.status === 1) {
        toast({
          title: "Password Updated",
          description:
            result.message || "Your password has been changed successfully.",
          variant: "success",
        });
        form.reset();
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Could not update your password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword.current ? "text" : "password"}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword("current")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        disabled={isLoading}
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}{" "}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword.new ? "text" : "password"}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword("new")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        disabled={isLoading}
                      >
                        {showPassword.new ? (
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
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword.confirm ? "text" : "password"}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPassword("confirm")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        disabled={isLoading}
                      >
                        {showPassword.confirm ? (
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
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}

// Main Page Component
export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please log in to view your profile.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.status === 1) {
            const userData = result.data;
            setUser({
              name: userData.name,
              email: userData.email,
              type: userData.type || "customer",
              phone_number: userData.phone_number,
              bio: userData.bio,
              profile_picture: userData.profile_picture,
              addresses: userData.addresses || [],
            });
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch profile data.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Could not fetch user data", e);
        toast({
          title: "Network Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const parsedUser = JSON.parse(userDataString);
      const newUser = { ...parsedUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      // Also update local state to re-render if necessary
      setUser((current) => (current ? { ...current, ...updatedData } : null));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <p>Could not load user profile. Please try logging in again.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
          Profile Settings
        </h1>
      </div>

      <div className="space-y-8">
        <PersonalInfoForm user={user} onProfileUpdate={handleProfileUpdate} />

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AddressManager />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
