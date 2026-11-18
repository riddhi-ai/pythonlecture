import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sticker, StickerName } from '../stickers/Sticker';
import { ArrowRight, User as UserIcon, Mail, Lock, Building, Sparkles } from 'lucide-react';
import { UserRole } from '@innovia/shared';

const AVATAR_OPTIONS: StickerName[] = [
  'camera',
  'clapperboard',
  'microphone',
  'ring_light',
  'trophy',
  'rocket',
  'flame',
  'handshake',
];

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('inviteCode') || '';
  const initialRole = (searchParams.get('role') as UserRole) || 'CREATOR';
  const initialEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [workspaceName, setWorkspaceName] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');
  const [avatarSticker, setAvatarSticker] = useState<string>('camera');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        workspaceName: workspaceName || `${name}'s Studio`,
        currency,
        avatarSticker,
        inviteCode: inviteCode || undefined,
      });
      navigate('/today');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-journal-dots flex items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-lg bg-[#FFF8F0] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape washi-tape-mint w-40 h-7 rotate-1" />

        <div className="text-center mb-6">
          <h2 className="font-handwritten text-4xl font-bold text-ink">Start Your Creator Journal</h2>
          <p className="text-xs text-ink-light font-body mt-1">
            Setup your studio workspace, team role, and currency
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-coral-light border border-coral-border rounded-xl text-coral-dark text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Choose Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { r: 'CREATOR' as const, label: 'Creator', desc: 'Full Owner' },
                { r: 'COLLABORATOR' as const, label: 'Sponsor', desc: 'Brand Partner' },
                { r: 'TEAM_MEMBER' as const, label: 'Team', desc: 'Editor / Crew' },
              ].map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => setRole(item.r)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === item.r
                      ? 'bg-mint text-mint-dark border-mint-border font-bold shadow-sm'
                      : 'bg-white text-ink border-paper-lines hover:bg-paper'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-ink-faint">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Sticker Picker */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Pick Your Journal Avatar Sticker</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => setAvatarSticker(sticker)}
                  className={`p-1.5 rounded-xl border transition-all ${
                    avatarSticker === sticker
                      ? 'bg-white border-coral scale-110 shadow-sm'
                      : 'bg-paper border-transparent hover:bg-white'
                  }`}
                >
                  <Sticker name={sticker} size={28} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Your Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-ink-faint" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-ink-faint" />
                <input
                  type="email"
                  required
                  placeholder="alex@creator.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-ink-faint" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-mint"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {role === 'CREATOR' && !inviteCode && (
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Workspace Studio Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-ink-faint" />
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera Studio"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Creating...' : 'Open Journal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-paper-lines text-center text-xs text-ink-light">
          <span>Already have a journal? </span>
          <Link to="/login" className="font-bold text-ink underline decoration-mint decoration-2">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
