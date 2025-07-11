
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useArtists } from '@/hooks/useArtists';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Award, ShieldCheck, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const verificationFormSchema = z.object({
  youtubeUrl: z.string().url("A valid YouTube URL is required.").refine(url => url.includes('youtube.com') || url.includes('youtu.be'), "Must be a YouTube URL."),
  socialUrl: z.string().url("A valid social media URL is required.").refine(url => url.includes('instagram.com') || url.includes('facebook.com'), "Must be an Instagram or Facebook URL."),
  performanceFile: z.any().refine(file => file?.length === 1, "A performance video is required."),
  description: z.string().min(20, "Please provide a reason of at least 20 characters."),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions." }),
  }),
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

function VerificationFormSkeleton() {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                     <div className="h-24 w-full flex items-center justify-center rounded-lg border-2 border-dashed">
                        <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
    )
}

export default function VerificationPageClient() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { artists, submitVerificationRequest } = useArtists();
  const { toast } = useToast();
  
  const [currentArtist, setCurrentArtist] = useState<any>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      const artist = artists.find(a => a.email === user.email);
      setCurrentArtist(artist);
    }
  }, [isAuthLoading, user, artists]);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      youtubeUrl: '',
      socialUrl: '',
      description: '',
      agreedToTerms: false,
    },
  });

  const onSubmit = async (data: VerificationFormValues) => {
    if (!currentArtist) return;
    setIsFileUploading(true);

    // Mock file upload
    const file = data.performanceFile[0];
    const performanceFileUrl = await new Promise<string>(resolve => {
        setTimeout(() => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        }, 1500);
    });
    
    setIsFileUploading(false);

    submitVerificationRequest(currentArtist.id, {
        ...data,
        performanceFileUrl,
    });

    toast({
      title: "Verification Submitted!",
      description: "Your request for verification is under review. We'll notify you soon.",
    });
    router.push('/artist/dashboard');
  };
  
  if (isAuthLoading || !currentArtist) {
    return <VerificationFormSkeleton />;
  }

  if (currentArtist.isVerified) {
    return (
        <Card className="max-w-3xl mx-auto text-center py-12">
            <CardHeader>
                <ShieldCheck className="mx-auto h-16 w-16 text-green-500"/>
                <CardTitle className="text-3xl font-headline mt-4">You are already verified!</CardTitle>
                <CardDescription>Your artist profile has the verified badge. No further action is needed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild><Link href="/artist/dashboard">Back to Dashboard</Link></Button>
            </CardContent>
        </Card>
    );
  }
  
  if (currentArtist.verificationRequest?.status === 'Pending') {
    return (
        <Card className="max-w-3xl mx-auto text-center py-12">
            <CardHeader>
                <Clock className="mx-auto h-16 w-16 text-primary"/>
                <CardTitle className="text-3xl font-headline mt-4">Verification Request Pending</CardTitle>
                <CardDescription>Your application is currently under review. We will notify you once a decision has been made.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild><Link href="/artist/dashboard">Back to Dashboard</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2"><Award />Artist Verification</CardTitle>
          <CardDescription>Submit the required information to get the verified badge on your profile. This helps build trust with your audience.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Channel Link</FormLabel>
                    <FormControl><Input placeholder="https://youtube.com/yourchannel" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="socialUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram or Facebook Profile Link</FormLabel>
                    <FormControl><Input placeholder="https://instagram.com/yourprofile" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="performanceFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload a Performance Video</FormLabel>
                    <FormDescription>Upload a short video of you performing. Max 50MB.</FormDescription>
                    <FormControl>
                        <Input type="file" accept="video/*" onChange={(e) => field.onChange(e.target.files)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why are you applying for verification?</FormLabel>
                    <FormControl><Textarea rows={4} placeholder="e.g., To confirm my identity as a professional artist and build trust with my followers..." {...field} /></FormControl>
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
                        I agree to the CloudStage terms and conditions.
                      </FormLabel>
                      <FormDescription>
                        I confirm that I meet the minimum activity and authenticity standards.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/artist/dashboard')}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isFileUploading}>
                    {form.formState.isSubmitting || isFileUploading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}
