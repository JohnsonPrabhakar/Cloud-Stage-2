
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTickets } from '@/hooks/useTickets';
import { getYoutubeVideoId } from '@/lib/utils';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mic, Tag, Ticket, PlayCircle, ArrowLeft, Hourglass, UserPlus, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useArtists } from '@/hooks/useArtists';
import { useAuth } from '@/hooks/useAuth';

export default function EventDetailClient({ event }: { event: Event | undefined }) {
  const { hasTicket } = useTickets();
  const { artists, followArtist, unfollowArtist } = useArtists();
  const { user } = useAuth();
  const router = useRouter();

  if (!event) {
    return (
        <div className="container py-12 text-center">
            <h1 className="text-2xl font-bold">Event not found</h1>
            <p className="text-muted-foreground">The event you are looking for does not exist or has been moved.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Back to Home</Button>
        </div>
    );
  }
  
  const eventId = event.id;
  const hasPurchasedTicket = hasTicket(eventId);
  
  const artist = artists.find(a => a.email === event.artistEmail);
  const isFollowing = user && artist?.followers?.includes(user.email);

  const handleFollow = () => {
      if (user && artist) {
          if (isFollowing) {
              unfollowArtist(artist.id, user.email);
          } else {
              followArtist(artist.id, user.email);
          }
      } else if (!user) {
          router.push('/login');
      }
  };

  const videoId = getYoutubeVideoId(event.streamUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  const canWatch = hasPurchasedTicket || event.ticketPrice === 0;
  const eventDate = new Date(event.date);

  return (
    <main className="container py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
        <Card className="overflow-hidden">
          <CardHeader className="p-0">
             {!canWatch && (
              <Image
                src={event.bannerUrl}
                alt={event.title}
                width={1250}
                height={700}
                className="w-full aspect-video object-cover"
                data-ai-hint="event hero"
              />
            )}
             {canWatch && embedUrl && (
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
              )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <Badge variant="secondary" className="mb-4">{event.category}</Badge>
                <CardTitle className="text-3xl md:text-4xl font-headline">{event.title}</CardTitle>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                 {artist && user && user.email !== artist.email && (
                    <Button variant="outline" onClick={handleFollow}>
                        {isFollowing ? <UserCheck className="mr-2" /> : <UserPlus className="mr-2" />}
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                 )}
                {!canWatch && (
                  <Button onClick={() => router.push(`/events/${event.id}/purchase`)}>
                    <Ticket className="mr-2"/>
                    {event.ticketPrice > 0 ? `Buy Ticket - $${event.ticketPrice}` : 'Get Free Ticket'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground my-4">
                <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4"/>
                    <span>{event.artist}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4"/>
                    <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4"/>
                    <span>{format(eventDate, 'p')}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4"/>
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
            
            {canWatch && !embedUrl && (
              <div className="mt-8 p-4 bg-destructive/10 rounded-lg text-destructive">
                <p>Stream URL is not a valid YouTube link.</p>
                 <p className="text-sm text-muted-foreground mt-2 font-code">
                    Stream URL: <a href={event.streamUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{event.streamUrl}</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
