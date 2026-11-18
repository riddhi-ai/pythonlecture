import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiteMode } from '../../context/LiteModeContext';
import { Sticker } from '../../stickers/Sticker';
import { apiRequest } from '../../lib/api';
import { Bell, Sparkles, LogOut, Shield, ChevronDown, CheckCircle, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, workspace, logout, switchDemoRole } = useAuth();
  const { isLiteMode, toggleLiteMode } = useLiteMode();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await apiRequest('/automation/seed', { method: 'POST' });
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Seeding failed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'CREATOR') {
      return {
        label: 'Content Creator (Owner)',
        bg: 'bg-mint text-mint-dark border-mint-border',
      };
    }
    if (user?.role === 'COLLABORATOR') {
      return {
        label: 'Brand Collaborator',
        bg: 'bg-lavender text-ink border-lavender-dark',
      };
    }
    return {
      label: 'Team Member (Editor)',
      bg: 'bg-butter text-butter-dark border-butter-border',
    };
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 bg-paper-cream/95 backdrop-blur border-b border-paper-lines px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand & Workspace info */}
      <div className="flex items-center gap-3">
        <Link to="/today" className="flex items-center gap-2 group">
          <Sticker name="camera" size={34} interactive />
          <div>
            <span className="font-handwritten text-2xl font-bold text-ink tracking-wide group-hover:text-ink-dark">
              Creator Innovia
            </span>
            {workspace && (
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-ink-faint bg-white/70 px-2 py-0.5 rounded-full border border-paper-lines">
                {workspace.name}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${roleInfo.bg}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{roleInfo.label}</span>
            <span className="md:hidden">{user?.role}</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-paper-border rounded-xl shadow-scrapbook p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[11px] font-bold text-ink-faint px-2 py-1 uppercase tracking-wider">
                Switch Demo Perspective
              </p>
              <button
                onClick={() => {
                  switchDemoRole('CREATOR');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-mint-light ${
                  user?.role === 'CREATOR' ? 'text-mint-dark font-bold' : 'text-ink'
                }`}
              >
                <Sticker name="camera" size={18} />
                <span>Alex (Creator / Owner)</span>
              </button>
              <button
                onClick={() => {
                  switchDemoRole('COLLABORATOR');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-lavender-light ${
                  user?.role === 'COLLABORATOR' ? 'text-lavender-dark font-bold' : 'text-ink'
                }`}
              >
                <Sticker name="handshake" size={18} />
                <span>Sarah (Brand Sponsor)</span>
              </button>
              <button
                onClick={() => {
                  switchDemoRole('TEAM_MEMBER');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-butter-light ${
                  user?.role === 'TEAM_MEMBER' ? 'text-butter-dark font-bold' : 'text-ink'
                }`}
              >
                <Sticker name="clapperboard" size={18} />
                <span>Marcus (Video Editor)</span>
              </button>
            </div>
          )}
        </div>

        {/* Fill Journal with sample data button (Only for Creator) */}
        {user?.role === 'CREATOR' && (
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            title="Fill my journal with rich sample creator data"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3B8] hover:bg-[#FFE47A] text-ink text-xs font-bold rounded-full border border-paper-lines shadow-sm transition-transform active:scale-95"
          >
            {seedSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-mint-dark" />
                <span>Journal Filled!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-coral-dark" />
                <span>{isSeeding ? 'Seeding...' : 'Fill with Sample Data'}</span>
              </>
            )}
          </button>
        )}

        {/* Lite Mode Toggle */}
        <button
          onClick={toggleLiteMode}
          title={isLiteMode ? 'Switch to 3D WebGL Mode' : 'Switch to 2D Lite Mode'}
          className="p-2 rounded-full border border-paper-lines bg-white hover:bg-paper text-ink-light transition-colors"
        >
          {isLiteMode ? <Sun className="w-4 h-4 text-butter-dark" /> : <Moon className="w-4 h-4 text-ink-light" />}
        </button>

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-full border border-paper-lines bg-white hover:bg-paper text-ink-light transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral" />
        </Link>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Sign Out"
          className="p-2 rounded-full border border-paper-lines bg-white hover:bg-coral-light text-ink-light hover:text-coral-dark transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
