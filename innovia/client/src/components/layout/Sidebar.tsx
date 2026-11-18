import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sticker } from '../../stickers/Sticker';
import {
  BookOpen,
  LayoutDashboard,
  Handshake,
  Video,
  Receipt,
  CheckSquare,
  BarChart3,
  Palette,
  Bell,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isCreator = user?.role === 'CREATOR';
  const isCollaborator = user?.role === 'COLLABORATOR';
  const isTeamMember = user?.role === 'TEAM_MEMBER';

  const navItems = [
    {
      to: '/today',
      label: "Today's Page",
      icon: <BookOpen className="w-4 h-4" />,
      sticker: 'calendar',
      show: true,
    },
    {
      to: '/dashboard',
      label: 'BI Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      sticker: 'trophy',
      show: true,
    },
    {
      to: '/collaborations',
      label: 'Collaborations',
      icon: <Handshake className="w-4 h-4" />,
      sticker: 'handshake',
      show: true,
    },
    {
      to: '/content',
      label: 'Content Hub',
      icon: <Video className="w-4 h-4" />,
      sticker: 'video_icon',
      show: isCreator || isTeamMember,
    },
    {
      to: '/expenses',
      label: 'Expenses & Payouts',
      icon: <Receipt className="w-4 h-4" />,
      sticker: 'money_bag',
      show: isCreator || isTeamMember, // Collaborator blocked
    },
    {
      to: '/tasks',
      label: 'Tasks & Timer',
      icon: <CheckSquare className="w-4 h-4" />,
      sticker: 'hourglass',
      show: isCreator || isTeamMember, // Collaborator blocked
    },
    {
      to: '/analytics',
      label: 'Profit Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      sticker: 'calculator',
      show: isCreator, // Creator only
    },
    {
      to: '/scrapbook',
      label: 'Scrapbook Board',
      icon: <Palette className="w-4 h-4" />,
      sticker: 'sparkle',
      show: true,
    },
    {
      to: '/notifications',
      label: 'Journal Recap',
      icon: <Bell className="w-4 h-4" />,
      sticker: 'invoice',
      show: true,
    },
    {
      to: '/settings',
      label: 'Studio Settings',
      icon: <Settings className="w-4 h-4" />,
      sticker: 'verified',
      show: true,
    },
  ];

  return (
    <aside className="w-64 bg-[#FFF8F0] border-r border-[#E8DCCB] shrink-0 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-1">
        {/* User Mini Profile Badge */}
        <div className="mb-4 p-3 bg-white/80 border border-paper-lines rounded-xl shadow-sm flex items-center gap-3">
          <Sticker name={user?.avatarSticker || 'camera'} size={32} />
          <div className="truncate">
            <h4 className="font-bold text-ink text-sm truncate">{user?.name}</h4>
            <p className="text-[11px] font-mono text-ink-faint truncate">{user?.email}</p>
          </div>
        </div>

        {/* Tab bookmark navigation */}
        <nav className="space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-ink shadow-sm border border-paper-lines translate-x-1'
                      : 'text-ink-light hover:bg-white/50 hover:text-ink'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-ink-faint">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <Sticker name={item.sticker} size={18} />
              </NavLink>
            ))}
        </nav>
      </div>

      {/* Quick Add Shortcut Reminder Footer */}
      <div className="pt-4 border-t border-paper-lines/60">
        <div className="p-3 bg-[#FAF5EE] border border-paper-lines rounded-xl text-center">
          <p className="font-handwritten text-base font-bold text-ink">Need to jot something down?</p>
          <p className="text-[11px] text-ink-faint mt-0.5">
            Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-paper-lines text-ink font-bold">/</kbd> to Quick-Add
          </p>
        </div>
      </div>
    </aside>
  );
};
