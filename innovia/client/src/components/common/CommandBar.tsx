import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import { Search, Sparkles, X, CornerDownLeft } from 'lucide-react';
import { Sticker } from '../../stickers/Sticker';

export const CommandBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setFeedback(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await apiRequest('/automation/quick-add', {
        method: 'POST',
        body: JSON.stringify({ text: query }),
      });
      setFeedback(res.feedback || 'Item added to your journal!');
      setQuery('');
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to parse command.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border-2 border-paper-border rounded-2xl shadow-scrapbook overflow-hidden p-4">
        {/* Washi tape decoration */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape washi-tape-pink w-32 h-6 rotate-[-1deg]" />

        <div className="flex items-center justify-between pb-3 border-b border-paper-lines">
          <div className="flex items-center gap-2">
            <Sticker name="sparkle" size={24} />
            <h3 className="font-handwritten text-xl font-bold text-ink">Journal Quick-Add</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-paper-lines text-ink-light"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-ink-faint" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "expense 120 props", "task edit rough cut", "collab Nike 3000"...'
              className="w-full pl-10 pr-24 py-3 bg-[#FAF5EE] border border-paper-lines rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-lavender"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-3 py-1.5 bg-ink text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-ink-light disabled:opacity-40"
            >
              <span>Add</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        </form>

        {feedback ? (
          <div className="mt-3 p-3 bg-mint-light border border-mint-border text-mint-dark text-xs rounded-xl font-bold flex items-center gap-2">
            <Sticker name="star" size={20} />
            <span>{feedback}</span>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-ink-light">
            <div
              onClick={() => setQuery('expense 85 props for desk video')}
              className="p-2 bg-[#FAF5EE] rounded-lg cursor-pointer hover:bg-paper-lines transition-colors"
            >
              <span className="font-bold text-ink">expense 85</span> props for desk video
            </div>
            <div
              onClick={() => setQuery('task review color grade due friday')}
              className="p-2 bg-[#FAF5EE] rounded-lg cursor-pointer hover:bg-paper-lines transition-colors"
            >
              <span className="font-bold text-ink">task</span> review color grade
            </div>
            <div
              onClick={() => setQuery('collab Spotify Sponsor 3500')}
              className="p-2 bg-[#FAF5EE] rounded-lg cursor-pointer hover:bg-paper-lines transition-colors"
            >
              <span className="font-bold text-ink">collab</span> Spotify Sponsor 3500
            </div>
            <div
              onClick={() => setQuery('content Top 5 Desk Setup Items Reel')}
              className="p-2 bg-[#FAF5EE] rounded-lg cursor-pointer hover:bg-paper-lines transition-colors"
            >
              <span className="font-bold text-ink">content</span> Top 5 Desk Setup Reel
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-paper-lines flex justify-between text-[11px] text-ink-faint">
          <span>Shortcuts: Press <kbd className="font-mono bg-paper px-1 py-0.5 rounded border">ESC</kbd> to exit</span>
          <span>Tip: Press <kbd className="font-mono bg-paper px-1 py-0.5 rounded border">/</kbd> anywhere to open</span>
        </div>
      </div>
    </div>
  );
};
