'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';

function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className="h-8 w-8 text-primary"
      fill="currentColor"
    >
      <path
        d="M83.8,62.8c-0.2-13.3-10.4-24.1-23.3-25.1c-2-8.3-9-14.7-17.7-14.7c-9.2,0-16.9,6.7-18.1,15.7C15.4,40.1,7.2,49,7.2,59.6c0,11.2,9.1,20.3,20.3,20.3h36.1C75,79.9,84,72.4,83.8,62.8z"
        style={{ color: 'hsl(var(--primary))' }}
      />
      <g style={{ color: 'hsl(var(--primary-foreground))' }}>
        <path
          d="M51,68.9c-4.4,0-8-3.6-8-8V47.3c0-4.4,3.6-8,8-8s8,3.6,8,8v13.6C59,65.3,55.4,68.9,51,68.9z"
        />
        <path
          d="M48,49h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M48,55h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M48,61h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M51,68.9v5.8c0,2.6-2.1,4.7-4.7,4.7h-0.6c-2.6,0-4.7-2.1-4.7-4.7v-5.8"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <rect x="44" y="79" width="14" height="4" rx="2" />
      </g>
    </svg>
  );
}

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
            <Logo />
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
                            <Logo />
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
