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
  // Middleware now handles protection
  const session = await auth();



  return (
    <div className="min-h-screen bg-chefini-black flex flex-col" suppressHydrationWarning>
      {/* Anti-right-click + feedback */}
      <DisableContextMenu />
      <RightClickFeedback />

      {/* Layout UI */}
      <Header user={session?.user || {}} />
      <Navigation />

      {/* RESPONSIVE FIX:
         Changed p-6 to p-4 sm:p-6 
         Added overflow-x-hidden to prevent horizontal scrolling issues
      */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full overflow-x-hidden">
        {children}
      </main>

      <Footer />
    </div>
  );
}