
'use client';

import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

export default function ArtistAnalyticsPageClient() {
    const { events } = useEvents();
    const { user } = useAuth();
    const { purchasedTickets } = useTickets();

    const artistEvents = events.filter(e => e.artistEmail === user?.email);

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
        <div>
            <h1 className="text-3xl font-headline mb-6">My Event Analytics</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
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
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No event data to display.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
