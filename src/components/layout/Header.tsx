'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Ticket } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';

export default function Header() {
  const { user, logout } = useAuth();
  const { purchasedTickets } = useTickets();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/movies', label: 'Movies' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">CloudStage</span>
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                {link.label}
              </Link>
            ))}
             {purchasedTickets.length > 0 && (
                 <Link href="/my-tickets" className="text-foreground/60 transition-colors hover:text-foreground/80">
                    My Tickets
                </Link>
             )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="hidden md:flex items-center space-x-2">
                {user ? (
                    <>
                    <Button variant="ghost" asChild>
                        <Link href={user.role === 'admin' ? '/admin' : '/artist/dashboard'}>Dashboard</Link>
                    </Button>
                    <Button onClick={logout}>Logout</Button>
                    </>
                ) : (
                  <>
                    <Button asChild>
                        <Link href="/login">Artist Login</Link>
                    </Button>
                  </>
                )}
            </div>
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                    <div className="flex flex-col gap-4 p-4">
                        <Link href="/" className="mr-6 flex items-center space-x-2">
                            <Ticket className="h-6 w-6 text-primary" />
                            <span className="font-bold font-headline">CloudStage</span>
                        </Link>
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="text-lg">
                                {link.label}
                            </Link>
                        ))}
                        {purchasedTickets.length > 0 && (
                            <Link href="/my-tickets" className="text-lg">My Tickets</Link>
                        )}
                        <hr/>
                        {user ? (
                        <>
                            <Link href={user.role === 'admin' ? '/admin' : '/artist/dashboard'} className="text-lg">Dashboard</Link>
                            <Button onClick={logout}>Logout</Button>
                        </>
                        ) : (
                          <>
                            <Button asChild><Link href="/login">Artist Login</Link></Button>
                          </>
                        )}
                    </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
