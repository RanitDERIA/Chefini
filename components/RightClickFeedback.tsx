'use client';

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export default function RightClickFeedback() {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setShow(true);
      setTimeout(() => setShow(false), 1500);
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed z-[9999] bg-chefini-yellow text-black px-4 py-2 border-2 border-black shadow-brutal font-bold text-sm flex items-center gap-2 pointer-events-none animate-slide-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Shield size={16} />
      Content Protected
    </div>
  );
}