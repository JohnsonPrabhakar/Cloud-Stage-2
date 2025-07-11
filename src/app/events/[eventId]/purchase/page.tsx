'use client';

import Header from '@/components/layout/Header';
import PurchasePageClient from './PurchasePageClient';

export default function PurchasePage({ params }: { params: { eventId: string } }) {
  return (
    <>
      <Header />
      <PurchasePageClient eventId={params.eventId} />
    </>
  );
}
