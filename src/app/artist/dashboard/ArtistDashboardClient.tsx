
'use client';

import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Share2, Award, Users, BarChart, ShieldCheck } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { useTickets } from '@/hooks/useTickets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

export default function ArtistDashboardClient() {
  const { events } = useEvents();
  const { user } = useAuth();
  const { artists } = useArtists();
  const { purchasedTickets } = useTickets();

  const currentArtist = artists.find(a => a.email === user?.email);
  const artistEvents = events.filter(e => e.artistEmail === user?.email);

  const liveEvents = artistEvents.filter(e => e.status === 'Live');
  const upcomingEvents = artistEvents.filter(e => e.status === 'Upcoming' || e.status === 'Approved');
  const pastEvents = artistEvents.filter(e => e.status === 'Past');

  const analyticsData = useMemo(() => {
    return artistEvents.map(event => {
        const ticketsForEvent = purchasedTickets.filter(t => t.eventId === event.id);
        const revenue = ticketsForEvent.length * event.ticketPrice;
        return {
            id: event.id,
            title: event.title,
            ticketsSold: ticketsForEvent.length,
            revenue: revenue,
            attendees: ticketsForEvent.length, // Assuming all ticket holders attend for now
        };
    });
  }, [artistEvents, purchasedTickets]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-2">
            Welcome, {currentArtist?.name || 'Artist'}!
            {currentArtist?.isVerified && <ShieldCheck className="w-7 h-7 text-primary" />}
          </h1>
          <p className="text-muted-foreground">Manage your events, profile, and audience on CloudStage.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" asChild>
              <Link href="/artist/profile/edit"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link>
           </Button>
           {!currentArtist?.isVerified &&
            <Button variant="outline" asChild>
                <Link href="/artist/verify"><Award className="mr-2 h-4 w-4" /> Apply for Verified Badge</Link>
            </Button>
           }
          <Button asChild>
            <Link href="/artist/event/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="live">Live Now ({liveEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
            <TabsTrigger value="followers">Followers ({currentArtist?.followers?.length || 0})</TabsTrigger>
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

        <TabsContent value="followers" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Followers</CardTitle>
                </CardHeader>
                <CardContent>
                    {currentArtist?.followers && currentArtist.followers.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentArtist.followers.map((follower, index) => (
                                <Card key={index} className="p-4 flex items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${follower}`} />
                                        <AvatarFallback>{follower.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium">{follower}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center pt-8">You have no followers yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-headline mb-6">My Event Analytics</h2>
        <Card>
            <CardContent className="pt-6">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead className="text-center">Tickets Sold</TableHead>
                            <TableHead className="text-center">Attendees</TableHead>
                            <TableHead className="text-right">Total Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analyticsData.length > 0 ? analyticsData.map(data => (
                            <TableRow key={data.id}>
                                <TableCell>{data.title}</TableCell>
                                <TableCell className="text-center">{formatNumber(data.ticketsSold)}</TableCell>
                                <TableCell className="text-center">{formatNumber(data.attendees)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(data.revenue)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">No event data to display.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
