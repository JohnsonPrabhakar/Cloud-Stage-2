
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useTickets } from '@/hooks/useTickets';
import { useArtists } from '@/hooks/useArtists';
import { useAppStatus } from '@/hooks/useAppStatus';
import { useToast } from '@/hooks/use-toast';
import type { Event, Artist } from '@/lib/types';
import { getYoutubeVideoId } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Mic, Ticket, Play, ArrowLeft, ThumbsUp, Heart, PowerOff, Share2, UserPlus, Check, LogOut, Send, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArtistProfileCard } from '@/components/ArtistProfileCard';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


interface ChatMessage {
    id: number;
    name: string;
    message: string;
    avatar: string;
}

const initialMessages: ChatMessage[] = [
    { id: 1, name: 'Alex', message: 'This is amazing!', avatar: 'A' },
    { id: 2, name: 'Mia', message: 'So glad I joined!', avatar: 'M' },
    { id: 3, name: 'David', message: 'What a performance!', avatar: 'D' },
];

function LiveChat() {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuth();

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const newMsg: ChatMessage = {
                id: messages.length + 1,
                name: user?.name || 'Guest',
                message: newMessage,
                avatar: user?.name ? user.name.charAt(0).toUpperCase() : 'G',
            };
            setMessages([...messages, newMsg]);
            setNewMessage('');
        }
    };

    return (
        <Card className="flex flex-col h-full w-full max-w-sm">
            <CardHeader>
                <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{msg.name}</p>
                            <p className="text-sm text-muted-foreground bg-secondary p-2 rounded-lg">{msg.message}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                 <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                    <Input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={user ? "Say something..." : "Log in to chat"}
                        disabled={!user}
                    />
                    <Button type="submit" size="icon" disabled={!user || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}


export default function EventDetailClient({ event }: { event: Event | undefined }) {
  const router = useRouter();
  const { user } = useAuth();
  const { giveThumbsUp } = useEvents();
  const { hasTicket } = useTickets();
  const { artists, followArtist, unfollowArtist } = useArtists();
  const { isOnline } = useAppStatus();
  const { toast } = useToast();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReminderSet, setIsReminderSet] = useState(false);

  useEffect(() => {
    if (event && artists.length > 0) {
      const foundArtist = artists.find(a => a.email === event.artistEmail);
      setArtist(foundArtist || null);
    }
  }, [event, artists]);

  useEffect(() => {
    if (user && artist) {
      setIsFollowing(artist.followers.includes(user.email));
    } else {
      setIsFollowing(false);
    }
  }, [user, artist]);

  if (!event) {
    return (
      <main className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="text-muted-foreground">The event you are looking for does not exist or has been moved.</p>
        <Button onClick={() => router.push('/events')} className="mt-4">Back to All Events</Button>
      </main>
    );
  }

  const youtubeVideoId = getYoutubeVideoId(event.streamUrl);
  const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1` : null;
  const eventDate = new Date(event.date);
  const hasPurchasedTicket = hasTicket(event.id, user?.email);
  const isFree = event.ticketPrice === 0;
  const canWatch = hasPurchasedTicket || isFree;
  const isEventOwner = user?.email === event.artistEmail;

  const handleFollowToggle = () => {
    if (!user || !artist) {
      router.push('/user-login');
      return;
    }
    if (isFollowing) {
      unfollowArtist(artist.id, user.email);
      toast({ title: `Unfollowed ${artist.name}` });
    } else {
      followArtist(artist.id, user.email);
      toast({ title: `Successfully followed ${artist.name}!` });
    }
  };

  const handlePurchaseClick = () => {
    if (!isOnline) {
      toast({ variant: "destructive", title: "App is Offline", description: "Ticket purchases are currently disabled." });
      return;
    }
    router.push(`/events/${event.id}/purchase`);
  };

  const handleSetReminder = () => {
      setIsReminderSet(true);
      toast({ title: "Reminder set successfully!", description: `We'll notify you before "${event.title}" starts.` });
  };

  return (
    <>
      <main className="container py-8 md:py-12 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Events
                </Button>

                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                    {canWatch && isOnline && embedUrl ? (
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
                        <div className="w-full aspect-video relative bg-muted">
                        <Image
                            src={event.bannerUrl}
                            alt={event.title}
                            layout="fill"
                            className="object-cover"
                            data-ai-hint="event hero"
                        />
                        {!isOnline && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
                                <PowerOff className="h-12 w-12 text-destructive mb-2" />
                                <h2 className="text-xl font-bold font-headline text-white">App is Currently Offline</h2>
                                <p className="text-sm text-foreground/80">Event streaming is temporarily disabled.</p>
                            </div>
                        )}
                        </div>
                    )}
                    </CardHeader>
                    <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl md:text-4xl font-headline">{event.title}</CardTitle>
                            {artist && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                    <Button variant="link" className="text-lg text-muted-foreground p-0 h-auto hover:text-primary">by {artist.name}</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <ArtistProfileCard artist={artist} />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                         <div className="flex-shrink-0 flex items-center gap-2">
                           {user && !isEventOwner && artist && (
                                <Button onClick={handleFollowToggle} variant={isFollowing ? 'secondary' : 'default'}>
                                    {isFollowing ? <><Check className="mr-2"/> Following</> : <><UserPlus className="mr-2"/>Follow Artist</>}
                                </Button>
                            )}
                            {!user && (
                                <Button onClick={() => router.push('/user-login')}>
                                    <UserPlus className="mr-2"/> Login to Follow
                                </Button>
                            )}
                         </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground my-4 text-sm">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/>{format(eventDate, 'PPP')}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4"/>{format(eventDate, 'p')}</div>
                        <div className="flex items-center gap-2"><Mic className="w-4 h-4"/>{event.category}</div>
                         {isReminderSet && <Badge variant="secondary"><Bell className="mr-1.5 h-3 w-3"/>Reminder is set</Badge>}
                    </div>
                    
                    <Separator className="my-6" />

                    <div className="prose max-w-none text-foreground/80 mb-6">
                        <p>{event.description}</p>
                    </div>

                    <Button onClick={handleSetReminder} variant="outline" disabled={isReminderSet}>
                        <Bell className="mr-2"/> {isReminderSet ? "Reminder Set!" : "Set Reminder"}
                    </Button>

                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => giveThumbsUp(event.id)}>
                                <ThumbsUp className="mr-2" />
                                {event.thumbsUp || 0}
                            </Button>
                             <Button variant="outline" size="icon"><Share2 /></Button>
                            <Button variant="destructive" onClick={() => router.push('/events')}>
                                <LogOut className="mr-2" /> Leave Event
                            </Button>
                        </div>
                        {isOnline ? (
                            !canWatch && (
                            <Button onClick={handlePurchaseClick} size="lg">
                                <Ticket className="mr-2" /> Get Ticket {event.ticketPrice > 0 ? `₹${event.ticketPrice.toFixed(2)}` : ''}
                            </Button>
                            )
                        ) : (
                            <Button disabled variant="outline" size="lg">
                                <PowerOff className="mr-2"/> Ticketing Offline
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
            <aside className="w-full lg:w-96">
                <LiveChat />
            </aside>
        </div>
      </main>
    </>
  );
}
