import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { WashiTape } from '../components/common/WashiTape';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('creator@innovia.io');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/today');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-journal-dots flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#FFF8F0] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
        {/* Washi tape header */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape washi-tape-pink w-36 h-7 rotate-[-1deg]" />

        <div className="text-center mb-6">
          <div className="inline-block mb-1">
            <Sticker name="camera" size={44} interactive />
          </div>
          <h2 className="font-handwritten text-4xl font-bold text-ink">Open Your Journal</h2>
          <p className="text-xs text-ink-light font-body mt-1">
            Sign in to access your Creator Innovia workspace
          </p>
        </div>

        {/* Demo Accounts Quick-Select */}
        <div className="mb-6 p-3 bg-white/80 border border-paper-lines rounded-xl shadow-sm">
          <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-coral-dark" />
            <span>Select Demo Role to Pre-fill:</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo('creator@innovia.io')}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border text-left transition-all ${
                email === 'creator@innovia.io'
                  ? 'bg-mint text-mint-dark border-mint-border'
                  : 'bg-paper text-ink border-paper-lines hover:bg-paper-lines'
              }`}
            >
              Creator
            </button>
            <button
              type="button"
              onClick={() => fillDemo('sponsor@innovia.io')}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border text-left transition-all ${
                email === 'sponsor@innovia.io'
                  ? 'bg-lavender text-ink border-lavender-dark'
                  : 'bg-paper text-ink border-paper-lines hover:bg-paper-lines'
              }`}
            >
              Sponsor
            </button>
            <button
              type="button"
              onClick={() => fillDemo('editor@innovia.io')}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border text-left transition-all ${
                email === 'editor@innovia.io'
                  ? 'bg-butter text-butter-dark border-butter-border'
                  : 'bg-paper text-ink border-paper-lines hover:bg-paper-lines'
              }`}
            >
              Editor
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-coral-light border border-coral-border rounded-xl text-coral-dark text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-ink-faint" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-ink-faint" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Opening...' : 'Enter Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-paper-lines text-center text-xs text-ink-light">
          <span>New creator? </span>
          <Link to="/register" className="font-bold text-ink underline decoration-blush decoration-2">
            Create your journal
          </Link>
        </div>
      </div>
    </div>
  );
};
