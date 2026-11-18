import React from 'react';

export type StickerName =
  // Video & Equipment
  | 'camera'
  | 'ring_light'
  | 'tripod'
  | 'microphone'
  | 'clapperboard'
  | 'play_button'
  | 'rec_tag'
  | 'film_strip'
  // Social & Engagement
  | 'heart'
  | 'thumbs_up'
  | 'comment'
  | 'share'
  | 'bell'
  | 'verified'
  | 'hashtag'
  | 'flame'
  // Money & Deals
  | 'money_bag'
  | 'coin'
  | 'wallet'
  | 'invoice'
  | 'handshake'
  | 'contract'
  | 'calculator'
  | 'piggy_bank'
  // Time & Productivity
  | 'clock'
  | 'hourglass'
  | 'calendar'
  | 'checklist'
  | 'trophy'
  | 'star'
  | 'sparkle'
  | 'confetti'
  | 'rocket'
  | 'lightbulb'
  // Generic Platforms
  | 'reels_icon'
  | 'shorts_icon'
  | 'video_icon'
  | 'post_icon'
  | 'story_icon'
  | 'blog_icon'
  // Moods & Alerts
  | 'mood_happy'
  | 'mood_tired'
  | 'mood_fire'
  | 'mood_deadline';

interface StickerProps {
  name: StickerName | string;
  size?: number | string;
  className?: string;
  rotation?: number;
  interactive?: boolean;
}

export const STICKER_CATALOG: { id: StickerName; label: string; category: string }[] = [
  // Equipment
  { id: 'camera', label: 'Vintage Camera', category: 'Gear' },
  { id: 'ring_light', label: 'Ring Light', category: 'Gear' },
  { id: 'tripod', label: 'Tripod', category: 'Gear' },
  { id: 'microphone', label: 'Podcast Mic', category: 'Gear' },
  { id: 'clapperboard', label: 'Clapperboard', category: 'Gear' },
  { id: 'play_button', label: 'Play Button', category: 'Gear' },
  { id: 'rec_tag', label: 'REC Live Tag', category: 'Gear' },
  { id: 'film_strip', label: 'Film Strip', category: 'Gear' },
  // Social
  { id: 'heart', label: 'Love Heart', category: 'Social' },
  { id: 'thumbs_up', label: 'Thumbs Up', category: 'Social' },
  { id: 'comment', label: 'Chat Bubble', category: 'Social' },
  { id: 'share', label: 'Share Arrow', category: 'Social' },
  { id: 'bell', label: 'Subscriber Bell', category: 'Social' },
  { id: 'verified', label: 'Verified Badge', category: 'Social' },
  { id: 'hashtag', label: 'Trending Tag', category: 'Social' },
  { id: 'flame', label: 'Viral Flame', category: 'Social' },
  // Money
  { id: 'money_bag', label: 'Money Bag', category: 'Finance' },
  { id: 'coin', label: 'Golden Coin', category: 'Finance' },
  { id: 'wallet', label: 'Leather Wallet', category: 'Finance' },
  { id: 'invoice', label: 'Invoice Stamp', category: 'Finance' },
  { id: 'handshake', label: 'Brand Collab', category: 'Finance' },
  { id: 'contract', label: 'Signed Deal', category: 'Finance' },
  { id: 'calculator', label: 'Calculator', category: 'Finance' },
  { id: 'piggy_bank', label: 'Piggy Bank', category: 'Finance' },
  // Productivity
  { id: 'clock', label: 'Wall Clock', category: 'Time' },
  { id: 'hourglass', label: 'Hourglass', category: 'Time' },
  { id: 'calendar', label: 'Planner Calendar', category: 'Time' },
  { id: 'checklist', label: 'Checklist Done', category: 'Time' },
  { id: 'trophy', label: 'Gold Trophy', category: 'Milestones' },
  { id: 'star', label: 'Gold Star', category: 'Milestones' },
  { id: 'sparkle', label: 'Magic Sparkles', category: 'Milestones' },
  { id: 'confetti', label: 'Party Popper', category: 'Milestones' },
  { id: 'rocket', label: 'Growth Rocket', category: 'Milestones' },
  { id: 'lightbulb', label: 'Idea Bulb', category: 'Milestones' },
  // Platforms
  { id: 'reels_icon', label: 'Vertical Reel', category: 'Formats' },
  { id: 'shorts_icon', label: 'Short Video', category: 'Formats' },
  { id: 'video_icon', label: 'Longform Video', category: 'Formats' },
  { id: 'post_icon', label: 'Photo Carousel', category: 'Formats' },
  { id: 'story_icon', label: 'Story Gradient', category: 'Formats' },
  { id: 'blog_icon', label: 'Newsletter & Blog', category: 'Formats' },
  // Moods
  { id: 'mood_happy', label: 'In The Zone 😊', category: 'Moods' },
  { id: 'mood_tired', label: 'Rendering All Night 😴', category: 'Moods' },
  { id: 'mood_fire', label: 'Crushing It 🔥', category: 'Moods' },
  { id: 'mood_deadline', label: 'Deadline Today! 🚨', category: 'Moods' },
];

