import React from 'react';
import { cn } from '../../lib/utils';

interface WashiTapeProps {
  color?: 'yellow' | 'pink' | 'mint' | 'lavender' | 'blue';
  className?: string;
  rotation?: number;
}

export const WashiTape: React.FC<WashiTapeProps> = ({
  color = 'yellow',
  className = '',
  rotation = -2,
}) => {
  const colorMap = {
    yellow: 'washi-tape',
    pink: 'washi-tape-pink',
    mint: 'washi-tape-mint',
    lavender: 'washi-tape-lavender',
    blue: 'washi-tape-blue',
  };

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        'h-6 w-24 select-none opacity-90 shadow-sm transition-transform duration-200 pointer-events-none',
        colorMap[color],
        className
      )}
    />
  );
};
