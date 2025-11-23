import { LucideIcon } from 'lucide-react';

interface ChefiniButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export default function ChefiniButton({
  children,
  onClick,
  variant = 'primary',
  icon: Icon,
  disabled,
  type = 'button',
  className = ''
}: ChefiniButtonProps) {
  const variants = {
    primary: 'bg-chefini-yellow text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm',
    secondary: 'bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm',
    danger: 'bg-red-500 text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 font-bold border-2 border-black shadow-brutal transition-all flex items-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}