export const Sticker: React.FC<StickerProps> = ({
  name,
  size = 48,
  className = '',
  rotation = 0,
  interactive = false,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  const renderSvg = () => {
    switch (name) {
      // 1. Camera
      case 'camera':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-sm">
            <rect x="8" y="18" width="48" height="34" rx="8" fill="#4A4458" stroke="#2E2A38" strokeWidth="2.5" />
            <path d="M22 18L26 10H38L42 18H22Z" fill="#6B647B" />
            <circle cx="32" cy="35" r="12" fill="#D6EBFF" stroke="#4A4458" strokeWidth="3" />
            <circle cx="32" cy="35" r="7" fill="#2E2A38" />
            <circle cx="29" cy="32" r="2.5" fill="#FFFFFF" />
            <circle cx="48" cy="24" r="3" fill="#FFB5B5" />
          </svg>
        );

      // 2. Ring Light
      case 'ring_light':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-sm">
            <circle cx="32" cy="26" r="18" stroke="#FFF3B8" strokeWidth="8" />
            <circle cx="32" cy="26" r="14" stroke="#FFE47A" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M32 44V60M24 60H40" stroke="#4A4458" strokeWidth="4" strokeLinecap="round" />
            <rect x="29" y="22" width="6" height="10" rx="2" fill="#4A4458" />
          </svg>
        );

      // 3. Tripod
      case 'tripod':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 8V24M32 24L14 58M32 24L50 58M32 24V58" stroke="#4A4458" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="26" y="8" width="12" height="6" rx="2" fill="#D4F5E4" stroke="#4A4458" strokeWidth="2" />
          </svg>
        );

      // 4. Microphone
      case 'microphone':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="24" y="8" width="16" height="28" rx="8" fill="#FFD6E0" stroke="#4A4458" strokeWidth="3" />
            <path d="M16 26C16 35 23 42 32 42C41 42 48 35 48 26" stroke="#4A4458" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M32 42V56M22 56H42" stroke="#4A4458" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="28" y1="16" x2="36" y2="16" stroke="#4A4458" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="22" x2="36" y2="22" stroke="#4A4458" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      // 5. Clapperboard
      case 'clapperboard':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="8" y="24" width="48" height="32" rx="4" fill="#4A4458" />
            <path d="M8 12H56L52 24H8V12Z" fill="#FFF8F0" stroke="#4A4458" strokeWidth="3" />
            <path d="M16 12L24 24M32 12L40 24M48 12L56 24" stroke="#4A4458" strokeWidth="3" />
            <rect x="14" y="32" width="22" height="8" rx="2" fill="#D4F5E4" />
            <rect x="14" y="44" width="36" height="6" rx="2" fill="#E4D9FF" />
          </svg>
        );

      // 6. Play Button
      case 'play_button':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="6" y="12" width="52" height="40" rx="12" fill="#FFB5B5" stroke="#4A4458" strokeWidth="3" />
            <polygon points="26,22 44,32 26,42" fill="#FFF8F0" stroke="#4A4458" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        );

      // 7. REC Tag
      case 'rec_tag':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="6" y="18" width="52" height="28" rx="6" fill="#4A4458" />
            <circle cx="18" cy="32" r="5" fill="#FFB5B5" />
            <text x="27" y="37" fill="#FFF8F0" fontSize="13" fontWeight="bold" fontFamily="sans-serif">REC</text>
          </svg>
        );

      // 8. Film Strip
      case 'film_strip':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="8" y="14" width="48" height="36" rx="4" fill="#6B647B" stroke="#4A4458" strokeWidth="2.5" />
            <rect x="16" y="20" width="32" height="24" rx="2" fill="#FFF8F0" />
            <rect x="10" y="16" width="4" height="4" fill="#FFF8F0" />
            <rect x="10" y="44" width="4" height="4" fill="#FFF8F0" />
            <rect x="50" y="16" width="4" height="4" fill="#FFF8F0" />
            <rect x="50" y="44" width="4" height="4" fill="#FFF8F0" />
          </svg>
        );

      // 9. Heart
      case 'heart':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 54S10 40 10 24A12 12 0 0 1 32 16A12 12 0 0 1 54 24C54 40 32 54 32 54Z" fill="#FFD6E0" stroke="#4A4458" strokeWidth="3" strokeLinejoin="round" />
            <path d="M22 20C20 22 18 26 18 30" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      // 10. Thumbs Up
      case 'thumbs_up':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M12 28H20V52H12V28Z" fill="#D6EBFF" stroke="#4A4458" strokeWidth="3" />
            <path d="M20 32L30 12C33 12 36 15 35 19L33 28H48C52 28 54 31 53 35L49 49C48 52 45 54 42 54H20V32Z" fill="#D6EBFF" stroke="#4A4458" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        );

      // 11. Comment Bubble
      case 'comment':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M10 28C10 18 20 10 32 10C44 10 54 18 54 28C54 38 44 46 32 46C28 46 24 45 20 43L10 48L12 40C11 36 10 32 10 28Z" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="24" cy="28" r="2.5" fill="#4A4458" />
            <circle cx="32" cy="28" r="2.5" fill="#4A4458" />
            <circle cx="40" cy="28" r="2.5" fill="#4A4458" />
          </svg>
        );

      // 12. Share Arrow
      case 'share':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="18" cy="32" r="7" fill="#E4D9FF" stroke="#4A4458" strokeWidth="3" />
            <circle cx="46" cy="18" r="7" fill="#E4D9FF" stroke="#4A4458" strokeWidth="3" />
            <circle cx="46" cy="46" r="7" fill="#E4D9FF" stroke="#4A4458" strokeWidth="3" />
            <line x1="24" y1="28" x2="40" y2="21" stroke="#4A4458" strokeWidth="3" />
            <line x1="24" y1="36" x2="40" y2="43" stroke="#4A4458" strokeWidth="3" />
          </svg>
        );

      // 13. Subscriber Bell
      case 'bell':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 10C24 10 18 16 18 26V36L12 44H52L46 36V26C46 16 40 10 32 10Z" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="32" cy="52" r="5" fill="#4A4458" />
          </svg>
        );

      // 14. Verified Badge
      case 'verified':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 8L38 14L46 14L48 22L54 26L52 34L56 41L50 46L48 54L40 54L34 60L28 56L20 56L18 48L12 44L14 36L10 29L16 24L18 16L26 16L32 8Z" fill="#D6EBFF" stroke="#4A4458" strokeWidth="2.5" />
            <path d="M22 32L28 38L42 24" stroke="#166534" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      // 15. Hashtag
      case 'hashtag':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <line x1="24" y1="12" x2="18" y2="52" stroke="#4A4458" strokeWidth="4" strokeLinecap="round" />
            <line x1="42" y1="12" x2="36" y2="52" stroke="#4A4458" strokeWidth="4" strokeLinecap="round" />
            <line x1="12" y1="24" x2="52" y2="24" stroke="#FFD6E0" strokeWidth="5" strokeLinecap="round" />
            <line x1="10" y1="40" x2="50" y2="40" stroke="#D4F5E4" strokeWidth="5" strokeLinecap="round" />
          </svg>
        );

      // 16. Viral Flame
      case 'flame':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M34 8C34 16 42 20 42 30C42 42 32 54 22 54C14 54 10 46 10 38C10 28 20 18 20 18C20 18 22 28 28 28C28 20 34 8 34 8Z" fill="#FFE0CC" stroke="#C25D1E" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M26 36C26 42 22 48 18 48C14 48 12 44 12 40C12 34 18 30 18 30C18 30 20 34 22 34C22 30 26 36 26 36Z" fill="#FFF3B8" />
          </svg>
        );

      // 17. Money Bag
      case 'money_bag':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M24 16L20 8H44L40 16" fill="#D4F5E4" stroke="#4A4458" strokeWidth="3" />
            <path d="M12 24C12 18 20 18 32 18C44 18 52 18 52 24C52 46 48 56 32 56C16 56 12 46 12 24Z" fill="#D4F5E4" stroke="#4A4458" strokeWidth="3" />
            <circle cx="32" cy="36" r="10" fill="#FFF8F0" stroke="#4A4458" strokeWidth="2" />
            <text x="27" y="41" fill="#166534" fontSize="14" fontWeight="bold">$</text>
          </svg>
        );

      // 18. Coin
      case 'coin':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="22" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" />
            <circle cx="32" cy="32" r="16" fill="#FFE47A" stroke="#92400E" strokeWidth="2" strokeDasharray="3 2" />
            <text x="26" y="39" fill="#92400E" fontSize="20" fontWeight="bold">$</text>
          </svg>
        );

      // 19. Wallet
      case 'wallet':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="8" y="18" width="48" height="34" rx="6" fill="#FFE0CC" stroke="#4A4458" strokeWidth="3" />
            <path d="M38 28H56V42H38C35 42 35 28 38 28Z" fill="#FFF8F0" stroke="#4A4458" strokeWidth="2.5" />
            <circle cx="44" cy="35" r="2.5" fill="#4A4458" />
          </svg>
        );

      // 20. Invoice
      case 'invoice':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="14" y="10" width="36" height="46" rx="4" fill="#FFF8F0" stroke="#4A4458" strokeWidth="3" />
            <line x1="20" y1="20" x2="44" y2="20" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="28" x2="38" y2="28" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="36" x2="34" y2="36" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="38" cy="42" r="6" fill="#D4F5E4" stroke="#166534" strokeWidth="1.5" />
            <text x="35" y="45" fill="#166534" fontSize="9" fontWeight="bold">✓</text>
          </svg>
        );

      // 21. Handshake
      case 'handshake':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M8 26L20 38L28 30L16 18L8 26Z" fill="#D6EBFF" stroke="#4A4458" strokeWidth="2.5" />
            <path d="M56 26L44 38L36 30L48 18L56 26Z" fill="#FFE0CC" stroke="#4A4458" strokeWidth="2.5" />
            <rect x="22" y="26" width="20" height="16" rx="4" fill="#FFF3B8" stroke="#4A4458" strokeWidth="2.5" />
          </svg>
        );

      // 22. Contract
      case 'contract':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="12" y="8" width="40" height="48" rx="4" fill="#FFF8F0" stroke="#4A4458" strokeWidth="3" />
            <circle cx="24" cy="20" r="5" fill="#E4D9FF" />
            <line x1="34" y1="18" x2="46" y2="18" stroke="#4A4458" strokeWidth="2" strokeLinecap="round" />
            <line x1="34" y1="23" x2="44" y2="23" stroke="#4A4458" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 46C24 43 32 48 38 45" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 23. Calculator
      case 'calculator':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="14" y="8" width="36" height="48" rx="6" fill="#E4D9FF" stroke="#4A4458" strokeWidth="3" />
            <rect x="20" y="14" width="24" height="10" rx="2" fill="#FFF8F0" stroke="#4A4458" strokeWidth="1.5" />
            <circle cx="23" cy="32" r="2.5" fill="#4A4458" />
            <circle cx="32" cy="32" r="2.5" fill="#4A4458" />
            <circle cx="41" cy="32" r="2.5" fill="#4A4458" />
            <circle cx="23" cy="42" r="2.5" fill="#4A4458" />
            <circle cx="32" cy="42" r="2.5" fill="#4A4458" />
            <circle cx="41" cy="42" r="2.5" fill="#D4F5E4" />
          </svg>
        );

      // 24. Piggy Bank
      case 'piggy_bank':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <ellipse cx="32" cy="34" rx="20" ry="16" fill="#FFD6E0" stroke="#4A4458" strokeWidth="3" />
            <circle cx="24" cy="28" r="2" fill="#4A4458" />
            <ellipse cx="14" cy="35" rx="4" ry="6" fill="#FFB5B5" stroke="#4A4458" strokeWidth="2" />
            <line x1="28" y1="18" x2="36" y2="18" stroke="#4A4458" strokeWidth="3" strokeLinecap="round" />
            <rect x="22" y="48" width="5" height="6" fill="#4A4458" />
            <rect x="37" y="48" width="5" height="6" fill="#4A4458" />
          </svg>
        );

      // 25. Clock
      case 'clock':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="22" fill="#D6EBFF" stroke="#4A4458" strokeWidth="3" />
            <polyline points="32,18 32,32 40,32" stroke="#4A4458" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 26. Hourglass
      case 'hourglass':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M18 10H46M18 54H46" stroke="#4A4458" strokeWidth="4" strokeLinecap="round" />
            <path d="M20 12C20 28 44 28 44 12Z" fill="#FFF3B8" stroke="#4A4458" strokeWidth="2.5" />
            <path d="M20 52C20 36 44 36 44 52Z" fill="#FFF3B8" stroke="#4A4458" strokeWidth="2.5" />
            <circle cx="32" cy="38" r="1.5" fill="#C25D1E" />
          </svg>
        );

      // 27. Calendar
      case 'calendar':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="10" y="14" width="44" height="42" rx="6" fill="#FFF8F0" stroke="#4A4458" strokeWidth="3" />
            <rect x="10" y="14" width="44" height="12" rx="4" fill="#FFB5B5" />
            <circle cx="22" cy="12" r="3" fill="#4A4458" />
            <circle cx="42" cy="12" r="3" fill="#4A4458" />
            <text x="24" y="44" fill="#4A4458" fontSize="16" fontWeight="bold" fontFamily="sans-serif">28</text>
          </svg>
        );

      // 28. Checklist
      case 'checklist':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="12" y="10" width="40" height="48" rx="6" fill="#FFF8F0" stroke="#4A4458" strokeWidth="3" />
            <rect x="18" y="20" width="8" height="8" rx="2" fill="#D4F5E4" stroke="#166534" strokeWidth="1.5" />
            <line x1="30" y1="24" x2="46" y2="24" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="18" y="34" width="8" height="8" rx="2" fill="#D4F5E4" stroke="#166534" strokeWidth="1.5" />
            <line x1="30" y1="38" x2="44" y2="38" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      // 29. Trophy
      case 'trophy':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M18 10H46V28C46 36 39 42 32 42C25 42 18 36 18 28V10Z" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" />
            <path d="M18 14H10C10 24 16 26 18 26" stroke="#4A4458" strokeWidth="3" />
            <path d="M46 14H54C54 24 48 26 46 26" stroke="#4A4458" strokeWidth="3" />
            <path d="M32 42V52M22 52H42" stroke="#4A4458" strokeWidth="4" strokeLinecap="round" />
            <polygon points="32,18 34,24 40,24 35,28 37,34 32,30 27,34 29,28 24,24 30,24" fill="#FFA500" />
          </svg>
        );

      // 30. Star
      case 'star':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <polygon points="32,6 39,22 56,23 43,35 47,52 32,43 17,52 21,35 8,23 25,22" fill="#FFF3B8" stroke="#E5A100" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        );

      // 31. Sparkle
      case 'sparkle':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 4C32 20 48 32 60 32C48 32 32 44 32 60C32 44 16 32 4 32C16 32 32 20 32 4Z" fill="#E4D9FF" stroke="#4A4458" strokeWidth="2.5" />
            <circle cx="48" cy="16" r="3" fill="#FFF3B8" />
            <circle cx="16" cy="48" r="3" fill="#FFD6E0" />
          </svg>
        );

      // 32. Confetti Popper
      case 'confetti':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <polygon points="12,52 26,44 18,30" fill="#FFB5B5" stroke="#4A4458" strokeWidth="2.5" />
            <circle cx="36" cy="22" r="3" fill="#D4F5E4" />
            <circle cx="48" cy="30" r="3" fill="#FFF3B8" />
            <circle cx="42" cy="14" r="2.5" fill="#E4D9FF" />
            <rect x="30" y="34" width="4" height="6" transform="rotate(25 30 34)" fill="#D6EBFF" />
          </svg>
        );

      // 33. Rocket
      case 'rocket':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M32 6C40 14 46 28 44 42L32 46L20 42C18 28 24 14 32 6Z" fill="#FFF8F0" stroke="#4A4458" strokeWidth="3" />
            <circle cx="32" cy="24" r="5" fill="#D6EBFF" stroke="#4A4458" strokeWidth="2" />
            <path d="M20 38L10 44V34L20 28" fill="#FFB5B5" stroke="#4A4458" strokeWidth="2" />
            <path d="M44 38L54 44V34L44 28" fill="#FFB5B5" stroke="#4A4458" strokeWidth="2" />
            <polygon points="26,46 32,58 38,46" fill="#FFA500" />
          </svg>
        );

      // 34. Lightbulb
      case 'lightbulb':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <path d="M20 24C20 16 26 10 32 10C38 10 44 16 44 24C44 29 40 34 38 38H26C24 34 20 29 20 24Z" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" />
            <rect x="27" y="38" width="10" height="8" rx="2" fill="#6B647B" stroke="#4A4458" strokeWidth="2" />
            <line x1="32" y1="4" x2="32" y2="7" stroke="#FFA500" strokeWidth="3" strokeLinecap="round" />
            <line x1="12" y1="14" x2="15" y2="16" stroke="#FFA500" strokeWidth="3" strokeLinecap="round" />
            <line x1="52" y1="14" x2="49" y2="16" stroke="#FFA500" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      // 35. Generic Reel
      case 'reels_icon':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="18" y="8" width="28" height="48" rx="8" fill="#FFD6E0" stroke="#4A4458" strokeWidth="3" />
            <polygon points="28,26 38,32 28,38" fill="#FFF8F0" stroke="#4A4458" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        );

      // 36. Generic Short
      case 'shorts_icon':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="18" y="8" width="28" height="48" rx="8" fill="#FFB5B5" stroke="#4A4458" strokeWidth="3" />
            <path d="M26 26L36 32L26 38V26Z" fill="#FFF8F0" />
            <rect x="22" y="12" width="6" height="3" rx="1" fill="#4A4458" />
          </svg>
        );

      // 37. Generic Longform Video
      case 'video_icon':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="8" y="16" width="48" height="32" rx="8" fill="#D6EBFF" stroke="#4A4458" strokeWidth="3" />
            <polygon points="26,24 40,32 26,40" fill="#FFF8F0" stroke="#4A4458" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        );

      // 38. Generic Post
      case 'post_icon':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="10" y="10" width="44" height="44" rx="8" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" />
            <circle cx="24" cy="24" r="4" fill="#4A4458" />
            <path d="M14 44L26 30L36 40L42 34L50 44" stroke="#4A4458" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      // 39. Generic Story
      case 'story_icon':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="22" fill="#FFF8F0" stroke="#E4D9FF" strokeWidth="5" />
            <circle cx="32" cy="32" r="16" fill="#FFD6E0" />
            <polygon points="28,26 38,32 28,38" fill="#4A4458" />
          </svg>
        );

      // 40. Generic Blog
      case 'blog_icon':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="12" y="10" width="40" height="48" rx="6" fill="#D4F5E4" stroke="#4A4458" strokeWidth="3" />
            <line x1="20" y1="20" x2="44" y2="20" stroke="#4A4458" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="28" x2="40" y2="28" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="36" x2="34" y2="36" stroke="#4A4458" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      // 41. Mood Happy
      case 'mood_happy':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="22" fill="#FFF3B8" stroke="#4A4458" strokeWidth="3" />
            <circle cx="24" cy="26" r="3" fill="#4A4458" />
            <circle cx="40" cy="26" r="3" fill="#4A4458" />
            <path d="M22 36C24 42 40 42 42 36" stroke="#4A4458" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );

      // 42. Mood Tired
      case 'mood_tired':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="22" fill="#E4D9FF" stroke="#4A4458" strokeWidth="3" />
            <line x1="20" y1="26" x2="28" y2="26" stroke="#4A4458" strokeWidth="3" strokeLinecap="round" />
            <line x1="36" y1="26" x2="44" y2="26" stroke="#4A4458" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="40" r="4" fill="#4A4458" />
            <text x="44" y="20" fill="#4A4458" fontSize="12" fontWeight="bold">z</text>
          </svg>
        );

      // 43. Mood Fire
      case 'mood_fire':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="8" y="16" width="48" height="32" rx="8" fill="#FFE0CC" stroke="#C25D1E" strokeWidth="3" />
            <text x="14" y="38" fill="#C25D1E" fontSize="13" fontWeight="bold" fontFamily="sans-serif">ON FIRE! 🔥</text>
          </svg>
        );

      // 44. Mood Deadline
      case 'mood_deadline':
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect x="6" y="16" width="52" height="32" rx="8" fill="#FFB5B5" stroke="#991B1B" strokeWidth="3" />
            <text x="10" y="37" fill="#991B1B" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif">DEADLINE! ⏰</text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="22" fill="#D4F5E4" stroke="#4A4458" strokeWidth="3" />
            <text x="24" y="39" fill="#166534" fontSize="20" fontWeight="bold">✦</text>
          </svg>
        );
    }
  };

  return (
    <div
      style={{
        width: pixelSize,
        height: pixelSize,
        transform: `rotate(${rotation}deg)`,
      }}
      className={`inline-block select-none transition-transform duration-200 ${
        interactive ? 'hover:scale-110 hover:rotate-0 cursor-pointer active:scale-95' : ''
      } ${className}`}
    >
      {renderSvg()}
    </div>
  );
};
