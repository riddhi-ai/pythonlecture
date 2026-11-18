import React from 'react';
import { cn } from '../../lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface TicketStubProps {
  title: string;
  subtitle?: string;
  date: string;
  badge?: string;
  badgeColor?: 'mint' | 'yellow' | 'coral' | 'lavender';
  rotation?: number;
  className?: string;
  onClick?: () => void;
}

export const TicketStub: React.FC<TicketStubProps> = ({
  title,
  subtitle,
  date,
  badge,
  badgeColor = 'mint',
  rotation = 0,
  className = '',
  onClick,
}) => {
  const badgeStyles = {
    mint: 'bg-mint text-mint-dark border-mint-border',
    yellow: 'bg-butter text-butter-dark border-butter-border',
    coral: 'bg-coral text-coral-dark border-coral-border',
    lavender: 'bg-lavender text-ink border-lavender-dark',
  };

  return (
    <div
      onClick={onClick}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        'relative bg-white border border-paper-border rounded-lg shadow-sm p-3.5 flex items-center justify-between gap-3 transition-transform duration-200 hover:rotate-0 hover:shadow-md select-none',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      {/* Left notch */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-paper border-r border-paper-border" />
      {/* Right notch */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-paper border-l border-paper-border" />

      <div className="pl-2">
        <h4 className="font-bold text-ink text-sm leading-tight line-clamp-1">{title}</h4>
        {subtitle && <p className="text-xs text-ink-faint mt-0.5 line-clamp-1">{subtitle}</p>}
        <div className="flex items-center gap-1.5 text-[11px] text-ink-light font-mono mt-1.5">
          <Calendar className="w-3.5 h-3.5 text-ink-faint" />
          <span>{date}</span>
        </div>
      </div>

      {badge && (
        <span
          className={cn(
            'text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap self-center mr-2',
            badgeStyles[badgeColor]
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
};
