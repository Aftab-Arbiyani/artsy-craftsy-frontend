'use client';

import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateArtIdeas, type GenerateArtIdeasInput, type GenerateArtIdeasOutput } from '@/ai/flows/generate-art-ideas';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Lightbulb, ImagePlus, Loader2 } from 'lucide-react';

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ArtIdeaGenerator() {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      toast({ title: "Description needed", description: "Please describe your art idea.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setIdeas([]);

    try {
      const input: GenerateArtIdeasInput = { description };
      if (imageFile) {
        input.imageDataUri = await fileToDataUri(imageFile);
      }
      
      const result: GenerateArtIdeasOutput = await generateArtIdeas(input);
      setIdeas(result.ideas);
      toast({ title: "Ideas Generated!", description: "Check out the AI-powered suggestions below." });
    } catch (error) {
      console.error("Error generating art ideas:", error);
      toast({ title: "Error", description: "Failed to generate art ideas. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-accent" /> AI Art Idea Generator
        </CardTitle>
        <CardDescription>
          Need inspiration? Describe your vision, upload an optional reference image, and let our AI suggest some creative art ideas!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="ideaDescription" className="font-semibold">Art Description</Label>
            <Textarea
              id="ideaDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A surreal landscape with floating islands and glowing flora..."
              rows={4}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="ideaImage" className="font-semibold">Reference Image (Optional)</Label>
            <div className="mt-1 flex items-center space-x-4">
              <Input
                id="ideaImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-xs"
              />
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
              )}
            </div>
             <p className="text-xs text-muted-foreground mt-1">Upload an image for visual inspiration.</p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Generate Ideas
          </Button>
        </form>

        {ideas.length > 0 && (
          <div className="mt-8">
            <h3 className="font-headline text-xl font-semibold mb-4">Generated Ideas:</h3>
            <ul className="space-y-3 list-disc list-inside bg-muted p-4 rounded-md">
              {ideas.map((idea, index) => (
                <li key={index} className="text-sm">{idea}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
