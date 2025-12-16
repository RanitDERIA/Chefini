'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChefiniLogo from '../ui/ChefiniLogo';
import { LogOut } from 'lucide-react';
import { getAvatarDisplay } from '@/lib/avatars';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;
  };
}

export default function Header({ user: initialUser }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Merge server-side initialUser with client-side session updates.
  // This ensures that when profile.update() is called, the header reflects changes immediately.
  const user = {
    ...initialUser,
    ...session?.user,
  };

  const avatarDisplay = getAvatarDisplay(user);

  return (
    <header className="border-b-4 border-chefini-yellow bg-black p-4 sm:p-6 sticky top-0 z-40" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Scale logo slightly down on mobile to prevent overflow */}
        <div className="scale-90 origin-left sm:scale-100">
          <ChefiniLogo size="md" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden md:block">
            <p className="font-bold text-white">{user.name ? `Hey, ${user.name.split(' ')[0]}!` : 'Hey, Chef!'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          {/* Clickable Profile Avatar - Responsive sizing */}
          <button
            onClick={() => router.push('/profile')}
            className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white shadow-brutal-sm flex items-center justify-center overflow-hidden bg-chefini-yellow hover:border-chefini-yellow hover:scale-110 transition-all cursor-pointer"
            title="View Profile"
          >
            {avatarDisplay.type === 'image' && (
              <img
                src={avatarDisplay.value}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}

            {avatarDisplay.type === 'initial' && (
              <span className="font-black text-black text-lg sm:text-xl">{avatarDisplay.value}</span>
            )}
          </button>

          {/* Logout Button - Responsive sizing */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 sm:p-3 border-2 border-white bg-red-500 hover:bg-red-600 transition-colors text-white"
            title="Logout"
          >
            <LogOut size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}