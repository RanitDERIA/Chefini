'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ChefHat,
  Users,
  ShoppingCart,
  Utensils,
  Stethoscope,
  Cpu,
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Generate Magic', icon: Sparkles },
    { href: '/daily-dishes', label: 'Daily Dishes', icon: Utensils },
    { href: '/batch', label: 'Smart Meal', icon: Cpu },
    { href: '/cookbook', label: 'My Cookbook', icon: ChefHat },
    { href: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
    { href: '/debug', label: 'Flavor Rescue', icon: Stethoscope },
    { href: '/discover', label: 'Discover', icon: Users },
  ];

  return (
    <>
      {/* DESKTOP NAVIGATION (Top) - Hidden on Mobile */}
      <nav className="hidden md:block bg-black border-b-2 border-chefini-yellow sticky top-0 z-30" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`px-6 py-4 font-bold flex items-center gap-2 transition-all whitespace-nowrap flex-shrink-0 text-base ${isActive
                  ? 'bg-chefini-yellow text-black'
                  : 'bg-black text-white hover:bg-chefini-yellow hover:bg-opacity-20 hover:text-chefini-yellow'
                  } ${href !== '/discover' ? 'border-r-2 border-chefini-yellow' : ''}`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* MOBILE NAVIGATION (Bottom) - Hidden on Desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-4 border-chefini-yellow z-50 safe-area-bottom shadow-2xl" suppressHydrationWarning>
        <div className="flex overflow-x-auto no-scrollbar snap-x">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center justify-center min-w-[20vw] flex-1 py-3 px-1 transition-all snap-center
                  ${isActive
                    ? 'bg-chefini-yellow text-black font-black border-l-2 border-r-2 border-black'
                    : 'text-gray-400 hover:text-white active:scale-95 border-r border-zinc-800'
                  }
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                <span className={`text-[9px] mt-1 text-center leading-tight whitespace-normal break-words w-full ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
}