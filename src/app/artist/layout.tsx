'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, PlusCircle, User, Menu, BarChart2 } from 'lucide-react';

function ArtistHeader() {
    const { logout } = useAuth();
    const [isSheetOpen, setSheetOpen] = useState(false);

    const navLinks = [
        { href: "/artist/dashboard", icon: <Home />, label: "Dashboard" },
        { href: "/artist/event/create", icon: <PlusCircle />, label: "Create Event" },
        { href: "/artist/analytics", icon: <BarChart2 />, label: "Analytics" },
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="md:hidden">
                     <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0">
                            <SheetHeader>
                                <SheetTitle className="sr-only">Artist Menu</SheetTitle>
                            </SheetHeader>
                             <div className="flex flex-col h-full">
                                <Link href="/artist/dashboard" className="flex items-center" onClick={() => setSheetOpen(false)}>
                                    <h2 className="text-2xl font-headline p-4">Artist Panel</h2>
                                </Link>
                                <nav className="flex flex-col gap-4 p-4">
                                    {navLinks.map(link => (
                                        <Button key={link.href} variant="ghost" className="w-full justify-start gap-2" asChild>
                                            <Link href={link.href} onClick={() => setSheetOpen(false)}>
                                                {link.icon}{link.label}
                                            </Link>
                                        </Button>
                                    ))}
                                </nav>
                                <div className="mt-auto p-4">
                                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { logout(); setSheetOpen(false); }}>
                                        <User />Logout
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                 <h1 className="text-xl font-bold font-headline hidden md:block">Artist Panel</h1>
                <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm">
                    {navLinks.map(link => (
                         <Button key={link.href} variant="ghost" asChild>
                            <Link href={link.href}>{link.label}</Link>
                         </Button>
                    ))}
                </nav>
                <div className="hidden md:flex items-center space-x-2 ml-auto">
                    <Button variant="ghost" onClick={logout}><User className="mr-2"/>Logout</Button>
                </div>
            </div>
        </header>
    );
}

export default function ArtistLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'artist') {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'artist') {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
       <ArtistHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
        <div className="container mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
