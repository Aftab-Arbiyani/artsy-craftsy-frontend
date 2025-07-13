
'use client';

import React, { useState, useEffect, useRef, type ChangeEvent, Suspense } from 'react';
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, User, Home, MapPin, Check, Loader2, Upload, Info } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


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

const artworkSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(10, "Description should be at least 10 characters."),
  orientation: z.string({ required_error: "Please select an orientation." }),
  year: z.string().regex(/^\d{4}$/, "Please enter a valid 4-digit year."),
  category: z.string({ required_error: "Please select a category." }),
  medium: z.string().optional(),
  width: z.coerce.number({ invalid_type_error: "Invalid number" }).positive("Width must be a positive number."),
  height: z.coerce.number({ invalid_type_error: "Invalid number" }).positive("Height must be a positive number."),
  depth: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Must be a number" }).positive().optional()
  ),
  weight: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({ invalid_type_error: "Must be a number" }).positive().optional()
  ),
  quantity: z.coerce.number({ invalid_type_error: "Must be a number" }).int().positive().default(1),
  sellOptions: z.string({ required_error: "Please select a sell option." }),
  deliveryAs: z.string({ required_error: "Please select a delivery option." }),
  hsnCode: z.string().optional(),
  tax: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0).optional(),
  listingPrice: z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Price must be a positive number.").optional(),
  hasDiscount: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  discountedPrice: z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Price must be a positive number.").optional(),
  amountReceivable: z.coerce.number().optional(),
  isCopyrightOwner: z.boolean().refine(val => val === true, {
    message: "You must confirm you are the copyright owner.",
  }),
}).refine(data => {
  if (data.hasDiscount) {
    return data.discountPercentage !== undefined && data.discountPercentage >= 5 && data.discountPercentage <= 25;
  }
  return true;
}, {
  message: "Discount must be between 5% and 25%.",
  path: ["discountPercentage"],
}).refine(data => {
  if (data.hasDiscount) {
    return data.discountedPrice !== undefined && data.discountedPrice > 0;
  }
  return true;
}, {
  message: "Discounted price is required when sale is enabled.",
  path: ["discountedPrice"],
}).refine(data => {
  if (data.hasDiscount && data.discountedPrice && data.listingPrice) {
    return data.discountedPrice < data.listingPrice;
  }
  return true;
}, {
  message: "Discounted price must be less than the listing price.",
  path: ["discountedPrice"],
});

