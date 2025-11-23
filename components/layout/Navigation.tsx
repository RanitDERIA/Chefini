'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ChefHat, Users, ShoppingCart } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Generate Magic', icon: Sparkles },
    { href: '/cookbook', label: 'My Cookbook', icon: ChefHat },
    { href: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
    { href: '/discover', label: 'Discover', icon: Users },
    // Profile removed - access via avatar click
  ];

  return (
    <nav className="bg-black border-b-2 border-chefini-yellow">
      <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`px-6 py-4 font-bold flex items-center gap-2 border-r-2 border-chefini-yellow transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-chefini-yellow text-black' 
                  : 'hover:bg-chefini-yellow hover:bg-opacity-20'
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}