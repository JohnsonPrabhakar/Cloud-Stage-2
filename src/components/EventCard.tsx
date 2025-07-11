import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Event, EventCategory } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Music, Mic, Wand2, Leaf, MessageSquare, Wrench, Sparkles, Tag } from 'lucide-react';

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

  return (
    <Card className="w-full flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/movies/${event.id}`} className="block">
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
        <Link href={`/movies/${event.id}`} className="block">
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
      {children && (
        <CardFooter className="p-4 pt-0">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
