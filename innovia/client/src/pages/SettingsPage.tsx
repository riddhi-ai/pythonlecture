import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiteMode } from '../context/LiteModeContext';
import { apiRequest } from '../lib/api';
import { Sticker, StickerName, STICKER_CATALOG } from '../stickers/Sticker';
import { WashiTape } from '../components/common/WashiTape';
import { triggerConfetti } from '../lib/utils';
import { User, Copy, Check, Upload, Sun, Moon, Shield, Sparkles } from 'lucide-react';
import { UserRole } from '@innovia/shared';

export const SettingsPage: React.FC = () => {
  const { user, workspace } = useAuth();
  const { isLiteMode, toggleLiteMode } = useLiteMode();

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('TEAM_MEMBER');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // CSV Import State
  const [csvType, setCsvType] = useState<'content' | 'expenses'>('content');
  const [csvText, setCsvText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const res = await apiRequest('/auth/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setGeneratedLink(res.inviteLink);
      triggerConfetti();
    } catch (err: any) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setIsImporting(true);
    setImportMessage(null);
    try {
      const res = await apiRequest('/automation/import-csv', {
        method: 'POST',
        body: JSON.stringify({
          entityType: csvType,
          csvContent: csvText,
        }),
      });
      setImportMessage(
        `Successfully imported ${res.result.successRows} rows! (${res.result.errorRows} errors)`
      );
      triggerConfetti();
    } catch (err: any) {
      setImportMessage(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const loadSampleCSV = () => {
    if (csvType === 'content') {
      setCsvText(
        `Title,Platform,Type,Date,Views,Likes,Comments,Shares,Saves\n"5 Secrets to 4K Video Quality",YouTube,Video,2026-11-01,45000,3200,240,180,450\n"Studio Lighting on a Budget",Instagram,Reel,2026-11-03,89000,7600,420,890,1900`
      );
    } else {
      setCsvText(
        `Description,Category,Amount,Date\n"Aputure Light Dome Softbox",equipment,180,2026-11-02\n"Acoustic Diffuser Foam",props,85,2026-11-04\n"Uber to Downtown Client Studio",travel,45,2026-11-05`
      );
    }
  };

  const isCreator = user?.role === 'CREATOR';

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
          Studio Settings & Tools
        </h1>
        <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
          Workspace preferences, team member invitations, CSV bulk import, and display modes.
        </p>
      </div>

      {/* User Profile & Display Card */}
      <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook relative">
        <div className="absolute -top-3.5 left-10 washi-tape washi-tape-lavender w-32 h-6 rotate-[-1deg]" />

        <h3 className="font-handwritten text-2xl font-bold text-ink mb-4">Profile & Studio Identity</h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-paper-cream border border-paper-lines rounded-2xl">
          <div className="flex items-center gap-3">
            <Sticker name={user?.avatarSticker || 'camera'} size={44} interactive />
            <div>
              <h4 className="font-bold text-ink text-base">{user?.name}</h4>
              <p className="text-xs text-ink-faint font-mono">{user?.email}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-paper-lines text-ink inline-block mt-1">
                Role: {user?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLiteMode}
              className="px-3.5 py-2 bg-white border border-paper-lines rounded-xl text-xs font-bold text-ink hover:bg-paper flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isLiteMode ? (
                <>
                  <Sun className="w-4 h-4 text-butter-dark" />
                  <span>2D Lite Mode (Active)</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-ink-light" />
                  <span>3D WebGL Mode (Active)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Team & Brand Invites (Creator only) */}
      {isCreator && (
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook relative">
          <div className="absolute -top-3.5 left-10 washi-tape washi-tape-mint w-36 h-6 rotate-1" />

          <h3 className="font-handwritten text-2xl font-bold text-ink mb-1">
            Invite Team Member or Brand Collaborator
          </h3>
          <p className="text-xs text-ink-light mb-4">
            Generate a personalized sign-in link with the role automatically pre-assigned.
          </p>

          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@brand.com or editor@studio.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-paper border border-paper-lines rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-paper border border-paper-lines rounded-xl text-xs text-ink focus:outline-none"
                >
                  <option value="TEAM_MEMBER">Team Member (Editor / Crew)</option>
                  <option value="COLLABORATOR">Brand Collaborator (Sponsor)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              Generate Invite Link
            </button>
          </form>

          {generatedLink && (
            <div className="mt-4 p-3 bg-mint-light border border-mint-border rounded-xl">
              <p className="text-[11px] font-bold text-mint-dark uppercase mb-1">
                Invite Link Ready to Send:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-2.5 py-1.5 bg-white text-xs font-mono text-ink rounded-lg border border-mint-border select-all"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-mint text-mint-dark rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-mint-border transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Bulk Importer (Creator only) */}
      {isCreator && (
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook relative">
          <div className="absolute -top-3.5 left-10 washi-tape washi-tape-pink w-32 h-6 rotate-[-1.5deg]" />

          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-handwritten text-2xl font-bold text-ink">CSV Bulk Importer</h3>
              <p className="text-xs text-ink-light">
                Bulk import content metrics or expenses with automated column mapping.
              </p>
            </div>
            <button
              onClick={loadSampleCSV}
              className="text-xs font-bold text-ink underline decoration-mint"
            >
              Load Sample Template
            </button>
          </div>

          <form onSubmit={handleImportCSV} className="space-y-3 mt-4">
            <div className="flex gap-4 text-xs font-bold text-ink">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="csvType"
                  value="content"
                  checked={csvType === 'content'}
                  onChange={() => setCsvType('content')}
                />
                <span>Content & Performance Metrics</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="csvType"
                  value="expenses"
                  checked={csvType === 'expenses'}
                  onChange={() => setCsvType('expenses')}
                />
                <span>Production Expenses</span>
              </label>
            </div>

            <textarea
              rows={5}
              placeholder="Paste comma-separated values (CSV) here..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 bg-paper border border-paper-lines rounded-xl text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-mint"
            />

            {importMessage && (
              <div className="p-3 bg-paper-cream border border-paper-lines rounded-xl text-xs font-bold text-ink">
                {importMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isImporting || !csvText.trim()}
              className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-40"
            >
              {isImporting ? 'Processing CSV...' : 'Import Data'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
