'use client';
import { useMemo, useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DUMMY_ANALYTICS_DATA, MONTHS } from '@/lib/analytics-data';
import type { AnalyticsData } from '@/lib/analytics-data';
import { useArtists } from '@/hooks/useArtists';

const COLORS = ['#800020', '#808000', '#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#AF19FF'];

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

export default function AnalyticsPage() {
  const { events } = useEvents();
  const { artists } = useArtists();

  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState('All');
  
  const filteredData: AnalyticsData = useMemo(() => {
    let data = DUMMY_ANALYTICS_DATA;

    if (selectedMonth !== 'All') {
        const monthIndex = MONTHS.findIndex(m => m === selectedMonth);
        data = {
            ...data,
            monthlyRevenue: [data.monthlyRevenue[monthIndex]],
            ticketsSoldByMonth: [data.ticketsSoldByMonth[monthIndex]],
            topGrossingEvents: data.topGrossingEvents.filter(e => new Date(e.date).getMonth() === monthIndex),
            ticketsByEvent: data.ticketsByEvent.filter(e => new Date(e.date).getMonth() === monthIndex),
        };
    }

    if (selectedArtist !== 'All') {
        data = {
            ...data,
            topGrossingEvents: data.topGrossingEvents.filter(e => e.artistName === selectedArtist),
            ticketsByEvent: data.ticketsByEvent.filter(e => e.artistName === selectedArtist),
            // Note: artist-wise charts are filtered differently or not at all depending on viz
        };
    }
    
    return data;
  }, [selectedMonth, selectedArtist]);

  const totalRevenue = useMemo(() => filteredData.topGrossingEvents.reduce((acc, event) => acc + event.revenue, 0), [filteredData]);
  const totalTicketsSold = useMemo(() => filteredData.ticketsByEvent.reduce((acc, event) => acc + event.ticketsSold, 0), [filteredData]);
  
  const artistNames = useMemo(() => ['All', ...Array.from(new Set(artists.map(a => a.name)))], [artists]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-headline">Event & Revenue Analytics</h1>
        <div className="flex gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Month" /></SelectTrigger>
            <SelectContent>
              {['All', ...MONTHS].map(m => <SelectItem key={m} value={m}>{m === 'All' ? 'All Months' : m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedArtist} onValueChange={setSelectedArtist}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Artist" /></SelectTrigger>
            <SelectContent>
              {artistNames.map(name => <SelectItem key={name} value={name}>{name === 'All' ? 'All Artists' : name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Existing Analytics */}
      <Card>
        <CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader><CardTitle>Total Events</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-bold">{events.length}</div></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-bold text-green-500">{events.filter(e => e.status === 'Approved').length}</div></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-bold text-yellow-500">{events.filter(e => e.status === 'Pending').length}</div></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Rejected</CardTitle></CardHeader>
                <CardContent><div className="text-4xl font-bold text-red-600">{events.filter(e => e.status === 'Rejected').length}</div></CardContent>
            </Card>
        </CardContent>
      </Card>

       {/* Revenue Insights */}
      <Card>
        <CardHeader><CardTitle>Revenue Insights</CardTitle></CardHeader>
        <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Top Grossing Events</CardTitle></CardHeader>
                    <CardContent className="h-[150px] overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Event</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredData.topGrossingEvents.slice(0, 5).map(e => <TableRow key={e.id}><TableCell>{e.title}</TableCell><TableCell className="text-right">{formatCurrency(e.revenue)}</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                 <Card>
                    <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={filteredData.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                                <Tooltip formatter={(val) => formatCurrency(val as number)} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#800020" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                             <PieChart>
                                <Pie data={DUMMY_ANALYTICS_DATA.revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {DUMMY_ANALYTICS_DATA.revenueByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <Tooltip formatter={(val) => formatCurrency(val as number)}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>
      
       {/* Ticket Sales Analytics */}
      <Card>
        <CardHeader><CardTitle>Ticket Sales Analytics</CardTitle></CardHeader>
        <CardContent className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Total Tickets Sold</CardTitle></CardHeader>
                    <CardContent><p className="text-4xl font-bold">{formatNumber(totalTicketsSold)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Artist-wise Ticket Sales</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={DUMMY_ANALYTICS_DATA.artistTicketSales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="artistName" />
                                <YAxis />
                                <Tooltip formatter={(val) => formatNumber(val as number)} />
                                <Legend />
                                <Bar dataKey="ticketsSold" fill="#808000" name="Tickets Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Tickets Sold by Event</CardTitle>
                    <CardDescription>A detailed breakdown of ticket sales and revenue per event.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event Title</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Tickets Sold</TableHead>
                                <TableHead>Price/Ticket</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.ticketsByEvent.map(e => (
                                <TableRow key={e.id}>
                                    <TableCell>{e.title}</TableCell>
                                    <TableCell>{e.artistName}</TableCell>
                                    <TableCell>{formatNumber(e.ticketsSold)}</TableCell>
                                    <TableCell>{formatCurrency(e.pricePerTicket)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(e.revenue)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </CardContent>
      </Card>

    </div>
  );
}
