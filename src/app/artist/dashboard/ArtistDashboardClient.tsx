
'use client';

import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Share2, Award } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ArtistDashboardClient() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { artists } = useArtists();

  const currentArtist = artists.find(a => a.email === user?.email);
  const artistEvents = events.filter(e => e.artistEmail === user?.email);

  const now = new Date();
  const liveEvents = artistEvents.filter(e => e.status === 'Live');
  const upcomingEvents = artistEvents.filter(e => e.status === 'Upcoming' || e.status === 'Approved');
  const pastEvents = artistEvents.filter(e => e.status === 'Past');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-2">
            Welcome, {currentArtist?.name || 'Artist'}! 👋
            {currentArtist?.isVerified && <Award className="h-6 w-6 text-primary" title="Verified Artist" />}
          </h1>
          <p className="text-muted-foreground">Manage your events and grow your audience on CloudStage.</p>
        </div>
        <div className="flex items-center gap-4">
          {!currentArtist?.isVerified && !currentArtist?.verificationRequest && (
            <Button asChild variant="outline">
              <Link href="/artist/verify">
                <Award className="mr-2 h-4 w-4" /> Apply for Verified Badge
              </Link>
            </Button>
          )}
           {currentArtist?.verificationRequest?.status === 'Pending' && (
              <Badge variant="secondary">Verification Pending</Badge>
           )}
          <Button asChild>
            <Link href="/artist/event/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live">Live Now ({liveEvents.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
            {liveEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <p className="text-muted-foreground text-center pt-8">You have no live events.</p>
            )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
            {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event}>
                        <div className="flex justify-between items-center w-full">
                        {event.isBoosted && <Badge variant="outline" className="text-accent border-accent">Boosted</Badge>}
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" size="icon" asChild>
                                <Link href={`/artist/event/${event.id}`}>
                                    <Edit className="h-4 w-4"/>
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon"><Share2 className="h-4 w-4"/></Button>
                        </div>
                        </div>
                    </EventCard>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center pt-8">You have no upcoming events.</p>
            )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
            {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <p className="text-muted-foreground text-center pt-8">You have no past events.</p>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
