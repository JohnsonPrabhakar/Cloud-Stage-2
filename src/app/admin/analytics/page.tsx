'use client';
import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { EVENT_CATEGORIES } from '@/lib/events';

const COLORS = ['#800020', '#808000', '#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#AF19FF'];

export default function AnalyticsPage() {
  const { events } = useEvents();

  const totalEvents = events.length;
  const approvedEvents = events.filter(e => e.status === 'Approved' || e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Past').length;
  const pendingEvents = events.filter(e => e.status === 'Pending').length;
  const rejectedEvents = events.filter(e => e.status === 'Rejected').length;

  const eventsByCategory = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    for (const category of EVENT_CATEGORIES) {
        categoryCounts[category] = 0;
    }
    events.forEach(event => {
      if (categoryCounts[event.category] !== undefined) {
        categoryCounts[event.category]++;
      }
    });
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a,b) => a.category.localeCompare(b.category));
  }, [events]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline">Event Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Approved Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{approvedEvents}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Pending Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500">{pendingEvents}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Rejected Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{rejectedEvents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={eventsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {eventsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Event List</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] overflow-y-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedEvents.map(event => (
                            <TableRow key={event.id}>
                                <TableCell>{event.title}</TableCell>
                                <TableCell>{event.category}</TableCell>
                                <TableCell>{event.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
