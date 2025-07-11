
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { useArtists } from '@/hooks/useArtists';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Clock } from 'lucide-react';

const verificationFormSchema = z.object({
  workUrl1: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  workUrl2: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  performanceVideo: z.any().optional(),
  reason: z.string().min(20, "Please provide a reason of at least 20 characters."),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
}).refine(data => !!data.workUrl1 || !!data.workUrl2 || (data.performanceVideo && data.performanceVideo.length > 0), {
    message: "Please provide at least one link or upload a performance video.",
    path: ["workUrl1"], 
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

function VerificationFormSkeleton() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-1/3" />
            </CardContent>
        </Card>
    );
}


export default function VerificationPageClient() {
  const router = useRouter();
  const { artists, submitVerificationRequest, verificationRequests } = useArtists();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [currentArtist, setCurrentArtist] = useState<any>(null);
  
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      workUrl1: '',
      workUrl2: '',
      reason: '',
      agreedToTerms: false,
    },
  });

  useEffect(() => {
    if (!isAuthLoading && artists.length > 0 && user) {
        const artist = artists.find(a => a.email === user.email);
        setCurrentArtist(artist);
    }
  }, [isAuthLoading, artists, user]);

  const existingRequest = verificationRequests.find(req => req.artistId === currentArtist?.id);

  function onSubmit(data: VerificationFormValues) {
    if (!currentArtist) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find artist profile.' });
        return;
    }

    const videoUrl = data.performanceVideo?.[0] ? `/uploads/mock-video.mp4` : '';

    submitVerificationRequest(currentArtist.id, { 
        workUrl1: data.workUrl1 || '',
        workUrl2: data.workUrl2 || '',
        reason: data.reason,
        performanceVideoUrl: videoUrl,
    });

    toast({
        title: "Verification Request Submitted!",
        description: "Your application is under review. We'll notify you soon.",
    });

    router.push('/artist/dashboard');
  }

  if (isAuthLoading || artists.length === 0) {
    return <VerificationFormSkeleton />;
  }

  if (currentArtist?.isVerified) {
    return (
        <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-4">
                <ShieldCheck className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-headline">You are already verified!</h2>
                <p className="text-muted-foreground">You can now create paid events and enjoy all the benefits of a verified artist.</p>
                <Button onClick={() => router.push('/artist/dashboard')}>Back to Dashboard</Button>
            </CardContent>
        </Card>
    );
  }

  if (existingRequest && existingRequest.status === 'Pending') {
    return (
         <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-4">
                <Clock className="h-16 w-16 text-primary mx-auto" />
                <h2 className="text-2xl font-headline">Your request is pending review.</h2>
                <p className="text-muted-foreground">We are currently reviewing your verification request. We will notify you once it's processed.</p>
                <Button onClick={() => router.push('/artist/dashboard')}>Back to Dashboard</Button>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Apply for Verified Badge</CardTitle>
        <CardDescription>Submit your details for review. Verified artists can create paid events.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <FormLabel>Proof of Work</FormLabel>
              <FormDescription>Please provide at least one link OR upload a performance video.</FormDescription>
              {form.formState.errors.workUrl1 && <FormMessage>{form.formState.errors.workUrl1.message}</FormMessage>}
            </div>

            <FormField
              control={form.control}
              name="workUrl1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Link (Optional)</FormLabel>
                  <FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="workUrl2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram or Facebook Profile Link (Optional)</FormLabel>
                  <FormControl><Input placeholder="https://instagram.com/yourprofile" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="performanceVideo"
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Performance Video (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                        type="file" 
                        accept="video/*"
                        {...fieldProps}
                        onChange={(e) => onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why are you applying for verification?</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Tell us about your work and why you need a verified badge..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreedToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the CloudStage terms and conditions and meet the minimum standards and policy.
                    </FormLabel>
                  </div>
                   <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
