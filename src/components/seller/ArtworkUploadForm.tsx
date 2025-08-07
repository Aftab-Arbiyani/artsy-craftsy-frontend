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
import { Loader2, Upload, Info, RotateCcw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const artworkSchema = z
  .object({
    title: z.string().min(1, "Title is required."),
    description: z
      .string()
      .min(10, "Description should be at least 10 characters."),
    orientation: z.string({ required_error: "Please select an orientation." }),
    year: z.string().regex(/^\d{4}$/, "Please enter a valid 4-digit year."),
    category: z.string({ required_error: "Please select a category." }),
    medium: z.string().optional(),
    width: z.coerce
      .number({ invalid_type_error: "Invalid number" })
      .positive("Width must be a positive number."),
    height: z.coerce
      .number({ invalid_type_error: "Invalid number" })
      .positive("Height must be a positive number."),
    depth: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.coerce
        .number({ invalid_type_error: "Must be a number" })
        .positive()
        .optional(),
    ),
    weight: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.coerce
        .number({ invalid_type_error: "Must be a number" })
        .positive()
        .optional(),
    ),
    quantity: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .int()
      .positive()
      .default(1),
    sellOptions: z.string({ required_error: "Please select a sell option." }),
    deliveryAs: z.string({
      required_error: "Please select a delivery option.",
    }),
    hsnCode: z.string().optional(),
    tax: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .min(0)
      .optional(),
    listingPrice: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .positive("Price must be a positive number.")
      .optional(),
    hasDiscount: z.boolean().default(false),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    discountedPrice: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .positive("Price must be a positive number.")
      .optional(),
    status: z.enum(["active", "in_active", "archived"]),
    amountReceivable: z.coerce.number().optional(),
    isCopyrightOwner: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.hasDiscount) {
        return (
          data.discountPercentage !== undefined &&
          data.discountPercentage >= 5 &&
          data.discountPercentage <= 25
        );
      }
      return true;
    },
    {
      message: "Discount must be between 5% and 25%.",
      path: ["discountPercentage"],
    },
  )
  .refine(
    (data) => {
      if (data.hasDiscount) {
        return data.discountedPrice !== undefined && data.discountedPrice > 0;
      }
      return true;
    },
    {
      message: "Discounted price is required when sale is enabled.",
      path: ["discountedPrice"],
    },
  )
  .refine(
    (data) => {
      if (data.hasDiscount && data.discountedPrice && data.listingPrice) {
        return data.discountedPrice < data.listingPrice;
      }
      return true;
    },
    {
      message: "Discounted price must be less than the listing price.",
      path: ["discountedPrice"],
    },
  );

type ArtworkFormValues = z.infer<typeof artworkSchema>;

interface Category {
  id: string;
  name: string;
}

interface ArtworkUploadFormProps {
  artworkNumber: number;
  categories: Category[];
  onSubmitSuccess: () => void;
  isStandalone?: boolean;
  artwork?: any;
  isViewMode?: boolean;
}

