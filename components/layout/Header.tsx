'use client';

import { signOut } from 'next-auth/react';
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

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const avatarDisplay = getAvatarDisplay(user);

  return (
    <header className="border-b-4 border-chefini-yellow bg-black p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <ChefiniLogo size="md" />
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="font-bold">{user.name ? `Hey, ${user.name.split(' ')[0]}!` : 'Hey, Chef!'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          
          {/* Clickable Profile Avatar */}
          <button
            onClick={() => router.push('/profile')}
            className="w-12 h-12 border-2 border-white shadow-brutal-sm flex items-center justify-center overflow-hidden bg-chefini-yellow hover:border-chefini-yellow hover:scale-110 transition-all cursor-pointer"
            title="View Profile"
          >
            {avatarDisplay.type === 'emoji' && (
              <span className="text-2xl">{avatarDisplay.value}</span>
            )}
            {avatarDisplay.type === 'image' && (
              <img
                src={avatarDisplay.value}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            {avatarDisplay.type === 'initial' && (
              <span className="font-black text-black text-xl">{avatarDisplay.value}</span>
            )}
          </button>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-3 border-2 border-white bg-red-500 hover:bg-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}