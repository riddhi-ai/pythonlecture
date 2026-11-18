import React from 'react';
import { cn } from '../../lib/utils';

interface StickyNoteProps {
  children: React.ReactNode;
  color?: 'yellow' | 'pink' | 'mint' | 'blue' | 'lavender';
  rotation?: number;
  pin?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  children,
  color = 'yellow',
  rotation = 0,
  pin = true,
  className = '',
  onClick,
}) => {
  const bgColors = {
    yellow: 'bg-[#FFF9D9] border-[#FFE47A]',
    pink: 'bg-[#FFE8EE] border-[#FFB5B5]',
    mint: 'bg-[#EAFBF1] border-[#9FE2BF]',
    blue: 'bg-[#EBF5FF] border-[#B8DCFF]',
    lavender: 'bg-[#F2ECFF] border-[#D4C4FF]',
  };

  return (
    <div
      onClick={onClick}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      className={cn(
        'relative p-4 rounded-sm border shadow-md transition-all duration-200 hover:rotate-0 hover:scale-[1.02] hover:shadow-lg',
        bgColors[color],
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      {pin && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-coral border-2 border-white shadow-pin z-10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>
      )}
      <div className="relative z-0">{children}</div>
    </div>
  );
};
