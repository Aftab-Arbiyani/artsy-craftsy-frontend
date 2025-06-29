'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Send, Loader2 } from 'lucide-react';

const customArtRequestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(1000, { message: "Description must be 1000 characters or less." }),
  referenceImage: z.custom<FileList>().optional()
    .refine(files => !files || files.length <= 1, "Only one image can be uploaded.")
    .refine(files => !files || !files[0] || files[0].size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(files => !files || !files[0] || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(files[0].type), ".jpg, .jpeg, .png, .gif, .webp files are accepted."),
  budget: z.string().optional(), // Can be more specific, e.g., z.number().positive() if parsing
  dimensions: z.string().optional(),
});

type CustomArtFormValues = z.infer<typeof customArtRequestSchema>;

export default function CustomArtForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<CustomArtFormValues>({
    resolver: zodResolver(customArtRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      description: '',
      budget: '',
      dimensions: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit: SubmitHandler<CustomArtFormValues> = async (data) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Custom Art Request Data:', data);
    
    // In a real app, you would send this data to your backend.
    // If an image is present in data.referenceImage, you'd upload it.
    // For now, we'll just log it and show a success toast.

    toast({
      title: "Request Submitted!",
      description: "Thank you for your custom art request. We'll be in touch soon!",
      variant: "success",
    });
    form.reset();
    setImagePreview(null);
    setIsLoading(false);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Request Custom Artwork</CardTitle>
        <CardDescription>
          Share your vision with us, and our talented artists will bring it to life. Fill out the form below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Art Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your desired artwork in detail (style, subject, colors, mood, etc.)"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Dimensions (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 24x36 inches, 50cm high" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $500 - $1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="referenceImage"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel>Reference Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                       <label htmlFor="referenceImageFile" className="cursor-pointer inline-flex items-center px-4 py-2 border border-input bg-background rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        <ImagePlus className="mr-2 h-4 w-4" /> Choose File
                      </label>
                      <Input 
                        id="referenceImageFile"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        {...restField}
                        onChange={(e) => {
                          onChange(e.target.files); // RHF needs FileList
                          handleImageChange(e); // For preview
                        }}
                      />
                      {imagePreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreview} alt="Reference Preview" className="h-20 w-20 object-cover rounded-md border" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Max 5MB. JPG, PNG, GIF, WEBP accepted.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} size="lg" className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
