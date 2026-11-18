import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroScene } from '../3d/HeroScene';
import { Sticker } from '../stickers/Sticker';
import { WashiTape } from '../components/common/WashiTape';
import { PolaroidCard } from '../components/common/PolaroidCard';
import { StickyNote } from '../components/common/StickyNote';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Play } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (email: string) => {
    try {
      await login(email, 'Password123!');
      navigate('/today');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-journal-dots text-ink selection:bg-blush">
      {/* Top Header */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sticker name="camera" size={40} interactive />
          <span className="font-handwritten text-3xl font-bold tracking-wide text-ink">
            Creator Innovia
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold text-ink hover:text-ink-dark rounded-full border border-paper-lines bg-white/70 hover:bg-white shadow-sm transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-bold text-white bg-ink hover:bg-ink-light rounded-full shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Start Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          {/* Header pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint-light border border-mint-border text-mint-dark text-xs font-bold mb-4 shadow-sm">
            <Sticker name="trophy" size={20} />
            <span>The Creator Business Intelligence Platform</span>
          </div>

          <h1 className="font-handwritten text-5xl sm:text-6xl lg:text-7xl font-extrabold text-ink leading-[1.08] mb-4">
            Was that brand deal <span className="underline decoration-wavy decoration-blush">actually</span> worth your time?
          </h1>

          <p className="text-base sm:text-lg text-ink-light leading-relaxed max-w-xl mb-8 font-body">
            Stop guessing your true creator ROI. Creator Innovia connects your views, engagement, and deal value directly with production expenses, editor payouts, and hours worked. 
            Styled as a living creator journal and scrapbook.
          </p>

          {/* Quick Demo Logins for All 3 Roles */}
          <div className="bg-white/90 border border-paper-lines p-4 rounded-2xl shadow-scrapbook max-w-lg mb-6 relative">
            <div className="absolute -top-3 right-6 washi-tape washi-tape-pink w-28 h-6 rotate-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-coral-dark" />
              <span>Instant 1-Click Demo Login:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('creator@innovia.io')}
                className="p-2.5 bg-mint/40 hover:bg-mint text-mint-dark border border-mint-border rounded-xl text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5">
                  <Sticker name="camera" size={20} />
                  <span className="font-bold text-xs">Creator</span>
                </div>
                <p className="text-[10px] text-ink-light mt-0.5 truncate">Full BI & Profit</p>
              </button>

              <button
                onClick={() => handleDemoLogin('sponsor@innovia.io')}
                className="p-2.5 bg-lavender/40 hover:bg-lavender text-ink border border-lavender-dark rounded-xl text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5">
                  <Sticker name="handshake" size={20} />
                  <span className="font-bold text-xs">Sponsor</span>
                </div>
                <p className="text-[10px] text-ink-light mt-0.5 truncate">Deliverables only</p>
              </button>

              <button
                onClick={() => handleDemoLogin('editor@innovia.io')}
                className="p-2.5 bg-butter/40 hover:bg-butter text-butter-dark border border-butter-border rounded-xl text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5">
                  <Sticker name="clapperboard" size={20} />
                  <span className="font-bold text-xs">Editor</span>
                </div>
                <p className="text-[10px] text-ink-light mt-0.5 truncate">Tasks & Timer</p>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-ink-light">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-mint-dark" />
              <span>Zero social API keys needed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-mint-dark" />
              <span>Automated hourly profit calculation</span>
            </span>
          </div>
        </div>

        {/* 3D Floating Scene */}
        <div className="relative">
          <HeroScene />
        </div>
      </section>

      {/* "Worth It Score" Formula Preview Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-[#FAF5EE] border-2 border-paper-border rounded-3xl p-6 sm:p-10 shadow-scrapbook relative">
          <div className="absolute -top-4 left-12 washi-tape washi-tape-mint w-36 h-7 rotate-[-2deg]" />
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-ink mb-2">
              The "Worth It" Intelligence Engine
            </h2>
            <p className="text-sm text-ink-light font-body">
              A single unified metric from 0 to 100 that factors net margin, hourly return, and audience engagement into a definitive sticker verdict.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PolaroidCard
              title="Net Profit Margin"
              subtitle="40% Weight in Score"
              tapeColor="pink"
              rotation={-1}
            >
              <div className="flex items-center justify-between p-3 bg-paper-cream rounded-xl">
                <div>
                  <p className="text-xs text-ink-faint font-bold">Deal Value - Expenses</p>
                  <p className="text-2xl font-mono font-extrabold text-mint-dark mt-1">68.5%</p>
                </div>
                <Sticker name="money_bag" size={38} />
              </div>
            </PolaroidCard>

            <PolaroidCard
              title="Profit Per Working Hour"
              subtitle="35% Weight in Score"
              tapeColor="yellow"
              rotation={1}
            >
              <div className="flex items-center justify-between p-3 bg-paper-cream rounded-xl">
                <div>
                  <p className="text-xs text-ink-faint font-bold">Net Profit / Logged Hours</p>
                  <p className="text-2xl font-mono font-extrabold text-ink mt-1">$94/hr</p>
                </div>
                <Sticker name="hourglass" size={38} />
              </div>
            </PolaroidCard>

            <PolaroidCard
              title="Engagement Multiplier"
              subtitle="25% Weight in Score"
              tapeColor="mint"
              rotation={-1.5}
            >
              <div className="flex items-center justify-between p-3 bg-paper-cream rounded-xl">
                <div>
                  <p className="text-xs text-ink-faint font-bold">Interactions / Views</p>
                  <p className="text-2xl font-mono font-extrabold text-coral-dark mt-1">8.2%</p>
                </div>
                <Sticker name="flame" size={38} />
              </div>
            </PolaroidCard>
          </div>

          {/* Verdict Banner */}
          <div className="mt-8 p-4 bg-white border border-paper-lines rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sticker name="trophy" size={48} />
              <div>
                <p className="font-handwritten text-2xl font-bold text-mint-dark">
                  Verdict: "Totally worth it!" (Score: 89/100)
                </p>
                <p className="text-xs text-ink-light">
                  This collaboration exceeded your benchmark hourly rate by 88% and cost only 4.5 production hours.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-mint text-mint-dark font-bold text-xs rounded-full border border-mint-border hover:bg-mint-border transition-all whitespace-nowrap shadow-sm"
            >
              Open Your Free Journal Spread
            </Link>
          </div>
        </div>
      </section>

      {/* Role Access Matrix */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h3 className="font-handwritten text-3xl sm:text-4xl font-bold text-center text-ink mb-8">
          Built for Seamless Collaboration with 3 Exact Roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StickyNote color="yellow" rotation={-1.5} pin>
            <div className="flex items-center gap-2 mb-2">
              <Sticker name="camera" size={28} />
              <h4 className="font-bold text-base text-ink">1. Content Creator (Owner)</h4>
            </div>
            <p className="text-xs text-ink-light mb-3">
              Full access. Tracks profit margins, sets up collaborations, reviews team payouts, and customizes their personal scrapbook board.
            </p>
            <ul className="text-xs space-y-1 text-ink-light">
              <li>✓ Complete BI Dashboard & Profit Per Hour</li>
              <li>✓ Expense Approvals & Batch Payouts</li>
              <li>✓ Personal Draggable Sticker Scrapbook</li>
            </ul>
          </StickyNote>

          <StickyNote color="pink" rotation={1} pin>
            <div className="flex items-center gap-2 mb-2">
              <Sticker name="handshake" size={28} />
              <h4 className="font-bold text-base text-ink">2. Brand Sponsor</h4>
            </div>
            <p className="text-xs text-ink-light mb-3">
              Isolated deal portal. Brands see only their sponsored deal deliverables, social performance reach, and payment status.
            </p>
            <ul className="text-xs space-y-1 text-ink-light">
              <li>✓ Deliverable Approval & Change Requests</li>
              <li>✓ Views, Likes & Engagement Analytics</li>
              <li>✗ Cannot see expenses, team pay, or creator margin</li>
            </ul>
          </StickyNote>

          <StickyNote color="blue" rotation={-1} pin>
            <div className="flex items-center gap-2 mb-2">
              <Sticker name="clapperboard" size={28} />
              <h4 className="font-bold text-base text-ink">3. Team Member (Editor)</h4>
            </div>
            <p className="text-xs text-ink-light mb-3">
              Task execution workspace. Editors and designers see assigned tasks, log hours with an automated stopwatch, and track their payouts.
            </p>
            <ul className="text-xs space-y-1 text-ink-light">
              <li>✓ Start / Stop Live Time Tracker</li>
              <li>✓ Kanban Task Board & File Briefs</li>
              <li>✗ Cannot see deal revenue, margin, or other payouts</li>
            </ul>
          </StickyNote>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-paper-lines py-8 text-center text-xs text-ink-faint">
        <p>Creator Innovia — Live Journal & Business Intelligence for Modern Creators</p>
        <p className="mt-1">PWA Installable • Zero Social API Dependencies • Instant Local Execution</p>
      </footer>
    </div>
  );
};
