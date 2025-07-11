
import Header from '@/components/layout/Header';
import PurchasePageClient from './PurchasePageClient';

// This is now a Server Component
export default function PurchasePage({ params }: { params: { eventId: string } }) {
  const { eventId } = params;

  return (
    <>
      <Header />
      <PurchasePageClient eventId={eventId} />
    </>
  );
}
