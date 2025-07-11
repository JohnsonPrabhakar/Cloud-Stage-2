'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format, parse } from 'date-fns';
import { cn, getYoutubeVideoId } from '@/lib/utils';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { EVENT_CATEGORIES } from '@/lib/events';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { generateEventDescription } from '@/ai/flows/generate-event-description';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles } from 'lucide-react';

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.enum(EVENT_CATEGORIES, { required_error: "Category is required." }),
  genre: z.string().optional(),
  language: z.string().optional(),
  date: z.date({ required_error: "Event date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM).").optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  ticketPrice: z.coerce.number().min(0, "Ticket price cannot be negative."),
  streamUrl: z.string().url("A valid YouTube URL is required.").refine(getYoutubeVideoId, "Must be a valid YouTube URL."),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventForm({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const { events, addEvent, updateEvent } = useEvents();
  const { toast } = useToast();
  const { user } = useAuth();
  const { artists } = useArtists();

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const isEditMode = !!eventId;
  const eventToUpdate = isEditMode ? events.find(e => e.id === eventId) : undefined;
  const currentArtist = artists.find(a => a.email === user?.email);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '' as any, // Initialize to prevent uncontrolled -> controlled warning
      genre: 'Various',
      language: 'English',
      time: '', // Initialize to prevent uncontrolled -> controlled warning
      duration: 90,
      ticketPrice: 0,
      streamUrl: '',
    },
  });

  useEffect(() => {
    if (isEditMode && eventToUpdate) {
      const eventDate = new Date(eventToUpdate.date);
      form.reset({
        ...eventToUpdate,
        date: eventDate,
        time: format(eventDate, 'HH:mm'),
      });
      const videoId = getYoutubeVideoId(eventToUpdate.streamUrl);
      if (videoId) {
        setThumbnailPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      }
    }
  }, [isEditMode, eventToUpdate, form]);

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('streamUrl', url, { shouldValidate: true });
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      setThumbnailPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleGenerateDescription = async () => {
    const streamUrl = form.getValues('streamUrl');
    if (!streamUrl || !getYoutubeVideoId(streamUrl)) {
      form.setError('streamUrl', { type: 'manual', message: 'A valid YouTube URL is required to generate a description.' });
      return;
    }
    setIsAiLoading(true);
    try {
      const { description } = await generateEventDescription({ streamUrl });
      form.setValue('description', description);
    } catch (error) {
      console.error('AI Description Error:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate description." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit: SubmitHandler<EventFormValues> = (data) => {
    const [hours, minutes] = data.time ? data.time.split(':').map(Number) : [0,0];
    const combinedDateTime = new Date(data.date);
    combinedDateTime.setHours(hours, minutes);
    
    const videoId = getYoutubeVideoId(data.streamUrl);
    const bannerUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://placehold.co/600x400';

    if (isEditMode && eventToUpdate) {
      const updatedEvent = {
        ...eventToUpdate,
        ...data,
        date: combinedDateTime.toISOString(),
        bannerUrl,
        status: 'Pending' as const, // Reset status for re-approval
      };
      updateEvent(updatedEvent);
      toast({ title: "Event Updated!", description: `"${data.title}" has been submitted for re-approval.` });
    } else {
      const newEvent = {
        id: new Date().getTime().toString(),
        ...data,
        date: combinedDateTime.toISOString(),
        artist: currentArtist?.name || 'Unknown Artist',
        artistEmail: user?.email || '',
        bannerUrl,
        status: 'Pending' as const,
        isBoosted: false,
      };
      addEvent(newEvent);
      toast({ title: "Event Created!", description: `"${data.title}" has been submitted for approval.` });
    }
    router.push('/artist/dashboard');
  };

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Live Acoustic Set" {...field} />
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
                <div className="flex justify-between items-center">
                    <FormLabel>Description</FormLabel>
                     <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isAiLoading}>
                        {isAiLoading ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" />Generate with AI</>}
                    </Button>
                </div>
                <FormControl>
                  <Textarea rows={5} placeholder="Tell us about your event..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl><Input placeholder="e.g., Pop, Rock" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="e.g., English" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-1 gap-8">
                 <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 90" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="ticketPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Price (USD)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        placeholder="e.g., 10" 
                        {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="streamUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Stream URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} onChange={handleYoutubeUrlChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {thumbnailPreview && (
              <div className="mt-4">
                <FormLabel>Banner Preview</FormLabel>
                <div className="mt-2 w-full max-w-sm aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image src={thumbnailPreview} alt="Thumbnail Preview" width={400} height={225} className="object-cover w-full h-full" />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Event' : 'Create Event')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
