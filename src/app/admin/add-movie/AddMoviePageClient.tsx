
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useMovies } from '@/hooks/useMovies';
import { useToast } from '@/hooks/use-toast';
import { MOVIE_GENRES, MOVIE_LANGUAGES } from '@/lib/movies';
import { getYoutubeVideoId } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const movieFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  genre: z.enum(MOVIE_GENRES, { required_error: "Genre is required." }),
  language: z.enum(MOVIE_LANGUAGES, { required_error: "Language is required." }),
  videoUrl: z.string().url("A valid URL is required."), // Can be youtube or storage URL
  bannerUrl: z.string().url("A banner image is required."),
});

type MovieFormValues = z.infer<typeof movieFormSchema>;

export default function AddMoviePageClient() {
  const router = useRouter();
  const { addMovie } = useMovies();
  const { toast } = useToast();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      bannerUrl: '',
    },
  });
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setBannerPreview(dataUrl);
        try {
          const bannerRef = ref(storage, `movie-thumbnails/${Date.now()}`);
          await uploadString(bannerRef, dataUrl, 'data_url');
          const downloadURL = await getDownloadURL(bannerRef);
          form.setValue('bannerUrl', downloadURL, { shouldValidate: true });
          toast({ title: 'Banner uploaded!' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Upload failed' });
        } finally {
          setIsUploading(false);
        }
      };
    }
  };

  async function onSubmit(data: MovieFormValues) {
    try {
      await addMovie(data);
      toast({
        title: "Movie Added Successfully!",
        description: `"${data.title}" is now available in the movie library.`,
      });
      form.reset();
      setBannerPreview(null);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Failed to add movie' });
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Add a New Movie</CardTitle>
        <CardDescription>Fill out the details below to add a new movie to the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Movie Title</FormLabel>
                  <FormControl><Input placeholder="e.g., The Adventures of Code" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="A short synopsis of the movie..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a genre" /></SelectTrigger></FormControl>
                      <SelectContent>{MOVIE_GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl>
                      <SelectContent>{MOVIE_LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl><Input placeholder="https://youtube.com/watch?v=... or Firebase Storage URL" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Banner Image</FormLabel>
              <FormControl><Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={isUploading}/></FormControl>
              <FormMessage />
            </FormItem>

            {bannerPreview && (
              <div className="mt-4">
                <FormLabel>Banner Preview</FormLabel>
                <div className="mt-2 w-full max-w-sm aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image src={bannerPreview} alt="Banner Preview" width={400} height={225} className="object-cover w-full h-full" />
                </div>
              </div>
            )}

            <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
              {form.formState.isSubmitting ? 'Adding...' : 'Add Movie'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
