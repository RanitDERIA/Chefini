import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

// Client-side components
import DisableContextMenu from '@/components/DisableContextMenu';
import RightClickFeedback from '@/components/RightClickFeedback';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-chefini-black flex flex-col">
      {/* Anti-right-click + feedback */}
      <DisableContextMenu />
      <RightClickFeedback />

      {/* Layout UI */}
      <Header user={session.user} />
      <Navigation />

      <main className="max-w-7xl mx-auto p-6 flex-1 w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}
