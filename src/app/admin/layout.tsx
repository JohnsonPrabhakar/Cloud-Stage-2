
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, BarChart2, User, Film, Users, Menu, ShieldCheck, Power, PowerOff } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStatus } from '@/hooks/useAppStatus';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { VerificationRequest } from '@/lib/types';


function AdminHeader() {
    const { logout } = useAuth();
    const [isSheetOpen, setSheetOpen] = useState(false);
    const { artists, verificationRequests, setVerificationRequests } = useArtists();
    const { isOnline, toggleAppStatus, isLoading: isStatusLoading } = useAppStatus();
    
    useEffect(() => {
        const q = query(collection(db, "verificationRequests"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerificationRequest));
            setVerificationRequests(requests);
        });
        return () => unsubscribe();
    }, [setVerificationRequests]);

    const pendingArtistCount = artists.filter(a => a.status === 'Pending').length;
    const pendingVerificationCount = verificationRequests.filter(r => r.status === 'Pending').length;

    const navLinks = [
        { href: "/admin", icon: <LayoutDashboard />, label: "Events", count: 0 },
        { href: "/admin/artist-registrations", icon: <Users />, label: "Artist Registrations", count: pendingArtistCount },
        { href: "/admin/verification-requests", icon: <ShieldCheck />, label: "Verification Requests", count: pendingVerificationCount },
        { href: "/admin/add-movie", icon: <Film />, label: "Add Movie", count: 0 },
        { href: "/admin/analytics", icon: <BarChart2 />, label: "Analytics", count: 0 },
    ];

    const renderNavLink = (link: { href: string; icon: React.ReactNode; label: string; count: number; }, isSheet: boolean = false) => (
        <Button key={link.href} variant="ghost" className={cn("w-full justify-start gap-2", isSheet && "text-base")} asChild>
            <Link href={link.href} onClick={() => setSheetOpen(false)}>
                {link.icon}
                <span className="flex-1">{link.label}</span>
                {link.count > 0 && <Badge variant="destructive">{link.count}</Badge>}
            </Link>
        </Button>
    );
    
    const AppStatusToggle = () => (
      <div className="flex items-center space-x-2">
        <Switch
            id="app-status"
            checked={isOnline}
            onCheckedChange={toggleAppStatus}
            disabled={isStatusLoading}
            aria-label="Toggle application online status"
        />
        <Label htmlFor="app-status" className="flex items-center gap-2 font-medium">
            {isOnline ? <Power className="text-green-500" /> : <PowerOff className="text-red-500" />}
            {isOnline ? 'Online' : 'Offline'}
        </Label>
      </div>
    );


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
                                <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                            </SheetHeader>
                             <div className="flex flex-col h-full">
                                <Link href="/admin" className="flex items-center" onClick={() => setSheetOpen(false)}>
                                    <h2 className="text-2xl font-headline p-4">Admin Panel</h2>
                                </Link>
                                <nav className="flex flex-col gap-2 p-4">
                                    {navLinks.map(link => renderNavLink(link, true))}
                                </nav>
                                <div className="mt-auto p-4 space-y-4">
                                    <AppStatusToggle />
                                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { logout(); setSheetOpen(false); }}>
                                        <User />Logout
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                 <h1 className="text-xl font-bold font-headline hidden md:block">Admin Panel</h1>
                <nav className="hidden md:flex flex-1 items-center justify-center gap-2 text-sm">
                    {navLinks.map(link => (
                         <Button key={link.href} variant="ghost" asChild>
                            <Link href={link.href} className="flex items-center gap-2">
                                {link.label}
                                {link.count > 0 && <Badge variant="destructive">{link.count}</Badge>}
                            </Link>
                         </Button>
                    ))}
                </nav>
                <div className="hidden md:flex items-center space-x-4 ml-auto">
                    <AppStatusToggle />
                    <Button variant="ghost" onClick={logout}><User className="mr-2"/>Logout</Button>
                </div>
            </div>
        </header>
    );
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
        <div className="container mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