type ArtworkFormValues = z.infer<typeof artworkSchema>;


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
    if (status === 'complete') {
      return 'bg-primary text-primary-foreground';
    }
    if (status === 'current') {
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
      <div className="md:hidden">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <React.Fragment key={step.name}>
              <li className="relative flex flex-col items-center justify-center w-1/3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full z-10 ${getStepClass(step.status)}`}>
                  {step.status === 'complete' ? (
                    <Check className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <span className="font-bold">{stepIdx + 1}</span>
                  )}
                </div>
                <p className={`text-sm font-medium mt-2 text-center w-full ${getStepTextColor(step.status)}`}>
                  {step.name}
                </p>
              </li>
              {stepIdx < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-border -mx-4" aria-hidden="true" />
              )}
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
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full z-10 ${getStepClass(step.status)}`}>
                {step.status === 'complete' ? (
                  <Check className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </div>
              <p className={`text-sm text-center font-medium md:text-left md:pt-2 ${getStepTextColor(step.status)}`}>
                {step.name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const ArtworkUploadForm = ({ artworkNumber, categories, onSubmitSuccess }: { artworkNumber: number, categories: Category[], onSubmitSuccess: () => void }) => {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMain, setIsUploadingMain] = useState(false);

  const [multiShotPreviews, setMultiShotPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [multiShotUrls, setMultiShotUrls] = useState<(string | null)[]>([null, null, null, null]);
  const multiShotInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [isUploadingMulti, setIsUploadingMulti] = useState<boolean[]>([false, false, false, false]);

  const [materials, setMaterials] = useState<Category[]>([]);
  const [isFetchingMaterials, setIsFetchingMaterials] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const dynamicArtworkSchema = artworkSchema.refine(data => {
    if (materials.length > 0) {
      return !!data.medium;
    }
    return true;
  }, {
    message: "Please select a medium.",
    path: ["medium"],
  });

  const artworkForm = useForm<ArtworkFormValues>({
    resolver: zodResolver(dynamicArtworkSchema),
    context: { materials },
    defaultValues: {
      title: "",
      description: "",
      year: "",
      width: undefined,
      height: undefined,
      depth: undefined,
      weight: undefined,
      quantity: 1,
      sellOptions: 'original_only',
      deliveryAs: 'rolled',
      hsnCode: '970711090',
      tax: 12,
      listingPrice: undefined,
      hasDiscount: false,
      discountPercentage: 0,
      discountedPrice: undefined,
      amountReceivable: undefined,
      isCopyrightOwner: false,
    },
  });

  const { control, watch, setValue, formState: { errors }, handleSubmit } = artworkForm;
  const watchedHasDiscount = watch('hasDiscount');
  const watchedListingPrice = watch('listingPrice');
  const watchedDiscountPercentage = watch('discountPercentage');
  const watchedCategory = watch('category');

  const COMMISSION_RATE = 0.15;

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({ title: "Success", description: "Image uploaded.", variant: "success" });
        return result.data.image;
      } else {
        toast({ title: "Upload Failed", description: result.message || "Could not upload image.", variant: "destructive" });
        return null;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast({ title: "An Error Occurred", description: "Could not connect to the server.", variant: "destructive" });
      return null;
    }
  };

  const handleMainFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
      setIsUploadingMain(true);
      const uploadedImageUrl = await uploadImage(file);
      if (uploadedImageUrl) {
        setMainImageUrl(uploadedImageUrl);
      } else {
        setMainImagePreview(null);
      }
      setIsUploadingMain(false);
    }
  };

  const handleMultiShotSelect = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newPreviews = [...multiShotPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setMultiShotPreviews(newPreviews);

      const newUploadingStatus = [...isUploadingMulti];
      newUploadingStatus[index] = true;
      setIsUploadingMulti(newUploadingStatus);

      const uploadedImageUrl = await uploadImage(file);

      if (uploadedImageUrl) {
        const newUrls = [...multiShotUrls];
        newUrls[index] = uploadedImageUrl;
        setMultiShotUrls(newUrls);
      } else {
        newPreviews[index] = null;
        setMultiShotPreviews(newPreviews);
      }

      newUploadingStatus[index] = false;
      setIsUploadingMulti(newUploadingStatus);
    }
  };


  useEffect(() => {
    const fetchMaterials = async () => {
      if (!watchedCategory) {
        setMaterials([]);
        return;
      }

      setIsFetchingMaterials(true);
      setValue('medium', '');

      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
        setIsFetchingMaterials(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/material/dropdown/${watchedCategory}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (response.ok && result.status === 1 && Array.isArray(result.data)) {
          setMaterials(result.data);
        } else {
          setMaterials([]);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
        setMaterials([]);
        toast({ title: "Error", description: "Could not connect to the server to fetch materials.", variant: "destructive" });
      } finally {
        setIsFetchingMaterials(false);
      }
    };
    fetchMaterials();
  }, [watchedCategory, setValue, toast]);


  useEffect(() => {
    let finalPrice = watchedListingPrice;

    if (!watchedListingPrice || watchedListingPrice <= 0) {
      setValue('discountedPrice', undefined);
      setValue('amountReceivable', undefined);
      return;
    }

    if (watchedHasDiscount && watchedListingPrice && watchedDiscountPercentage && watchedDiscountPercentage >= 5) {
      const discount = (watchedListingPrice * watchedDiscountPercentage) / 100;
      finalPrice = watchedListingPrice - discount;
      setValue('discountedPrice', parseFloat(finalPrice.toFixed(2)));
    } else {
      setValue('discountedPrice', undefined);
    }

    if (finalPrice && finalPrice > 0) {
      const receivable = finalPrice * (1 - COMMISSION_RATE);
      setValue('amountReceivable', parseFloat(receivable.toFixed(2)));
    } else {
      setValue('amountReceivable', undefined);
    }

  }, [watchedHasDiscount, watchedListingPrice, watchedDiscountPercentage, setValue]);

  useEffect(() => {
    if (watchedHasDiscount) {
      if (!watchedDiscountPercentage || watchedDiscountPercentage < 5) {
        setValue('discountPercentage', 5);
      }
    } else {
      setValue('discountPercentage', 0);
      setValue('discountedPrice', undefined);
    }
  }, [watchedHasDiscount, setValue, watchedDiscountPercentage]);


  const handleDiscountPercentageChange = (newValue: number) => {
    const clampedValue = Math.max(5, Math.min(25, newValue));
    setValue('discountPercentage', clampedValue);
  };

  const onFormSubmit: SubmitHandler<ArtworkFormValues> = async (data) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const allImages = [mainImageUrl, ...multiShotUrls].filter((url): url is string => url !== null);
    if (allImages.length === 0) {
      toast({ title: "Image Required", description: "Please upload at least one image for the artwork.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: data.title,
      description: data.description,
      orientation: data.orientation,
      quantity: data.quantity,
      height: data.height,
      width: data.width,
      depth: data.depth,
      weight: data.weight,
      tax: data.tax,
      listing_price: data.listingPrice,
      discount: data.hasDiscount ? data.discountPercentage : 0,
      amount_receivable: data.amountReceivable,
      is_copyright_owner: data.isCopyrightOwner,
      category: data.category,
      materials: data.medium,
      images: allImages,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        toast({ title: "Artwork Saved!", description: "Your artwork has been successfully submitted.", variant: "success" });
        onSubmitSuccess();
      } else {
        toast({ title: "Submission Failed", description: result.message || "An unexpected error occurred.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Product submission error:", error);
      toast({ title: "An Error Occurred", description: "Could not connect to the server.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...artworkForm}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <input type="file" ref={mainImageInputRef} onChange={handleMainFileSelect} className="hidden" accept="image/*" disabled={isUploadingMain} />
            <div
              className="relative border-2 border-dashed rounded-lg p-6 text-center h-64 flex flex-col justify-center items-center cursor-pointer hover:bg-muted/50"
              onClick={() => mainImageInputRef.current?.click()}
            >
              {mainImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImagePreview} alt="Main artwork preview" className="absolute inset-0 w-full h-full object-contain p-2" />
              ) : (
                <>
                  <h3 className="mt-4 text-lg font-semibold">Browse to choose a file</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    (The image size should be minimum 1024 pixels and maximum 10000 pixels either in width or height)
                    <br />
                    (Size should be minimum 3MB to maximum 5MB)
                  </p>
                  <Button type="button" variant="default" size="sm" className="mt-4 bg-gray-900 hover:bg-gray-800 text-white" disabled={isUploadingMain}>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                  </Button>
                </>
              )}
              {isUploadingMain && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
            </div>

            <div>
              <Label>Multi Shot Angle</Label>
              <div className="grid grid-cols-4 gap-4 mt-2">
                {multiShotPreviews.map((preview, index) => (
                  <div key={index}>
                    <input type="file" ref={multiShotInputRefs[index]} onChange={(e) => handleMultiShotSelect(e, index)} className="hidden" accept="image/*" disabled={isUploadingMulti[index]} />
                    <div
                      className="relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50"
                      onClick={() => multiShotInputRefs[index]?.current?.click()}
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={`Multi-shot preview ${index + 1}`} className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-2xl font-light">+</div>
                      )}
                      {isUploadingMulti[index] && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <FormField
              control={artworkForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add Title *</FormLabel>
                  <FormControl><Input placeholder="Add Title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={artworkForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the work *</FormLabel>
                  <FormControl><Textarea placeholder="Describe the work in a few sentences" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={artworkForm.control}
              name="orientation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orientation *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Orientation" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={artworkForm.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Art Work *</FormLabel>
                    <FormControl><Input placeholder="YYYY" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={artworkForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={artworkForm.control}
              name="medium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medium &amp; Material {materials.length > 0 && '*'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isFetchingMaterials || materials.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isFetchingMaterials ? "Loading materials..." : "Select..."} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materials.map(material => (
                        <SelectItem key={material.id} value={material.id}>{material.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label>Size *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={artworkForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Width (In Inches)" type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={artworkForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Height (In Inches)" type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={artworkForm.control}
                  name="depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Depth (In Inches)" type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={artworkForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="Weight (Gram)" type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={artworkForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={artworkForm.control}
                name="sellOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Options</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="original_only">Original Only</SelectItem>
                        <SelectItem value="original_and_prints">Original and Prints</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={artworkForm.control}
              name="deliveryAs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artwork to be delivered as</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select Category..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="unframed">Unframed</SelectItem>
                      <SelectItem value="framed">Framed</SelectItem>
                      <SelectItem value="stretched">Stretched</SelectItem>
                      <SelectItem value="rolled">Rolled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Works should be shipped unframed and in in roll unless rolling is not possible. Please write to partners@mojarto.com to change delivery condition
            </p>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={artworkForm.control}
                name="hsnCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HSN Code</FormLabel>
                    <FormControl><Input type="text" {...field} value={field.value ?? ''} disabled /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={artworkForm.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 12" {...field} value={field.value ?? ''} disabled /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 items-end">
                <FormField
                  control={artworkForm.control}
                  name="listingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Listing Price * (₹)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="inline h-3 w-3 text-muted-foreground ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This is the base price of your artwork.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <FormControl><Input type="number" placeholder="Enter price" {...field} className="pl-6" onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={artworkForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                        <button type="button" onClick={() => handleDiscountPercentageChange((field.value || 5) - 1)} disabled={!watchedHasDiscount} className="text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center p-0 m-0 leading-none bg-transparent border-none hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">-</button>
                        <span className="text-sm text-center tabular-nums text-foreground">{field.value || 0}%</span>
                        <button type="button" onClick={() => handleDiscountPercentageChange((field.value || 5) + 1)} disabled={!watchedHasDiscount} className="text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center p-0 m-0 leading-none bg-transparent border-none hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">+</button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={artworkForm.control}
                name="hasDiscount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      I want to discount this work and put it on sale
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={artworkForm.control}
                name="discountedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Discounted Price (₹)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="inline h-3 w-3 text-muted-foreground ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The final price after discount. This is calculated automatically.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <FormControl><Input type="number" placeholder="Calculated price" {...field} className="pl-6" value={field.value ?? ''} disabled /></FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 items-center">
                <FormField
                  control={artworkForm.control}
                  name="amountReceivable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Receivable * (₹)</FormLabel>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <FormControl><Input type="number" {...field} className="pl-6" value={field.value ?? ''} disabled /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground self-end pb-2">
                  Please ensure you have accounted for shipping charges in your price quotation. Please revise the same, if you need to, before submitting this artwork.
                </p>
              </div>

              <FormField
                control={artworkForm.control}
                name="isCopyrightOwner"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I am the Artist and I own the copyright of this work.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end mt-8">
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save &amp; Continue
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};


const PublishShotForm = ({ onContinue, categories, activeTab }: { onContinue: () => void, categories: Category[], activeTab: string }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-2">Upload Your 3 Artworks</h3>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-center">
        Showcase your talent by uploading three of your best artworks. This will be the first thing potential buyers see on your profile.
      </p>

      <Tabs defaultValue={activeTab} value={activeTab} className="w-full text-left">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-4">
          <TabsTrigger value="artwork-1">Artwork 1</TabsTrigger>
          <TabsTrigger value="artwork-2">Artwork 2</TabsTrigger>
          <TabsTrigger value="artwork-3">Artwork 3</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="artwork-1" className="mt-0">
            <ArtworkUploadForm artworkNumber={1} categories={categories} onSubmitSuccess={onContinue} />
          </TabsContent>
          <TabsContent value="artwork-2" className="mt-0">
            <ArtworkUploadForm artworkNumber={2} categories={categories} onSubmitSuccess={onContinue} />
          </TabsContent>
          <TabsContent value="artwork-3" className="mt-0">
            <ArtworkUploadForm artworkNumber={3} categories={categories} onSubmitSuccess={onContinue} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

function CompleteProfilePageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [steps, setSteps] = useState([
    { id: 'profile', name: 'Artist Profile', status: 'current' },
    { id: 'publish', name: 'Publish Your Shot', status: 'upcoming' },
    { id: 'payment', name: 'Payment', status: 'upcoming' },
  ]);
  const [currentStepId, setCurrentStepId] = useState('profile');
  const [activeTab, setActiveTab] = useState('artwork-1');


  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      country: 'India',
      phoneCode: '+91',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      bio: '',
      dob: undefined,
    },
  });

  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'publish') {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const storedUser = JSON.parse(userDataString);
        const productCount = storedUser.product_count || 0;

        if (productCount >= 3) {
          goToNextStep('payment');
          return;
        }

        setActiveTab(`artwork-${productCount + 1}`);
      }

      setCurrentStepId('publish');
      setSteps(prev => prev.map(step => {
        if (step.id === 'profile') return { ...step, status: 'complete' };
        if (step.id === 'publish') return { ...step, status: 'current' };
        return step;
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfileAndCategories = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      setIsFetchingProfile(true);
      try {
        // Fetch Profile
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (profileResponse.ok) {
          const result = await profileResponse.json();
          if (result.status === 1 && result.data) {
            const profileData = result.data;
            setUser({ name: profileData.name, email: profileData.email, product_count: profileData.product_count });

            const currentAddress = (profileData.address && typeof profileData.address === 'object') ? profileData.address : {};
            const dob = profileData.date_of_birth
              ? parse(profileData.date_of_birth, 'yyyy-MM-dd', new Date())
              : undefined;

            if (profileData.profile_picture) {
              const imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${profileData.profile_picture}`;
              setImagePreview(imageUrl);
              setProfilePictureUrl(profileData.profile_picture);
            }

            form.reset({
              name: profileData.name || '',
              phoneNumber: profileData.phone_number || '',
              bio: profileData.bio || '',
              address: currentAddress?.street || '',
              city: currentAddress?.city || '',
              state: currentAddress?.state || '',
              pincode: currentAddress?.zip_code || '',
              country: 'India',
              phoneCode: '+91',
              dob: dob && isValid(dob) ? dob : undefined,
            });
          }
        }

        // Fetch Categories
        const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

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
          variant: "destructive"
        });
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfileAndCategories();
  }, [router, form, toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('authToken');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        setProfilePictureUrl(result.data.image);
        toast({
          title: "Success",
          description: "Profile picture uploaded.",
          variant: "success",
        });
      } else {
        setImagePreview(profilePictureUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${profilePictureUrl}` : null); // Revert preview on fail
        toast({
          title: "Upload Failed",
          description: result.message || "Could not upload image.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Image upload error:", error);
      setImagePreview(profilePictureUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${profilePictureUrl}` : null);
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

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in and try again.",
        variant: "destructive",
      });
      router.push('/login');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: data.name,
        phone_number: data.phoneNumber,
        date_of_birth: format(data.dob, 'yyyy-MM-dd'),
        address: data.address,
        zip_code: data.pincode,
        country: data.country,
        state: data.state,
        city: data.city,
        bio: data.bio,
        profile_picture: profilePictureUrl,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/complete-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        setSteps(prev => prev.map(step => {
          if (step.id === 'profile') return { ...step, status: 'complete' };
          if (step.id === 'publish') return { ...step, status: 'current' };
          return step;
        }));
        setCurrentStepId('publish');

        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const parsedUser = JSON.parse(userDataString);
          localStorage.setItem('user', JSON.stringify({ ...parsedUser, is_profile_complete: true }));
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

  const goToNextStep = (nextStep: 'publish' | 'payment') => {
    setSteps(prev => prev.map(step => {
      if (step.id === currentStepId) return { ...step, status: 'complete' };
      if (step.id === nextStep) return { ...step, status: 'current' };
      return step;
    }));
    setCurrentStepId(nextStep);
  }

  const handleProductSubmitted = () => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const storedUser = JSON.parse(userDataString);
      const newProductCount = (storedUser.product_count || 0) + 1;

      localStorage.setItem('user', JSON.stringify({ ...storedUser, product_count: newProductCount }));
      setUser(prev => prev ? { ...prev, product_count: newProductCount } : null);

      if (newProductCount >= 3) {
        goToNextStep('payment');
      } else {
        setActiveTab(`artwork-${newProductCount + 1}`);
      }
    }
  }


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
            {currentStepId === 'profile' && (
              <div className="border-b pb-6 my-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={imagePreview || "https://placehold.co/100x100.png"} alt={user.name} data-ai-hint="profile avatar" />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{user.email}</p>
                    <p className="text-sm text-muted-foreground">Member since {new Date().getFullYear()}</p>
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

          {currentStepId === 'profile' && (
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
                    render={({ field }) => {
                      const [dateString, setDateString] = useState<string>(
                        field.value ? format(field.value, "dd-MM-yyyy") : ""
                      );
                      const [isPopoverOpen, setIsPopoverOpen] = useState(false);

                      useEffect(() => {
                        if (field.value) {
                          const formatted = format(field.value, "dd-MM-yyyy");
                          if (formatted !== dateString) {
                            setDateString(formatted);
                          }
                        } else if (dateString !== '') {
                          setDateString("");
                        }
                      }, [field.value, dateString]);

                      const handleDateSelect = (date: Date | undefined) => {
                        field.onChange(date);
                        setIsPopoverOpen(false);
                        if (date) {
                          setDateString(format(date, "dd-MM-yyyy"));
                        } else {
                          setDateString("");
                        }
                      };

                      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        let value = e.target.value;
                        setDateString(value);

                        let digits = value.replace(/\D/g, '');
                        if (digits.length > 2 && digits.length <= 4) {
                          value = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                        } else if (digits.length > 4) {
                          value = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
                        } else {
                          value = digits;
                        }
                        setDateString(value);
                      };

                      const handleInputBlur = () => {
                        const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
                        if (isValid(parsedDate)) {
                          if (!field.value || field.value.getTime() !== parsedDate.getTime()) {
                            field.onChange(parsedDate);
                          }
                        } else {
                          if (dateString === '') {
                            field.onChange(undefined);
                          }
                        }
                      }

                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={handleDateSelect}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
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
                                  <Input {...codeField} disabled className="w-[80px]" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormControl>
                            <Input type="tel" placeholder="Enter your phone number" {...field} />
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
                            <Input placeholder="Enter your address" {...field} className="pl-10" />
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
                            <Input placeholder="Enter your city" {...field} className="pl-10" />
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
                  <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save &amp; Continue
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {currentStepId === 'publish' && (
            <PublishShotForm
              onContinue={handleProductSubmitted}
              categories={categories}
              activeTab={activeTab}
            />
          )}
          {currentStepId === 'payment' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Payment integration is under construction.
              </p>
              <Button size="lg" disabled>Finish Setup (Coming Soon)</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CompleteProfilePageComponent />
    </Suspense>
  );
}
