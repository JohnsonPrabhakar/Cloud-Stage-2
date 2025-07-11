'use client';

import Header from '@/components/layout/Header';
import PurchasePageClient from './PurchasePageClient';
import { useEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PurchasePage({ params }: { params: { eventId: string } }) {
  const { events } = useEvents();
  const router = useRouter();
  const event = events.find(e => e.id === params.eventId);

  if (!event) {
    return (
      <>
        <Header />
        <main className="container py-8 md:py-12 px-4 md:px-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Event Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The event you are looking for does not exist or has been moved.</p>
              <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <PurchasePageClient event={event} />
    </>
  );
}