export default function ArtworkUploadForm({
  artworkNumber,
  categories,
  onSubmitSuccess,
  isStandalone = false,
  artwork = null,
  isViewMode = false,
}: ArtworkUploadFormProps) {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMain, setIsUploadingMain] = useState(false);

  const [multiShotPreviews, setMultiShotPreviews] = useState<(string | null)[]>(
    [null, null, null, null],
  );
  const [multiShotUrls, setMultiShotUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const multiShotInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [isUploadingMulti, setIsUploadingMulti] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  const [materials, setMaterials] = useState<Category[]>([]);
  const [isFetchingMaterials, setIsFetchingMaterials] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [initialArtworkData, setInitialArtworkData] = useState<any>(null);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const isInitialRender = useRef(true);
  const [isArtworkDataLoaded, setIsArtworkDataLoaded] = useState(false);

  const dynamicArtworkSchema = artworkSchema.refine(
    (data) => {
      if (materials.length > 0) {
        return !!data.medium;
      }
      return true;
    },
    {
      message: "Please select a medium.",
      path: ["medium"],
    },
  );

  const getDefaultValues = (): ArtworkFormValues => {
    if (artwork) {
      const listingPrice = parseFloat(artwork.listing_price);
      const discountPercentage = parseFloat(artwork.discount);
      const hasDiscount = discountPercentage > 0;

      return {
        title: artwork.title || "",
        description: artwork.description || "",
        year: artwork.year_of_artwork?.toString() || "",
        width: artwork.width || 0,
        height: artwork.height || 0,
        depth: artwork.depth || 0,
        weight: artwork.weight || 0,
        quantity: artwork.quantity || 1,
        sellOptions: artwork.sell_options || "original_only",
        deliveryAs: artwork.delivery_as || "rolled",
        hsnCode: "970711090",
        tax: 12,
        listingPrice: isNaN(listingPrice) ? undefined : listingPrice,
        hasDiscount: hasDiscount,
        discountPercentage: discountPercentage || 0,
        discountedPrice: undefined,
        amountReceivable: undefined,
        isCopyrightOwner: artwork.is_copyright_owner || false,
        status: artwork.status || "active",
        orientation: artwork.orientation || "",
        category: artwork.category?.id || "",
        medium: artwork.materials?.id || undefined,
      };
    }

    // Default values for new artwork
    return {
      title: "",
      description: "",
      year: "",
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      quantity: 1,
      sellOptions: "original_only",
      deliveryAs: "rolled",
      hsnCode: "970711090",
      tax: 12,
      listingPrice: undefined,
      hasDiscount: false,
      discountPercentage: 0,
      discountedPrice: undefined,
      amountReceivable: undefined,
      isCopyrightOwner: false,
      status: "active",
      orientation: "",
      category: "",
      medium: undefined,
    };
  };

  const artworkForm = useForm<ArtworkFormValues>({
    resolver: zodResolver(dynamicArtworkSchema),
    context: { materials },
    defaultValues: getDefaultValues(),
  });

  const {
    control,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
  } = artworkForm;
  const watchedHasDiscount = watch("hasDiscount");
  const watchedListingPrice = watch("listingPrice");
  const watchedDiscountPercentage = watch("discountPercentage");
  const watchedCategory = watch("category");

  const COMMISSION_RATE = 0.15;

  const calculateAmounts = (
    listingPrice?: number,
    hasDiscount?: boolean,
    discountPercentage?: number,
  ) => {
    let finalPrice = listingPrice;

    if (!listingPrice || listingPrice <= 0) {
      setValue("discountedPrice", undefined);
      setValue("amountReceivable", undefined);
      return;
    }

    if (
      hasDiscount &&
      listingPrice &&
      discountPercentage &&
      discountPercentage >= 5
    ) {
      const discount = (listingPrice * discountPercentage) / 100;
      finalPrice = listingPrice - discount;
      setValue("discountedPrice", parseFloat(finalPrice.toFixed(2)));
    } else {
      setValue("discountedPrice", undefined);
    }

    if (finalPrice && finalPrice > 0) {
      const receivable = finalPrice * (1 - COMMISSION_RATE);
      setValue("amountReceivable", parseFloat(receivable.toFixed(2)));
    } else {
      setValue("amountReceivable", undefined);
    }
  };

  useEffect(() => {
    if (artwork) {
      setInitialArtworkData(artwork);
      setIsArtworkDataLoaded(true);

      // Handle image previews
      if (artwork.media && artwork.media.length > 0) {
        const mainImage = artwork.media.find(
          (m: any, index: number) => index === 0,
        );
        if (mainImage) {
          const fullMainUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${mainImage.file_path}`;
          setMainImagePreview(fullMainUrl);
          setMainImageUrl(mainImage.file_path);
        }

        const additionalMedia = artwork.media.slice(1);
        const newPreviews = [...multiShotPreviews];
        const newUrls = [...multiShotUrls];

        for (let i = 0; i < 4; i++) {
          newPreviews[i] = additionalMedia[i]
            ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${additionalMedia[i].file_path}`
            : null;
          newUrls[i] = additionalMedia[i] ? additionalMedia[i].file_path : null;
        }

        setMultiShotPreviews(newPreviews);
        setMultiShotUrls(newUrls);
      }
    } else {
      setIsArtworkDataLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork]);

  useEffect(() => {
    if (artwork) {
      const listingPrice = parseFloat(artwork.listing_price);
      const discountPercentage = parseFloat(artwork.discount);
      const hasDiscount = discountPercentage > 0;
      calculateAmounts(listingPrice, hasDiscount, discountPercentage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork]);

  const handleResetForm = () => {
    const defaultValues: ArtworkFormValues = {
      title: "",
      description: "",
      year: "",
      width: 0,
      height: 0,
      depth: 0,
      weight: 0,
      quantity: 1,
      sellOptions: "original_only",
      deliveryAs: "rolled",
      hsnCode: "970711090",
      tax: 12,
      listingPrice: undefined,
      hasDiscount: false,
      discountPercentage: 0,
      discountedPrice: undefined,
      amountReceivable: undefined,
      isCopyrightOwner: false,
      status: "active",
      orientation: "",
      category: "",
      medium: undefined,
    };

    reset(defaultValues);
    setMainImagePreview(null);
    setMainImageUrl(null);
    setMultiShotPreviews([null, null, null, null]);
    setMultiShotUrls([null, null, null, null]);
    setDeletedImages([]);
    setIsArtworkDataLoaded(false);
    if (mainImageInputRef.current) mainImageInputRef.current.value = "";
    multiShotInputRefs.forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in.",
        variant: "destructive",
      });
      return null;
    }

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
        toast({
          title: "Success",
          description: "Image uploaded.",
          variant: "success",
        });
        return result.data.image;
      } else {
        toast({
          title: "Upload Failed",
          description: result.message || "Could not upload image.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
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

  const handleMultiShotSelect = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
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

  const handleRemoveMainImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mainImageUrl) {
      // Only track for deletion if it's an existing image (has initialArtworkData)
      if (
        initialArtworkData?.media?.some(
          (m: any) => m.file_path === mainImageUrl,
        )
      ) {
        setDeletedImages((prev) => [...prev, mainImageUrl]);
      }
    }
    setMainImagePreview(null);
    setMainImageUrl(null);
    if (mainImageInputRef.current) mainImageInputRef.current.value = "";
  };

  const handleRemoveMultiShot = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const urlToRemove = multiShotUrls[index];
    if (urlToRemove) {
      // Only track for deletion if it's an existing image (has initialArtworkData)
      if (
        initialArtworkData?.media?.some((m: any) => m.file_path === urlToRemove)
      ) {
        setDeletedImages((prev) => [...prev, urlToRemove]);
      }
    }

    const newPreviews = [...multiShotPreviews];
    newPreviews[index] = null;
    setMultiShotPreviews(newPreviews);

    const newUrls = [...multiShotUrls];
    newUrls[index] = null;
    setMultiShotUrls(newUrls);

    if (multiShotInputRefs[index].current)
      multiShotInputRefs[index].current.value = "";
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!watchedCategory) {
        setMaterials([]);
        return;
      }

      setIsFetchingMaterials(true);

      // Only clear medium if it's a new artwork and user is changing category
      if (!artwork && isInitialRender.current === false) {
        setValue("medium", undefined);
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You are not logged in.",
          variant: "destructive",
        });
        setIsFetchingMaterials(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/material/dropdown/${watchedCategory}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const result = await response.json();
        if (response.ok && result.status === 1 && Array.isArray(result.data)) {
          setMaterials(result.data);
        } else {
          setMaterials([]);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
        setMaterials([]);
        toast({
          title: "Error",
          description: "Could not connect to the server to fetch materials.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingMaterials(false);
        if (isInitialRender.current) {
          isInitialRender.current = false;
        }
      }
    };

    if (watchedCategory && isArtworkDataLoaded) {
      fetchMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCategory, isArtworkDataLoaded]);

  // Separate effect to ensure medium is set correctly after materials are loaded
  useEffect(() => {
    if (
      artwork &&
      artwork.materials?.id &&
      materials.length > 0 &&
      isArtworkDataLoaded
    ) {
      const currentMedium = watch("medium");
      // Only set if the current medium is different from what it should be
      if (currentMedium !== artwork.materials.id) {
        setValue("medium", artwork.materials.id);
      }
    }
  }, [materials, artwork, isArtworkDataLoaded, setValue, watch]);

  useEffect(() => {
    calculateAmounts(
      watchedListingPrice,
      watchedHasDiscount,
      watchedDiscountPercentage,
    );
  }, [
    watchedHasDiscount,
    watchedListingPrice,
    watchedDiscountPercentage,
    setValue,
  ]);

  useEffect(() => {
    if (watchedHasDiscount) {
      if (!watchedDiscountPercentage || watchedDiscountPercentage < 5) {
        setValue("discountPercentage", 5);
      }
    } else {
      setValue("discountPercentage", 0);
      setValue("discountedPrice", undefined);
    }
  }, [watchedHasDiscount, setValue, watchedDiscountPercentage]);

  const handleDiscountPercentageChange = (newValue: number) => {
    const clampedValue = Math.max(5, Math.min(25, newValue));
    setValue("discountPercentage", clampedValue);
  };

  const onFormSubmit: SubmitHandler<ArtworkFormValues> = async (data) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const isEditing = !!artwork;
    let payload: any = {};

    const newImages = [mainImageUrl, ...multiShotUrls].filter(
      (url): url is string => {
        if (!url) return false;
        // Check if the URL is not part of the initial artwork media
        const isExisting = initialArtworkData?.media?.some(
          (m: any) => m.file_path === url,
        );
        return !isExisting;
      },
    );

    if (isEditing) {
      // Construct differential payload
      const initialFormValues = {
        title: initialArtworkData.title || "",
        description: initialArtworkData.description || "",
        orientation: initialArtworkData.orientation || "",
        year: initialArtworkData.year_of_artwork?.toString() || "",
        category: initialArtworkData.category?.id || "",
        medium: initialArtworkData.materials?.id || undefined,
        width: initialArtworkData.width,
        height: initialArtworkData.height,
        depth: initialArtworkData.depth,
        weight: initialArtworkData.weight,
        quantity: initialArtworkData.quantity,
        sellOptions: initialArtworkData.sell_options || "original_only",
        deliveryAs: initialArtworkData.delivery_as || "rolled",
        listingPrice: parseFloat(initialArtworkData.listing_price),
        discount: parseFloat(initialArtworkData.discount),
        status: initialArtworkData.status || "active",
        isCopyrightOwner: initialArtworkData.is_copyright_owner,
      };

      const currentFormValues = getValues();

      if (currentFormValues.title !== initialFormValues.title)
        payload.title = currentFormValues.title;
      if (currentFormValues.description !== initialFormValues.description)
        payload.description = currentFormValues.description;
      if (currentFormValues.orientation !== initialFormValues.orientation)
        payload.orientation = currentFormValues.orientation;
      if (String(currentFormValues.year) !== initialFormValues.year)
        payload.year_of_artwork = currentFormValues.year;
      if (currentFormValues.category !== initialFormValues.category)
        payload.category = currentFormValues.category;
      if (currentFormValues.medium !== initialFormValues.medium)
        payload.materials = currentFormValues.medium;
      if (currentFormValues.width !== initialFormValues.width)
        payload.width = currentFormValues.width;
      if (currentFormValues.height !== initialFormValues.height)
        payload.height = currentFormValues.height;
      if (currentFormValues.depth !== initialFormValues.depth)
        payload.depth = currentFormValues.depth;
      if (currentFormValues.weight !== initialFormValues.weight)
        payload.weight = currentFormValues.weight;
      if (currentFormValues.quantity !== initialFormValues.quantity)
        payload.quantity = currentFormValues.quantity;
      if (currentFormValues.sellOptions !== initialFormValues.sellOptions)
        payload.sell_options = currentFormValues.sellOptions;
      if (currentFormValues.deliveryAs !== initialFormValues.deliveryAs)
        payload.delivery_as = currentFormValues.deliveryAs;
      if (currentFormValues.listingPrice !== initialFormValues.listingPrice)
        payload.listing_price = currentFormValues.listingPrice;

      const currentDiscount = currentFormValues.hasDiscount
        ? currentFormValues.discountPercentage
        : 0;
      if (currentDiscount !== initialFormValues.discount)
        payload.discount = currentDiscount;
      if (
        currentDiscount !== initialFormValues.discount &&
        currentFormValues.amountReceivable
      )
        payload.amount_receivable = currentFormValues.amountReceivable;

      if (currentFormValues.status !== initialFormValues.status)
        payload.status = currentFormValues.status;
      if (
        currentFormValues.isCopyrightOwner !==
        initialFormValues.isCopyrightOwner
      )
        payload.is_copyright_owner = currentFormValues.isCopyrightOwner;

      if (newImages.length > 0) {
        payload.images = newImages;
      }
      if (deletedImages.length > 0) {
        payload.deleted_images = deletedImages;
      }

      if (Object.keys(payload).length === 0) {
        toast({
          title: "No Changes Detected",
          description: "You haven't made any changes to the artwork.",
          variant: "default",
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      // Full payload for new artwork
      const allImages = [mainImageUrl, ...multiShotUrls].filter(
        (url): url is string => url !== null,
      );
      if (allImages.length === 0) {
        toast({
          title: "Image Required",
          description: "Please upload at least one image for the artwork.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      payload = {
        title: data.title,
        description: data.description,
        orientation: data.orientation,
        year_of_artwork: data.year,
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
        images: allImages,
        status: data.status,
        sell_options: data.sellOptions,
        delivery_as: data.deliveryAs,
      };
      if (materials.length > 0 && data.medium) {
        payload.materials = data.medium;
      }
    }

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/edit/${artwork.id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`;

    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        toast({
          title: `Artwork ${isEditing ? "Updated" : "Saved"}!`,
          description:
            result.message ||
            `Your artwork has been successfully ${isEditing ? "updated" : "submitted"}.`,
          variant: "success",
        });
        onSubmitSuccess();
      } else {
        toast({
          title: `Submission Failed`,
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Product submission error:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  let buttonText = isStandalone ? "Submit Artwork" : "Save & Continue";
  if (artwork) {
    buttonText = "Update Artwork";
  }

  return (
    <Form {...artworkForm}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <fieldset disabled={isViewMode}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <input
                type="file"
                ref={mainImageInputRef}
                onChange={handleMainFileSelect}
                className="hidden"
                accept="image/*"
                disabled={isUploadingMain || isViewMode}
              />
              <div
                className="relative border-2 border-dashed rounded-lg p-6 text-center h-64 flex flex-col justify-center items-center cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  !mainImagePreview &&
                  !isViewMode &&
                  mainImageInputRef.current?.click()
                }
              >
                {mainImagePreview ? (
                  <>
                    <Image
                      src={mainImagePreview}
                      alt="Main artwork preview"
                      fill
                      className="absolute inset-0 w-full h-full object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={90}
                      priority
                    />
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 z-10"
                        onClick={handleRemoveMainImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-lg font-semibold">
                      Browse to choose a file
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      (The image size should be minimum 1024 pixels and maximum
                      10000 pixels either in width or height)
                      <br />
                      (Size should be minimum 3MB to maximum 5MB)
                    </p>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="mt-4 bg-gray-900 hover:bg-gray-800 text-white"
                      disabled={isUploadingMain || isViewMode}
                      onClick={(e) => {
                        e.stopPropagation();
                        mainImageInputRef.current?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </>
                )}
                {isUploadingMain && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div>
                <Label>Multi Shot Angle</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  {multiShotPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <input
                        type="file"
                        ref={multiShotInputRefs[index]}
                        onChange={(e) => handleMultiShotSelect(e, index)}
                        className="hidden"
                        accept="image/*"
                        disabled={isUploadingMulti[index] || isViewMode}
                      />
                      <div
                        className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          !preview &&
                          !isViewMode &&
                          multiShotInputRefs[index]?.current?.click()
                        }
                      >
                        {preview ? (
                          <Image
                            src={preview}
                            alt={`Multi-shot preview ${index + 1}`}
                            fill
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-2xl font-light">+</div>
                        )}
                        {isUploadingMulti[index] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      {preview && !isViewMode && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 z-10"
                          onClick={(e) => handleRemoveMultiShot(e, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
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
                    <FormControl>
                      <Input placeholder="Add Title" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Textarea
                        placeholder="Describe the work in a few sentences"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Orientation" />
                        </SelectTrigger>
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="YYYY" {...field} />
                      </FormControl>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
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
                    <FormLabel>
                      Medium &amp; Material {materials.length > 0 && "*"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={
                        isFetchingMaterials ||
                        materials.length === 0 ||
                        isViewMode
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isFetchingMaterials
                                ? "Loading materials..."
                                : "Select..."
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name}
                          </SelectItem>
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
                        <FormControl>
                          <Input
                            placeholder="Width (In Inches)"
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artworkForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Height (In Inches)"
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artworkForm.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Depth (In Inches)"
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artworkForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Weight (Gram)"
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
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
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="original_only">
                            Original Only
                          </SelectItem>
                          <SelectItem value="original_and_prints">
                            Original and Prints
                          </SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category..." />
                        </SelectTrigger>
                      </FormControl>
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
                Works should be shipped unframed and in in roll unless rolling
                is not possible. Please write to partners@mojarto.com to change
                delivery condition
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={artworkForm.control}
                  name="hsnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          value={field.value ?? ""}
                          disabled
                        />
                      </FormControl>
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
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 12"
                          {...field}
                          value={field.value ?? ""}
                          disabled
                        />
                      </FormControl>
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ₹
                          </span>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter price"
                              {...field}
                              className="pl-6"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                              value={field.value ?? ""}
                            />
                          </FormControl>
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
                          <button
                            type="button"
                            onClick={() =>
                              handleDiscountPercentageChange(
                                (field.value || 5) - 1,
                              )
                            }
                            disabled={!watchedHasDiscount || isViewMode}
                            className="text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center p-0 m-0 leading-none bg-transparent border-none hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            -
                          </button>
                          <span className="text-sm text-center tabular-nums text-foreground">
                            {field.value || 0}%
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleDiscountPercentageChange(
                                (field.value || 5) + 1,
                              )
                            }
                            disabled={!watchedHasDiscount || isViewMode}
                            className="text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center p-0 m-0 leading-none bg-transparent border-none hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            +
                          </button>
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

                <div className="grid md:grid-cols-2 gap-4 items-end">
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
                                <p>
                                  The final price after discount. This is
                                  calculated automatically.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ₹
                          </span>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Calculated price"
                              {...field}
                              className="pl-6"
                              value={field.value ?? ""}
                              disabled
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={artworkForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="in_active">Inactive</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 items-center">
                  <FormField
                    control={artworkForm.control}
                    name="amountReceivable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Receivable * (₹)</FormLabel>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ₹
                          </span>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="pl-6"
                              value={field.value ?? ""}
                              disabled
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground self-end pb-2">
                    Please ensure you have accounted for shipping charges in
                    your price quotation. Please revise the same, if you need
                    to, before submitting this artwork.
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
              {!isViewMode && (
                <div className="flex justify-end mt-8 gap-4">
                  {artwork ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push("/seller/my-artworks")}
                      disabled={isSubmitting}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleResetForm}
                      disabled={isSubmitting}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {buttonText}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
