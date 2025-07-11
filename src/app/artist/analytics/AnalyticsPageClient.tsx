
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { useEvents } from '@/hooks/useEvents';
import { useTickets } from '@/hooks/useTickets';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Ticket, DollarSign, BarChart2 } from 'lucide-react';
import type { Event } from '@/lib/types';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

export default function ArtistAnalyticsPageClient() {
  const { user } = useAuth();
  const { artists } = useArtists();
  const { events } = useEvents();
  const { purchasedTickets } = useTickets();

  const currentArtist = useMemo(() => {
    if (!user) return null;
    return artists.find(a => a.email === user.email);
  }, [user, artists]);
  
  const analyticsData = useMemo(() => {
    if (!currentArtist) return null;

    const artistEvents = events.filter(e => e.artistEmail === currentArtist.email);
    
    const artistTickets = purchasedTickets.filter(ticket => 
        artistEvents.some(event => event.id === ticket.eventId)
    );

    const totalTicketsSold = artistTickets.length;
    
    const totalRevenue = artistEvents.reduce((acc, event) => {
        const ticketsForEvent = artistTickets.filter(t => t.eventId === event.id);
        return acc + (ticketsForEvent.length * event.ticketPrice);
    }, 0);

    const eventPerformance = artistEvents.map(event => {
        const ticketsSold = artistTickets.filter(t => t.eventId === event.id).length;
        return {
            name: event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title,
            ticketsSold,
            revenue: ticketsSold * event.ticketPrice,
        };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalEvents: artistEvents.length,
      totalFollowers: currentArtist.followers.length,
      totalTicketsSold,
      totalRevenue,
      eventPerformance,
    };
  }, [currentArtist, events, purchasedTickets]);

  if (!currentArtist) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Loading artist data...</p>
      </div>
    );
  }
  
  if (!analyticsData) {
     return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Calculating analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-headline">Your Analytics</h1>
        
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.totalFollowers)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.totalTicketsSold)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.totalEvents)}</div>
                </CardContent>
            </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Event Performance</CardTitle>
                    <CardDescription>Tickets sold per event.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={analyticsData.eventPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend />
                            <Bar dataKey="ticketsSold" fill="hsl(var(--primary))" name="Tickets Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Followers</CardTitle>
                    <CardDescription>A list of your followers.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] overflow-y-auto">
                    {currentArtist.followers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentArtist.followers.map((email, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center pt-8">You don't have any followers yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
