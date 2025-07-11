'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { getYoutubeVideoId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MOVIE_GENRES, MOVIE_LANGUAGES } from '@/lib/movies';
import { useMovies } from '@/hooks/useMovies';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUp } from 'lucide-react';

const movieFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  language: z.string({ required_error: "Language is required." }),
  genre: z.string({ required_error: "Genre is required." }),
  movieType: z.enum(['youtube', 'upload']),
  videoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
}).refine(data => {
    if (data.movieType === 'youtube') {
        return !!data.videoUrl && !!getYoutubeVideoId(data.videoUrl);
    }
    return true;
}, { message: "A valid YouTube URL is required", path: ["videoUrl"] });

type MovieFormValues = z.infer<typeof movieFormSchema>;

export default function AddMoviePage() {
  const router = useRouter();
  const { addMovie } = useMovies();
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: '',
      description: '',
      movieType: 'youtube',
    },
  });
  
  const movieType = form.watch('movieType');
  const videoUrl = form.watch('videoUrl');

  function handleYoutubeUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    form.setValue('videoUrl', url, { shouldValidate: true });
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      setThumbnailPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } else {
      setThumbnailPreview(null);
    }
  }

  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBannerPreview(result);
        form.setValue('bannerUrl', result);
      };
      reader.readAsDataURL(file);
    }
  }

  function onSubmit(data: MovieFormValues) {
    const videoId = data.videoUrl ? getYoutubeVideoId(data.videoUrl) : null;
    const finalBannerUrl = data.movieType === 'youtube' && videoId 
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : data.bannerUrl || 'https://placehold.co/600x400.png';

    const newMovie = {
      id: new Date().getTime().toString(),
      title: data.title,
      description: data.description,
      language: data.language,
      genre: data.genre,
      videoUrl: data.videoUrl || '',
      bannerUrl: finalBannerUrl,
    };
    addMovie(newMovie);
    toast({
      title: "Movie Added!",
      description: `"${data.title}" has been added to the library.`,
    });
    router.push('/movies');
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Add New Movie</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Movie Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., The Great Adventure" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} placeholder="A short synopsis of the movie..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOVIE_LANGUAGES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a genre" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOVIE_GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="movieType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Movie Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="youtube" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        YouTube / External Link
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="upload" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Upload Video
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {movieType === 'youtube' && (
             <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>YouTube Video URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} onChange={handleYoutubeUrlChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {thumbnailPreview && (
                    <div>
                        <FormLabel>Thumbnail Preview</FormLabel>
                        <div className="mt-2 w-full max-w-sm aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <Image src={thumbnailPreview} alt="Thumbnail Preview" width={400} height={225} className="object-cover w-full h-full" />
                        </div>
                    </div>
                )}
            </div>
          )}

          {movieType === 'upload' && (
            <div className="space-y-8">
                 <div>
                    <FormLabel>Upload Video File</FormLabel>
                    <FormControl>
                        <Input type="file" accept="video/*" className="mt-2" />
                    </FormControl>
                     <FormDescription>
                        (Feature not fully implemented - for demonstration only)
                    </FormDescription>
                </div>
                 <div>
                    <FormLabel>Upload Custom Banner</FormLabel>
                    <div className="mt-2">
                        <label htmlFor="banner-upload" className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-muted">
                            <div className="text-center">
                                <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                            </div>
                        </label>
                        <Input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload}/>
                    </div>
                     {bannerPreview && (
                        <div className="mt-4">
                            <FormLabel>Banner Preview</FormLabel>
                            <div className="mt-2 w-full max-w-sm aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                                <Image src={bannerPreview} alt="Banner Preview" width={400} height={225} className="object-cover w-full h-full" />
                            </div>
                        </div>
                     )}
                </div>
            </div>
          )}


          <Button type="submit" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? 'Adding Movie...' : 'Add Movie'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
