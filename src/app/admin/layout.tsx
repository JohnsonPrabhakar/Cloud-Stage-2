'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BarChart2, User } from 'lucide-react';

function AdminNav() {
    const { logout } = useAuth();
    return (
        <nav className="flex flex-col h-full bg-muted/40 p-4">
            <h2 className="text-2xl font-headline mb-8">Admin Panel</h2>
            <ul className="space-y-2 flex-grow">
                <li><Button variant="ghost" className="w-full justify-start gap-2" asChild><Link href="/admin"><LayoutDashboard/>Events</Link></Button></li>
                <li><Button variant="ghost" className="w-full justify-start gap-2" asChild><Link href="/admin/analytics"><BarChart2/>Analytics</Link></Button></li>
            </ul>
            <div className="mt-auto">
                 <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}><User/>Logout</Button>
            </div>
        </nav>
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
    <div className="flex min-h-screen">
      <aside className="w-56 hidden md:block border-r">
          <AdminNav />
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
