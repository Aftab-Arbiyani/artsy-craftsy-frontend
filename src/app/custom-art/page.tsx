"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomArtForm from "@/components/custom-art/CustomArtForm";
import ArtIdeaGenerator from "@/components/custom-art/ArtIdeaGenerator";
import { Separator } from "@/components/ui/separator";
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
import { usePageTransition } from "@/context/PageTransitionProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Edit3 } from "lucide-react";

export default function CustomArtPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-studio");
  const [prefillData, setPrefillData] = useState<{
    description: string;
    imagePath: string;
  } | null>(null);

  const router = useRouter();
  const { startTransition } = usePageTransition();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    setIsLoggedIn(!!token);

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserType(user.type || null);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleAuthRedirect = (path: string) => {
    startTransition();
    router.push(path);
  };

  const handleCommissionFromAI = (data: {
    description: string;
    imagePath: string;
  }) => {
    setPrefillData(data);
    setActiveTab("request-form");
    // Scroll to top of the form area
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const AuthPopup = () => (
    <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
          <AlertDialogDescription>
            Please log in or create an account to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleAuthRedirect("/signup?type=customer")}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            Sign Up
          </AlertDialogAction>
          <AlertDialogAction onClick={() => handleAuthRedirect("/login")}>
            Log In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const isArtist = userType === "artist";

  return (
    <div className="space-y-8 sm:space-y-12 pb-20">
      <div className="max-w-4xl mx-auto text-center space-y-4 px-4">
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Create Your Unique Artwork
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {isArtist
            ? "Use our AI Creative Studio for inspiration and ideas."
            : "Bring your vision to life. Use our AI Creative Studio for inspiration, or submit a direct request to our artists."}
        </p>
      </div>

      {isArtist ? (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
          <ArtIdeaGenerator
            isLoggedIn={isLoggedIn}
            userType={userType}
            onAuthRequired={() => setShowAuthDialog(true)}
            onCommission={handleCommissionFromAI}
          />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl mx-auto px-2 sm:px-4"
        >
          <div className="flex justify-center mb-8 sm:mb-12">
            <TabsList className="h-12 sm:h-14 p-1 bg-muted/50 rounded-full border shadow-sm w-full max-w-md sm:w-auto">
              <TabsTrigger
                value="ai-studio"
                className="flex-1 sm:flex-none rounded-full px-3 sm:px-8 h-full data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">AI Creative Studio</span>
              </TabsTrigger>
              <TabsTrigger
                value="request-form"
                className="flex-1 sm:flex-none rounded-full px-3 sm:px-8 h-full data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm"
              >
                <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">Commission Artwork</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="ai-studio"
            className="focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500"
          >
            <ArtIdeaGenerator
              isLoggedIn={isLoggedIn}
              userType={userType}
              onAuthRequired={() => setShowAuthDialog(true)}
              onCommission={handleCommissionFromAI}
            />
          </TabsContent>

          <TabsContent
            value="request-form"
            className="focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500"
          >
            <section className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 px-4">
                <h2 className="text-2xl sm:text-3xl font-headline font-bold">
                  Request Custom Artwork
                </h2>
                <p className="text-sm sm:text-muted-foreground mt-2">
                  Fill out the details below to start the collaboration process
                  with our professional artists.
                </p>
              </div>
              <CustomArtForm
                isLoggedIn={isLoggedIn}
                onAuthRequired={() => setShowAuthDialog(true)}
                prefillData={prefillData}
              />
            </section>
          </TabsContent>
        </Tabs>
      )}

      {!isArtist && (
        <>
          <Separator className="my-8 sm:my-16" />

          <section className="text-center px-4">
            <h2 className="font-headline text-2xl sm:text-3xl font-semibold mb-8 sm:mb-12">
              How the Journey Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto text-left">
              <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                  1
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                  Conceptualize
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Brainstorm with our AI studio or draft your own detailed brief.
                  The more context you provide, the better our artists can match
                  your vision.
                </p>
              </div>
              <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                  2
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                  Match & Consult
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  We connect you with artists specializing in your chosen style.
                  Review portfolios, discuss timelines, and finalize the price
                  together.
                </p>
              </div>
              <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                  3
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                  Masterpiece
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Watch your art come to life. Once completed and approved, your
                  unique physical or digital artwork is shipped directly to your
                  door.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      <AuthPopup />
    </div>
  );
}
