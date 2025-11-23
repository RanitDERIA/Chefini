import { ChefHat } from 'lucide-react';

interface ChefiniLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function ChefiniLogo({ size = 'lg' }: ChefiniLogoProps) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };
  
  return (
    <div className={`font-black ${sizes[size]} tracking-tighter flex items-center gap-1 text-chefini-yellow`}>
      <span>CHEFINI</span>
      <ChefHat className="inline-block" style={{ transform: 'rotate(-15deg)' }} />
    </div>
  );
}