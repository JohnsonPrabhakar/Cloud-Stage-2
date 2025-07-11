



'use client';

import { useState, useEffect } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
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
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in HH:mm format."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  ticketPrice: z.coerce.number().min(0, "Ticket price cannot be negative."),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventForm({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const { events, addEvent, updateEvent } = useEvents();
  const { user } = useAuth();
  const { artists } = useArtists();
  const { toast } = useToast();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isEditMode = !!eventId;
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
      time: '19:00',
      duration: 60,
      ticketPrice: 0,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const eventToEdit = events.find(e => e.id === eventId);
      if (eventToEdit) {
        const eventDate = new Date(eventToEdit.date);
        form.reset({
          ...eventToEdit,
          date: eventDate,
          time: format(eventDate, "HH:mm"),
        });
        const videoId = getYoutubeVideoId(eventToEdit.streamUrl);
        if (videoId) {
          setBannerUrl(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        }
      }
    }
    setIsLoading(false);
  }, [eventId, isEditMode, events, form]);

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
    
    const [hours, minutes] = data.time.split(':').map(Number);
    const combinedDateTime = new Date(data.date);
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);

    const videoId = getYoutubeVideoId(data.streamUrl);
    
    if (isEditMode && eventId) {
        const eventToUpdate = events.find(e => e.id === eventId);
        if (eventToUpdate) {
            const updatedEvent = {
                ...eventToUpdate, // Keep original fields like artist, email, isBoosted
                ...data, // Overwrite with new form data
                id: eventId, // Ensure ID is correct
                date: combinedDateTime.toISOString(),
                status: 'Pending' as const, // Always reset status on edit for re-approval
                bannerUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            };
            updateEvent(updatedEvent);
            toast({
                title: "Event Updated!",
                description: "Your event has been resubmitted for approval.",
            });
        }
    } else {
        const newEvent = {
            id: new Date().getTime().toString(),
            ...data,
            date: combinedDateTime.toISOString(),
            artist: currentArtist.name,
            artistEmail: user.email,
            status: 'Pending' as const,
            bannerUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            isBoosted: false
        };
        addEvent(newEvent);
        toast({
            title: "Event Created!",
            description: "Your event has been submitted for approval.",
        });
    }
    
    router.push('/artist/dashboard');
  }
  
  if (isLoading) {
      return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
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
                </div>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <div className="flex gap-2">
                             <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                            <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                    </FormItem>
                     <FormField
                        control={form.control}
                        name="ticketPrice"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Ticket Price (USD)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter 0 for a free event" {...field} disabled={!isVerified} />
                            </FormControl>
                             <FormDescription className={!isVerified ? '' : 'hidden'}>
                                Ticket pricing is available for verified artists only.
                             </FormDescription>
                             <FormMessage/>
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
             {form.formState.isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Event' : 'Submit for Approval')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
