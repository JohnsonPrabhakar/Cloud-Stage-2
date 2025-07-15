
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

export function EventCard({ event, className, children }: { event: Event; className?: string, children?: React.ReactNode }) {
  const eventDate = new Date(event.date);

  return (
    <div className={cn("w-full flex flex-col h-full overflow-hidden transition-all border p-4 rounded-lg", className)}>
      <Link href={`/events/${event.id}`} className="block group">
        <div className="relative">
          <Image
            src={event.bannerUrl || 'https://placehold.co/600x400.png'}
            alt={event.title}
            width={400}
            height={400}
            className="w-full h-auto aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
            data-ai-hint="event banner"
          />
        </div>
      </Link>
      <div className="pt-4 flex-grow flex flex-col">
        <Link href={`/events/${event.id}`} className="block">
          <h3 className="text-lg font-headline font-semibold hover:text-primary transition-colors truncate">{event.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">by {event.artist}</p>
        </Link>
        
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(eventDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(eventDate, 'p')}</span>
            </div>
        </div>

        <div className="mt-4 flex-grow flex items-end">
           {children ? (
             <div className="w-full">{children}</div>
           ) : (
            <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>Get Tickets</Link>
            </Button>
           )}
        </div>
      </div>
    </div>
  );
}
