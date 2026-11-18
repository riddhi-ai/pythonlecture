import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { WashiTape } from './WashiTape';

interface PolaroidCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  tapeColor?: 'yellow' | 'pink' | 'mint' | 'lavender' | 'blue';
  rotation?: number;
  enableTilt?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  children,
  title,
  subtitle,
  tapeColor,
  rotation = 0,
  enableTilt = true,
  className = '',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 6;
    const rotateY = (x / (rect.width / 2)) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const transformStyle = isHovered
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) scale(1.01)`
    : `rotate(${rotation}deg)`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={cn(
        'relative bg-white border border-[#E8DCCB] rounded-xl p-5 shadow-polaroid',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      {tapeColor && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <WashiTape color={tapeColor} rotation={-1.5} />
        </div>
      )}

      <div className="relative z-10">{children}</div>

      {(title || subtitle) && (
        <div className="mt-4 pt-3 border-t border-paper-lines/60 text-center">
          {title && <h4 className="font-handwritten text-xl font-bold text-ink leading-tight">{title}</h4>}
          {subtitle && <p className="text-xs text-ink-light font-body mt-0.5">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
