
'use client';

import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

export default function ArtistAnalyticsPageClient() {
    const { events } = useEvents();
    const { user } = useAuth();
    const { artists } = useArtists();
    const { purchasedTickets } = useTickets();

    const currentArtist = useMemo(() => artists.find(a => a.email === user?.email), [artists, user?.email]);
    
    const artistEvents = useMemo(() => {
        if (!user?.email) return [];
        return events.filter(e => e.artistEmail === user.email);
    }, [events, user?.email]);

    const analyticsData = useMemo(() => {
        return artistEvents.map(event => {
            const ticketsForEvent = purchasedTickets.filter(t => t.eventId === event.id);
            const revenue = ticketsForEvent.length * event.ticketPrice;
            return {
                id: event.id,
                title: event.title,
                ticketsSold: ticketsForEvent.length,
                revenue: revenue,
                attendees: ticketsForEvent.length,
            };
        });
    }, [artistEvents, purchasedTickets]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline mb-6">My Analytics</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Follower Insights</CardTitle>
                    <CardDescription>An overview of your audience.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center justify-center bg-muted p-6 rounded-lg">
                        <p className="text-lg text-muted-foreground">Total Followers</p>
                        <p className="text-6xl font-bold">{currentArtist?.followers.length ?? 0}</p>
                    </div>
                    <div className="md:col-span-2">
                         <h3 className="font-semibold mb-2 text-muted-foreground">Followers List</h3>
                         <div className="h-48 overflow-y-auto border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentArtist?.followers && currentArtist.followers.length > 0 ? (
                                        currentArtist.followers.map((followerEmail, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{followerEmail}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={1} className="text-center text-muted-foreground h-24">
                                                No followers yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Event Performance</CardTitle>
                    <CardDescription>A breakdown of your event sales and revenue.</CardDescription>
                </CardHeader>
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
                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No event data to display.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
