
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

const verificationFormSchema = z.object({
  youtubeUrl: z.string().url("A valid YouTube URL is required.").refine(url => url.includes('youtube.com') || url.includes('youtu.be'), "Must be a valid YouTube URL."),
  socialUrl: z.string().url("A valid social media URL is required.").refine(url => url.includes('instagram.com') || url.includes('facebook.com'), "URL must be for Instagram or Facebook."),
  performanceFileUrl: z.string().url("Please upload a performance video."),
  description: z.string().min(20, "Please provide a brief description of at least 20 characters.").max(500, "Description cannot exceed 500 characters."),
  agreedToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions." }),
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
      youtubeUrl: '',
      socialUrl: '',
      performanceFileUrl: '',
      description: '',
      agreedToTerms: false,
    },
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        form.setError('performanceFileUrl', { type: 'manual', message: 'File size cannot exceed 10MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('performanceFileUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  }

  function onSubmit(data: VerificationFormValues) {
    if (!currentArtist) return;

    submitVerificationRequest(currentArtist.id, data);

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
            Submit the required information to apply for verification. This helps us confirm your identity and authenticity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                  </FormControl>
                  <FormDescription>A link to a video of your performance or work.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram or Facebook Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://instagram.com/your-profile" {...field} />
                  </FormControl>
                  <FormDescription>Link to your official artist page on Instagram or Facebook.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="performanceFileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Performance Video</FormLabel>
                   <FormControl>
                        <Input type="file" accept="video/*" onChange={handleFileUpload} />
                    </FormControl>
                    <FormDescription>Upload a short video of your performance. Max 10MB.</FormDescription>
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
                       Agree to terms and conditions
                    </FormLabel>
                    <FormDescription>
                      You agree to our <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and that you meet our minimum policy standards.
                    </FormDescription>
                     <FormMessage />
                  </div>
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
