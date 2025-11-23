import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  if (session) {
    // If logged in, go to dashboard
    redirect('/dashboard');
  }

  // If not logged in, show landing page
  redirect('/landing');
}