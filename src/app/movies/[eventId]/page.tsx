'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useEvents } from '@/hooks/useEvents';
import { getYoutubeVideoId } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mic, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/layout/Header';

export default function EventDetailPage() {
  const { events } = useEvents();
  const params = useParams();
  const eventId = params.eventId as string;

  const event = events.find(e => e.id === eventId);

  if (!event) {
    return (
        <>
            <Header />
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Event not found</h1>
            </div>
        </>
    );
  }

  const videoId = getYoutubeVideoId(event.streamUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <>
    <Header/>
    <main className="container py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
            <Image
              src={event.bannerUrl}
              alt={event.title}
              width={1250}
              height={700}
              className="w-full aspect-video object-cover"
              data-ai-hint="event hero"
            />
          </CardHeader>
          <CardContent className="p-6">
            <Badge variant="secondary" className="mb-4">{event.category}</Badge>
            <CardTitle className="text-3xl md:text-4xl font-headline">{event.title}</CardTitle>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground my-4">
                <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4"/>
                    <span>{event.artist}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4"/>
                    <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4"/>
                    <span>{event.duration} minutes</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4"/>
                    <span>{event.ticketPrice > 0 ? `$${event.ticketPrice}` : 'Free'}</span>
                </div>
            </div>

            <div className="prose max-w-none text-foreground/80 mt-6">
              <p>{event.description}</p>
            </div>
            
            <div className="mt-8">
              <h3 className="text-2xl font-headline mb-4">Watch The Event</h3>
              {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <p className="text-muted-foreground">Stream URL is not a valid YouTube link.</p>
              )}
               <p className="text-sm text-muted-foreground mt-2 font-code">
                Stream URL: <a href={event.streamUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{event.streamUrl}</a>
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    </>
  );
}
