'use client';

import Header from '@/components/layout/Header';
import PurchasePageClient from './PurchasePageClient';

export default function PurchasePage({ params }: { params: { eventId: string } }) {
  const eventId = params.eventId;

  return (
    <>
      <Header />
      <PurchasePageClient eventId={eventId} />
    </>
  );
}
