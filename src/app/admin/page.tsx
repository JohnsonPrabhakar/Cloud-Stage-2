'use client';

import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { events, updateEventStatus } = useEvents();
  const { toast } = useToast();

  const pendingEvents = events.filter(e => e.status === 'Pending');
  const approvedEvents = events.filter(e => e.status === 'Approved' || e.status === 'Live' || e.status === 'Upcoming' || e.status === 'Past');
  const rejectedEvents = events.filter(e => e.status === 'Rejected');

  const handleApprove = (eventId: string) => {
    updateEventStatus(eventId, 'Approved');
    toast({ title: 'Event Approved!' });
  };

  const handleReject = (eventId: string) => {
    updateEventStatus(eventId, 'Rejected');
     toast({ title: 'Event Rejected' });
  };

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Event Management</h1>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Approval ({pendingEvents.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedEvents.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {pendingEvents.length > 0 ? pendingEvents.map(event => (
              <EventCard key={event.id} event={event}>
                <div className="flex gap-2 w-full">
                  <Button className="flex-1" onClick={() => handleApprove(event.id)}>Approve</Button>
                  <Button className="flex-1" variant="destructive" onClick={() => handleReject(event.id)}>Reject</Button>
                </div>
              </EventCard>
            )) : <p className="col-span-full text-center text-muted-foreground mt-8">No pending events.</p>}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {approvedEvents.length > 0 ? approvedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            )) : <p className="col-span-full text-center text-muted-foreground mt-8">No approved events.</p>}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {rejectedEvents.length > 0 ? rejectedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            )) : <p className="col-span-full text-center text-muted-foreground mt-8">No rejected events.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
