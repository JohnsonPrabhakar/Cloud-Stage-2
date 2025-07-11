'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { getYoutubeVideoId } from '@/lib/utils';
import { EVENT_CATEGORIES } from '@/lib/events';
import { generateEventDescription } from '@/ai/flows/generate-event-description';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.enum(EVENT_CATEGORIES),
  genre: z.string().min(2, "Genre is required."),
  language: z.string().min(2, "Language is required."),
  streamUrl: z.string().url("Must be a valid YouTube URL.").refine(url => getYoutubeVideoId(url), "Must be a valid YouTube watch/embed URL."),
  date: z.date({ required_error: "A date is required." }),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  ticketPrice: z.coerce.number().min(0, "Ticket price cannot be negative."),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { addEvent } = useEvents();
  const { user } = useAuth();
  const { artists } = useArtists();
  const { toast } = useToast();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentArtist = artists.find(a => a.email === user?.email);
  const isVerified = currentArtist?.isVerified;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      language: 'English',
      streamUrl: '',
      duration: 60,
      ticketPrice: 0,
    },
  });

  const streamUrl = form.watch('streamUrl');

  function handleStreamUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value;
    form.setValue('streamUrl', url, { shouldValidate: true });
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      setBannerUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } else {
      setBannerUrl(null);
    }
  }
  
  const handleGenerateDescription = async () => {
    const url = form.getValues('streamUrl');
    if (!url || !getYoutubeVideoId(url)) {
      toast({
        variant: 'destructive',
        title: 'Invalid YouTube URL',
        description: 'Please provide a valid YouTube URL first.',
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await generateEventDescription({ streamUrl: url });
      if (result.description) {
        form.setValue('description', result.description);
        toast({ title: 'AI Description Generated!', description: 'The description has been updated.' });
      }
    } catch (error) {
      console.error('AI generation failed', error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: 'Could not generate description. Please try again.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  function onSubmit(data: EventFormValues) {
    if (!user || !currentArtist) return;

    if (!isVerified && data.ticketPrice > 0) {
      toast({
        variant: 'destructive',
        title: 'Pricing Restricted',
        description: 'You must be a verified artist to create paid events.',
      });
      return;
    }
    
    const videoId = getYoutubeVideoId(data.streamUrl);
    const newEvent = {
      id: new Date().getTime().toString(),
      ...data,
      date: data.date.toISOString(),
      artist: currentArtist.name,
      artistEmail: user.email,
      status: 'Pending' as const,
      bannerUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
    addEvent(newEvent);
    toast({
        title: "Event Created!",
        description: "Your event has been submitted for approval.",
    });
    router.push('/artist/dashboard');
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Create New Event</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Acoustic Night Live" {...field} />
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
                        <FormLabel className="flex justify-between items-center">
                            <span>Description</span>
                            <Button type="button" size="sm" variant="outline" onClick={handleGenerateDescription} disabled={isAiLoading}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isAiLoading ? 'Generating...' : 'Generate with AI'}
                            </Button>
                        </FormLabel>
                        <FormControl>
                            <Textarea rows={5} placeholder="Tell us more about your event..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {EVENT_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                            <FormControl>
                                <Input placeholder="e.g., Pop, Rock, Comedy" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., English" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date & Time</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                    >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 90" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="ticketPrice"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Ticket Price (USD)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter 0 for a free event" {...field} disabled={!isVerified} />
                            </FormControl>
                            {!isVerified && <FormMessage>Ticket pricing is available for verified artists only.</FormMessage>}
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            
            <div className="md:col-span-1 space-y-4">
                 <FormField
                    control={form.control}
                    name="streamUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>YouTube Stream URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} onChange={handleStreamUrlChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                    <FormLabel>Banner Preview</FormLabel>
                    <div className="mt-2 w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {bannerUrl ? (
                        <Image src={bannerUrl} alt="Banner Preview" width={400} height={225} className="object-cover w-full h-full" />
                    ) : (
                        <p className="text-sm text-muted-foreground">Enter a YouTube URL to see a preview</p>
                    )}
                    </div>
                </div>
            </div>
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
