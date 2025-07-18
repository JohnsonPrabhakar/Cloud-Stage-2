
'use client';

import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Share2, ShieldCheck } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ArtistDashboardClient() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { artists } = useArtists();

  const currentArtist = artists.find(a => a.email === user?.email);
  const artistEvents = events.filter(e => e.artistEmail === user?.email);

  const liveEvents = artistEvents.filter(e => e.status === 'Live');
  const upcomingEvents = artistEvents.filter(e => e.status === 'Upcoming' || e.status === 'Approved');
  const pastEvents = artistEvents.filter(e => e.status === 'Past');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-2">
            Welcome, {currentArtist?.name || 'Artist'}!
             {currentArtist?.isVerified && <Badge className="bg-green-500 text-white"><ShieldCheck className="w-4 h-4 mr-1"/>Verified</Badge>}
          </h1>
          <p className="text-muted-foreground">Manage your events, profile, and audience on CloudStage.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" asChild>
              <Link href="/artist/profile/edit"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link>
           </Button>
          <Button asChild>
            <Link href="/artist/event/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>
      </div>

      {!currentArtist?.isVerified && (
        <Card className="mb-8 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck/> Get Verified!</CardTitle>
            <CardDescription>
              Apply for verification to unlock features like paid events and build more trust with your audience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/artist/verify">Start Verification Process</Link>
            </Button>
          </CardContent>
        </Card>
      )}


      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="live">Live Now ({liveEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
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
