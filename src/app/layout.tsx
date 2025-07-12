
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { TicketProvider } from '@/context/TicketContext';
import { MovieProvider } from '@/context/MovieContext';
import { ArtistProvider } from '@/context/ArtistContext';
import { UserProvider } from '@/context/UserContext';
import { AppStatusProvider } from '@/context/AppStatusContext';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", "gradient-background")}>
        <AppStatusProvider>
          <ArtistProvider>
            <UserProvider>
              <AuthProvider>
                <EventProvider>
                  <MovieProvider>
                      <TicketProvider>
                          {children}
                          <Toaster />
                      </TicketProvider>
                  </MovieProvider>
                </EventProvider>
              </AuthProvider>
            </UserProvider>
          </ArtistProvider>
        </AppStatusProvider>
      </body>
    </html>
  );
}
