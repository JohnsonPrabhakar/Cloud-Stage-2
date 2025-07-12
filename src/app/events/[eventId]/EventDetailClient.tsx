
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTickets } from '@/hooks/useTickets';
import { getYoutubeVideoId } from '@/lib/utils';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mic, Tag, Ticket, ArrowLeft, UserPlus, UserCheck, ThumbsUp, Star, Share2, LogOut, Send, Play, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
import { useArtists } from '@/hooks/useArtists';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStatus } from '@/hooks/useAppStatus';
import { ArtistProfileCard } from '@/components/ArtistProfileCard';

interface ChatMessage {
  id: number;
  name: string;
  message: string;
  timestamp: string;
}

export default function EventDetailClient({ event }: { event: Event | undefined }) {
  const { user } = useAuth();
  const { hasTicket } = useTickets();
  const { artists, followArtist, unfollowArtist } = useArtists();
  const { giveThumbsUp } = useEvents();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isOnline } = useAppStatus();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  if (!event) {
    return (
        <div className="container py-12 text-center">
            <h1 className="text-2xl font-bold">Event not found</h1>
            <p className="text-muted-foreground">The event you are looking for does not exist or has been moved.</p>
            <Button onClick={() => router.push('/events')} className="mt-4">Back to Home</Button>
        </div>
    );
  }
  
  const eventId = event.id;
  const hasPurchasedTicket = hasTicket(eventId, user?.email);
  
  const artist = artists.find(a => a.email === event.artistEmail);
  const isFollowing = !!user && !!artist && artist.followers.includes(user.email);
  const isEventOwner = user?.email === artist?.email;

  const handleFollow = () => {
      if (!user) {
          sessionStorage.setItem('redirectToAfterLogin', pathname);
          router.push('/user-login');
          return;
      }
      if (artist) {
          if (isFollowing) {
              unfollowArtist(artist.id, user.email);
          } else {
              followArtist(artist.id, user.email);
          }
      }
  };

  const handleWatchNow = () => {
      if (!isOnline) {
          toast({ variant: "destructive", title: "App is Offline", description: "The platform is currently offline. Please try again later." });
          return;
      }
      if (!user) {
          sessionStorage.setItem('redirectToAfterLogin', pathname);
          router.push('/user-login');
      } else if (!hasPurchasedTicket && event.ticketPrice > 0) {
          router.push(`/events/${eventId}/purchase`);
      }
      // If user is logged in and has a ticket, the video will be shown.
  };

  const handleThumbsUp = () => {
    if (!hasLiked) {
        giveThumbsUp(event.id);
        setHasLiked(true);
        toast({ title: 'Thanks for the support!' });
    }
  };
  
  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: event.title,
              text: `Check out this event on CloudStage: ${event.title}`,
              url: window.location.href,
          }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied to clipboard!'});
      }
  }
  
  const handleSendChatMessage = () => {
      if (chatInput.trim()) {
          const newMessage: ChatMessage = {
              id: Date.now(),
              name: user?.name || 'Guest',
              message: chatInput,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatMessages(prev => [...prev, newMessage]);
          setChatInput('');
      }
  };

  const videoId = getYoutubeVideoId(event.streamUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  const canWatch = user && (hasPurchasedTicket || event.ticketPrice === 0);
  const eventDate = new Date(event.date);

  return (
    <main className="container py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {user && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive"><LogOut className="mr-2"/>Leave Event</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>Are you sure you want to leave this event?</AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Stay</AlertDialogCancel>
                            <AlertDialogAction onClick={() => router.push('/events')}>Leave</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                        {canWatch && embedUrl && isOnline ? (
                            <div className="aspect-video bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={embedUrl}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="w-full aspect-video relative">
                                <Image
                                    src={event.bannerUrl}
                                    alt={event.title}
                                    layout="fill"
                                    className="object-cover"
                                    data-ai-hint="event hero"
                                />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    {isOnline ? (
                                        <Button size="lg" onClick={handleWatchNow}>
                                            <Play className="mr-2"/> Watch Now
                                        </Button>
                                    ) : (
                                        <div className="text-center text-white p-4 bg-black/50 rounded-lg">
                                            <PowerOff className="mx-auto h-12 w-12 mb-2" />
                                            <h2 className="text-xl font-bold font-headline">App is Currently Offline</h2>
                                            <p className="text-sm text-foreground/80">Please check back later.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <Badge variant="secondary" className="mb-4">{event.category}</Badge>
                                <CardTitle className="text-3xl md:text-4xl font-headline">{event.title}</CardTitle>
                            </div>
                            {!canWatch && isOnline && (
                                <Button onClick={() => router.push(`/events/${event.id}/purchase`)}>
                                    <Ticket className="mr-2"/>
                                    {event.ticketPrice > 0 ? `Buy Ticket - $${event.ticketPrice}` : 'Get Free Ticket'}
                                </Button>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground my-4">
                            <div className="flex items-center gap-2">
                                <Mic className="w-4 h-4"/>
                                {artist ? (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <span className="font-semibold text-primary cursor-pointer hover:underline">{event.artist}</span>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                           <ArtistProfileCard artist={artist} />
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <span>{event.artist}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/><span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4"/><span>{format(eventDate, 'p')}</span></div>
                        </div>

                        <Separator className="my-6" />
                        
                        <div className="prose max-w-none text-foreground/80">
                            <p>{event.description}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <aside className="lg:col-span-1 flex flex-col gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Interaction</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {artist && !isEventOwner && (
                            <Button variant="outline" onClick={handleFollow}>
                                {isFollowing ? <UserCheck className="mr-2" /> : <UserPlus className="mr-2" />}
                                {isFollowing ? 'Following' : `Follow ${artist.artistType === 'Band' ? 'Band' : 'Artist'}`}
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleThumbsUp} disabled={hasLiked}>
                            <ThumbsUp className="mr-2"/> Like ({event.thumbsUp ?? 0})
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><Star className="mr-2"/> Send Stars</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                               <AlertDialogHeader><AlertDialogTitle>Feature Coming Soon!</AlertDialogTitle></AlertDialogHeader>
                               <AlertDialogDescription>Support your favorite artists with stars in a future update!</AlertDialogDescription>
                               <AlertDialogFooter><AlertDialogAction>Got it!</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={handleShare}>
                            <Share2 className="mr-2"/> Share
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="flex-grow flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col gap-4">
                        <ScrollArea className="h-72 w-full pr-4">
                            <div className="space-y-4">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className="flex gap-2 text-sm">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-semibold text-primary">{msg.name}</p>
                                            <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                                        </div>
                                        <p className="text-foreground/80">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                        <div className="mt-auto flex gap-2">
                            <Input 
                                placeholder="Say something..." 
                                value={chatInput} 
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                                disabled={!user || !isOnline}
                            />
                            <Button onClick={handleSendChatMessage} disabled={!user || !isOnline}><Send/></Button>
                        </div>
                        {!user && <p className="text-xs text-muted-foreground text-center">Please <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/user-login')}>log in</Button> to chat.</p>}
                         {!isOnline && <p className="text-xs text-destructive text-center">Chat is disabled while the app is offline.</p>}
                    </CardContent>
                </Card>
            </aside>
        </div>
      </div>
    </main>
  );
}
