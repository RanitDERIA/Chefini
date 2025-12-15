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
    <nav className="bg-black border-b-2 border-chefini-yellow sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-bold flex items-center gap-2 transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${isActive
                ? 'bg-chefini-yellow text-black'
                : 'bg-black text-white hover:bg-chefini-yellow hover:bg-opacity-20 hover:text-chefini-yellow'
                } ${href !== '/discover' ? 'border-r-2 border-chefini-yellow' : ''}`}
            >
              <Icon size={18} className="sm:w-5 sm:h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}