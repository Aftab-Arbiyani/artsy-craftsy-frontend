'use client';

import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Lightbulb, Loader2, Wand2, Info, Send } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ArtIdeaGeneratorProps {
  isLoggedIn: boolean;
  userType?: string | null;
  onAuthRequired: () => void;
  onCommission?: (data: { description: string; imagePath: string }) => void;
}

const SAMPLE_PROMPTS = [
  "A cyberpunk cityscape in the style of Van Gogh",
  "Minimalist abstract landscape with gold leaf accents",
  "A surreal portrait of a cat as a Victorian general",
  "Hyper-realistic oil painting of a forest at dusk"
];

export default function ArtIdeaGenerator({ isLoggedIn, userType, onAuthRequired, onCommission }: ArtIdeaGeneratorProps) {
  const [description, setDescription] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSampleClick = (prompt: string) => {
    setDescription(prompt);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    
    if (!description.trim()) {
      toast({ title: "Description needed", description: "Please describe your art idea.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai-suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: description }),
      });

      const result = await response.json();

      if (response.ok && result.status === 1) {
        setGeneratedImage(result.data.response_image);
        toast({ title: "Idea Generated!", description: "Check out the AI-powered artwork below.", variant: "success" });
      } else {
        toast({ 
          title: "Error", 
          description: result.message || "Failed to generate art idea. Please try again.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error generating art ideas:", error);
      toast({ title: "Error", description: "Could not connect to the server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommissionClick = () => {
    if (onCommission && generatedImage) {
      onCommission({
        description: description,
        imagePath: generatedImage
      });
    }
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden shadow-xl sm:shadow-2xl border-none ring-1 ring-border">
        <div className="grid lg:grid-cols-2">
          {/* Left Side: Input */}
          <div className="p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 bg-card">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="uppercase tracking-widest text-[10px] sm:text-xs font-bold">AI Creative Studio</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold">Visualize Your Imagination</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Describe the style, colors, and subject of your dream artwork. Our AI will help you visualize the concept before you commission an artist.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="ideaDescription" className="text-xs sm:text-sm font-semibold flex items-center justify-between">
                  Art Brief
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-normal">Min. 10 characters</span>
                </Label>
                <div className="relative">
                    <Textarea
                        id="ideaDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., A celestial ocean where stars fall like rain, ethereal blue palette, cinematic lighting..."
                        rows={4}
                        sm-rows={5}
                        required
                        className="resize-none pr-10 focus-visible:ring-accent text-sm"
                    />
                    <div className="absolute bottom-3 right-3 text-muted-foreground/30">
                        <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Try these inspirations:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {SAMPLE_PROMPTS.map((p, i) => (
                    <Badge 
                        key={i} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-2 py-0.5 sm:px-3 sm:py-1 font-normal text-[9px] sm:text-[11px]"
                        onClick={() => handleSampleClick(p)}
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 sm:h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20 transition-all active:scale-[0.98] text-sm"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                )}
                {isLoading ? 'Generating Masterpiece...' : 'Generate AI Visual'}
              </Button>
            </form>
            
            <div className="flex items-start gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg text-[10px] sm:text-[11px] text-muted-foreground italic leading-tight">
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                <span>Note: These images are AI-generated concepts to help you express your vision. The final artwork will be handcrafted by a real artist.</span>
            </div>
          </div>

          {/* Right Side: Output */}
          <div className={cn(
            "relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] bg-muted/30 border-t lg:border-t-0 lg:border-l border-border",
            !generatedImage && !isLoading && "bg-gradient-to-br from-accent/5 to-primary/5"
          )}>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 sm:h-8 sm:w-8 text-accent animate-pulse" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground animate-pulse tracking-wide">Painting your ideas...</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full p-5 sm:p-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                <div className="relative aspect-square w-full max-w-[320px] sm:max-w-[400px] overflow-hidden rounded-xl shadow-2xl border-4 sm:border-8 border-card group">
                    <Image 
                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${generatedImage}`}
                        alt="AI Generated Art"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 ring-1 ring-black/10 rounded-xl" />
                </div>
                <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[400px]">
                    <p className="text-xs sm:text-sm font-headline italic text-muted-foreground text-center px-2 sm:px-4">
                        " {description.substring(0, 60)}{description.length > 60 ? '...' : ''} "
                    </p>
                    {userType === 'customer' && (
                      <Button 
                        variant="default" 
                        className="w-full bg-primary hover:bg-primary/90 gap-2 font-bold h-10 sm:h-11 text-sm"
                        onClick={handleCommissionClick}
                      >
                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Commission This Idea
                      </Button>
                    )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 sm:p-12 space-y-3 sm:space-y-4 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
                <div className="relative mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-card rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-border">
                    <Wand2 className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="text-base sm:text-lg font-headline font-bold">Concept Studio</p>
                    <p className="text-xs sm:text-sm">Enter a prompt to see the magic happen</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}