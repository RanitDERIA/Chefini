'use client';

// [NOTE] UNCOMMENT THESE IN YOUR ACTUAL NEXT.JS APP
// import { usePathname } from 'next/navigation';
// import Link from 'next/link';

// [NOTE] REMOVE THESE MOCKS IN YOUR ACTUAL NEXT.JS APP
import { useState, useEffect } from 'react';
const usePathname = () => {
  const [path, setPath] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
        setPath(window.location.pathname === '/' ? '/dashboard' : window.location.pathname);
    }
  }, []);
  return path;
};
const Link = ({ href, children, className, ...props }: any) => (
  <a href={href} className={className} {...props}>{children}</a>
);

import { Sparkles, ChefHat, Users, ShoppingCart, Utensils } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Generate Magic', icon: Sparkles },
    { href: '/daily-dishes', label: 'Daily Dishes', icon: Utensils }, // Added this
    { href: '/cookbook', label: 'My Cookbook', icon: ChefHat },
    { href: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
    { href: '/discover', label: 'Discover', icon: Users },
  ];

  return (
    <nav className="bg-black border-b-2 border-chefini-yellow sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto no-scrollbar">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`px-6 py-4 font-bold flex items-center gap-2 border-r-2 border-chefini-yellow transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-chefini-yellow text-black' 
                  : 'bg-black text-white hover:bg-chefini-yellow hover:bg-opacity-20 hover:text-chefini-yellow'
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