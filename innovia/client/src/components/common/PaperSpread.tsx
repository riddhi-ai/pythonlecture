import React from 'react';
import { cn } from '../../lib/utils';

interface PaperSpreadProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  className?: string;
}

export const PaperSpread: React.FC<PaperSpreadProps> = ({
  leftContent,
  rightContent,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'relative bg-[#FCF8F2] border-2 border-[#E5DACB] rounded-2xl shadow-scrapbook overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[580px]',
        className
      )}
    >
      {/* Left Page */}
      <div className="p-6 sm:p-8 bg-journal-lines relative border-b lg:border-b-0 lg:border-r border-[#E8DCCB]">
        {/* Subtle washi tape decorative corner */}
        <div className="absolute top-2 left-6 washi-tape washi-tape-lavender w-20 h-5 rotate-[-3deg] opacity-70" />
        <div className="relative z-10">{leftContent}</div>
      </div>

      {/* Center Spiral Spine for desktop */}
      <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 spiral-binder z-20 pointer-events-none opacity-80" />

      {/* Right Page */}
      <div className="p-6 sm:p-8 bg-journal-dots relative">
        <div className="absolute top-2 right-6 washi-tape washi-tape-mint w-20 h-5 rotate-[3deg] opacity-70" />
        <div className="relative z-10">{rightContent}</div>
      </div>
    </div>
  );
};
