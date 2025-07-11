
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const verificationFormSchema = z.object({
  videoUrl1: z.string().url("Please enter a valid video URL."),
  videoUrl2: z.string().url("Please enter a valid video URL."),
  description: z.string().min(10, "Please provide a brief description.").max(500, "Description cannot exceed 500 characters."),
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

export default function VerificationPageClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { artists, submitVerificationRequest } = useArtists();
  const { toast } = useToast();

  const currentArtist = artists.find(a => a.email === user?.email);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      videoUrl1: '',
      videoUrl2: '',
      description: '',
    },
  });

  function onSubmit(data: VerificationFormValues) {
    if (!currentArtist) return;

    submitVerificationRequest(currentArtist.id, {
        videoUrl1: data.videoUrl1,
        videoUrl2: data.videoUrl2,
        description: data.description,
    });

    toast({
      title: "Verification Request Submitted",
      description: "Your request is now under review by the admin team.",
    });
    router.push('/artist/dashboard');
  }

  if (!currentArtist) {
    return <div>Loading artist data...</div>;
  }
  
  if (currentArtist.isVerified) {
      return (
          <div className="text-center p-8">
              <h1 className="text-2xl font-headline">You are already verified!</h1>
              <p className="text-muted-foreground">No further action is needed.</p>
          </div>
      )
  }
  
   if (currentArtist.verificationRequest?.status === 'Pending') {
      return (
          <div className="text-center p-8">
              <h1 className="text-2xl font-headline">Verification Request Pending</h1>
              <p className="text-muted-foreground">Your request is currently under review. We'll notify you soon.</p>
          </div>
      )
  }


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Apply for Verified Badge</CardTitle>
        <CardDescription>
            To get verified, please provide links to two videos showcasing your work and tell us why you should be verified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="videoUrl1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Link 1</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Link 2</FormLabel>
                  <FormControl>
                    <Input placeholder="https://vimeo.com/..." {...field} />
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
                  <FormLabel>Why should you be verified?</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="e.g., I am a professional touring musician with an established fan base..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
