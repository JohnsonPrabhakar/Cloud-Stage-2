import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Event, EventCategory } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Music, Mic, Wand2, Leaf, MessageSquare, Wrench, Sparkles, Tag, Ticket, Play } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';

const categoryIcons: Record<EventCategory, React.ElementType> = {
  "Music": Music,
  "Stand-up Comedy": Mic,
  "Workshop": Wrench,
  "Talk": MessageSquare,
  "Meditation/Yoga": Leaf,
  "Magic Show": Wand2,
  "Devotional": Sparkles,
};

const statusColors = {
  Live: 'bg-red-500 text-white',
  Upcoming: 'bg-blue-500 text-white',
  Past: 'bg-gray-500 text-white',
  Pending: 'bg-yellow-500 text-black',
  Approved: 'bg-green-500 text-white',
  Rejected: 'bg-red-700 text-white',
};

export function EventCard({ event, children }: { event: Event; children?: React.ReactNode }) {
  const Icon = categoryIcons[event.category] || Tag;
  const { user } = useAuth();
  const { hasTicket } = useTickets();
  const hasPurchased = hasTicket(event.id, user?.email);

  const isViewable = event.status === 'Live' || event.status === 'Upcoming' || event.status === 'Past' || event.status === 'Approved';


  return (
    <Card className="w-full flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/events/${event.id}`} className="block">
        <CardHeader className="p-0 relative">
          <Image
            src={event.bannerUrl || 'https://placehold.co/600x400.png'}
            alt={event.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="event banner"
          />
          <Badge className={cn("absolute top-2 right-2", statusColors[event.status])}>
            {event.status}
          </Badge>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/events/${event.id}`} className="block">
          <CardTitle className="text-lg font-headline hover:text-primary transition-colors">{event.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">by {event.artist}</p>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mt-4 gap-4">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span>{event.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {children ? children : (
            <>
                {isViewable && (
                    <Button asChild className="w-full">
                        <Link href={`/events/${event.id}`}>
                          { hasPurchased || event.ticketPrice === 0 ? <><Play className="mr-2 h-4 w-4"/>Watch Now</> : <><Ticket className="mr-2 h-4 w-4" />Get Ticket</> }
                        </Link>
                    </Button>
                )}
            </>
        )}
      </CardFooter>
    </Card>
  );
}
