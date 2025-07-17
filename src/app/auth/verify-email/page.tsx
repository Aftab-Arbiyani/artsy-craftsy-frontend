'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

enum VerificationStatus {
  Verifying,
  Success,
  Error,
}

function VerificationComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = searchParams.get('id');

  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.Verifying);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) {
      setMessage('Verification token is missing. Please check the link.');
      setStatus(VerificationStatus.Error);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-email?id=${id}`);
        const result = await response.json();

        if (response.ok && result.status === 1) {
          setMessage(result.message || 'Your account has been successfully activated.');
          setStatus(VerificationStatus.Success);
          toast({
            title: 'Email Verified!',
            description: 'You can now log in to your account.',
            variant: 'success',
          });
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setMessage(result.message || 'Failed to verify email. The link may have expired or is invalid.');
          setStatus(VerificationStatus.Error);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setMessage('Could not connect to the server. Please try again later.');
        setStatus(VerificationStatus.Error);
      }
    };

    verifyEmail();
  }, [id, router, toast]);

  const renderContent = () => {
    switch (status) {
      case VerificationStatus.Verifying:
        return (
          <>
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <CardTitle className="font-headline text-3xl mt-4">Verifying Your Email</CardTitle>
            <CardDescription className="text-base">
              Please wait while we confirm your email address...
            </CardDescription>
          </>
        );
      case VerificationStatus.Success:
        return (
          <>
            <div className="mx-auto bg-success/10 text-success p-4 rounded-full w-fit">
              <MailCheck className="h-12 w-12" />
            </div>
            <CardTitle className="font-headline text-3xl mt-4">Email Verified!</CardTitle>
            <CardDescription className="text-base">
              {message} Redirecting you to the login page...
            </CardDescription>
          </>
        );
      case VerificationStatus.Error:
        return (
          <>
            <div className="mx-auto bg-destructive/10 text-destructive p-4 rounded-full w-fit">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <CardTitle className="font-headline text-3xl mt-4">Verification Failed</CardTitle>
            <CardDescription className="text-base mb-6">
              {message}
            </CardDescription>
            <Link href="/login" className="mt-6 block">
              <Button>Back to Login</Button>
            </Link>
          </>
        );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8 px-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader>{renderContent()}</CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8 px-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    }>
      <VerificationComponent />
    </Suspense>
  );
}
