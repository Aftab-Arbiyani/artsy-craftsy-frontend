'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Check, Loader2, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  amount: string;
  billing_cycle: string;
  razorpay_plan_id: string;
  generation_limit: number;
  status: string;
}

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed: () => void;
}

export default function SubscriptionModal({
  open,
  onOpenChange,
  onSubscribed,
}: SubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    setIsLoadingPlans(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions/plans`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 1 && Array.isArray(data.data)) {
          const activePlans: Plan[] = data.data.filter((p: Plan) => p.status === 'active');
          setPlans(activePlans);
          // Default to yearly plan if available, otherwise first plan
          const yearly = activePlans.find((p) => p.billing_cycle === 'yearly');
          setSelectedPlanId(yearly?.id ?? activePlans[0]?.id ?? '');
        }
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to load subscription plans.', variant: 'destructive' });
      })
      .finally(() => setIsLoadingPlans(false));
  }, [open]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const pollSubscriptionActive = (token: string): Promise<void> => {
    const MAX_ATTEMPTS = 6;
    const INTERVAL_MS = 2000;

    return new Promise((resolve) => {
      let attempts = 0;

      const check = async () => {
        attempts++;
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions/status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (data.status === 1 && data.data?.is_active) {
            resolve();
            return;
          }
        } catch {}

        if (attempts < MAX_ATTEMPTS) {
          setTimeout(check, INTERVAL_MS);
        } else {
          // Timed out — resolve anyway since payment was already verified
          resolve();
        }
      };

      setTimeout(check, INTERVAL_MS);
    });
  };

  const getPlanFeatures = (plan: Plan) => [
    `${plan.generation_limit} AI art generations per ${plan.billing_cycle}`,
    'High-resolution outputs',
    'Commission directly from AI',
    ...(plan.billing_cycle === 'yearly' ? ['Priority support'] : []),
  ];

  const handleSubscribe = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not logged in', description: 'Please log in to subscribe.', variant: 'destructive' });
      return;
    }
    if (!selectedPlan) return;

    setIsSubscribing(true);

    try {
      // 1. Create subscription order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan_id: selectedPlan.id }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.status !== 1) {
        throw new Error(result.message || 'Failed to create subscription order.');
      }

      const { razorpay_subscription_id } = result.data;

      // 2. Load Razorpay SDK if not already loaded
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
        document.body.appendChild(script);
      });

      // 3. Open Razorpay subscription checkout
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: razorpay_subscription_id,
        name: 'Arts&Craft Studio',
        image: 'public/favicon-32x32.png',
        description: `AI Studio — ${selectedPlan.name} Subscription`,
        handler: async function (response: any) {
          // 4. Verify payment
          const verifyRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscriptions/verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const verifyResult = await verifyRes.json();

          if (verifyRes.ok && verifyResult.status === 1) {
            toast({
              title: 'Payment Successful!',
              description: 'Activating your subscription, please wait...',
              variant: 'success',
            });
            await pollSubscriptionActive(token);
            toast({
              title: 'Subscription Activated!',
              description: 'You now have full access to the AI Creative Studio.',
              variant: 'success',
            });
            onSubscribed();
          } else {
            throw new Error(verifyResult.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone_number || '',
        },
        theme: { color: '#4285F4' },
        modal: { ondismiss: () => setIsSubscribing(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (res: any) => {
        toast({
          title: 'Payment Failed',
          description: res.error?.description || 'Please try again.',
          variant: 'destructive',
        });
      });

      // Close the Dialog first so its focus trap / scroll lock don't
      // interfere with the Razorpay iframe, then open Razorpay after
      // the exit animation completes (~300ms).
      onOpenChange(false);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsSubscribing(false);
      rzp.open();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsSubscribing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle className="font-headline text-2xl">
            Unlock AI Creative Studio
          </DialogTitle>
          <DialogDescription>
            Subscribe to generate AI art concepts and bring your vision to life.
          </DialogDescription>
        </DialogHeader>

        {isLoadingPlans ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border-2 border-border p-4 space-y-2 animate-pulse">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-6 w-20 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {plans.map((plan) => {
              const isYearly = plan.billing_cycle === 'yearly';
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    'relative rounded-xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    selectedPlanId === plan.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  )}
                >
                  {isYearly && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] px-2 whitespace-nowrap">
                      Best Value
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 mb-2">
                    {isYearly ? (
                      <Crown className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-sm capitalize">{plan.name}</span>
                  </div>
                  <p className="text-xl font-bold">₹{plan.amount}</p>
                  <p className="text-xs text-muted-foreground">per {plan.billing_cycle}</p>
                </button>
              );
            })}
          </div>
        )}

        {selectedPlan && (
          <ul className="mt-3 space-y-2">
            {getPlanFeatures(selectedPlan).map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-accent shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <Button
          className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-11 shadow-lg shadow-accent/20"
          onClick={handleSubscribe}
          disabled={isSubscribing || isLoadingPlans || !selectedPlan}
        >
          {isSubscribing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isSubscribing ? 'Processing...' : 'Subscribe Now'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
