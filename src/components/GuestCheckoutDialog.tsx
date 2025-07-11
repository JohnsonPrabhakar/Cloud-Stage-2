
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTickets } from '@/hooks/useTickets';
import { useToast } from '@/hooks/use-toast';
import type { Event, GuestDetails } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const checkoutFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface GuestCheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export function GuestCheckoutDialog({ isOpen, onOpenChange, event }: GuestCheckoutDialogProps) {
  const router = useRouter();
  const { purchaseTicket } = useTickets();
  const { toast } = useToast();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  function onSubmit(data: CheckoutFormValues) {
    if (event.ticketPrice > 0) {
      // For paid tickets, store details and redirect to mock payment
      sessionStorage.setItem('guestDetails', JSON.stringify(data));
      sessionStorage.setItem('eventIdToPurchase', event.id);
      router.push('/payment-mock');
    } else {
      // For free tickets, confirm immediately
      purchaseTicket(event.id, data.email, data);
      toast({
        title: "🎫 Ticket Confirmed!",
        description: `Your free ticket for "${event.title}" has been secured.`,
      });
      onOpenChange(false); // Close dialog
      router.push(`/events/${event.id}`); // Navigate to event page to watch
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Guest Checkout</DialogTitle>
          <DialogDescription>
            Enter your details to get your ticket for "{event.title}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="e.g., jane.doe@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="e.g., (123) 456-7890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Processing...' :
               event.ticketPrice > 0 ? 'Continue to Payment' : 'Confirm Free Ticket'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
