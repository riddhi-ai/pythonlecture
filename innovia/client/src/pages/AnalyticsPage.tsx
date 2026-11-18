import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { PolaroidCard } from '../components/common/PolaroidCard';
import { WashiTape } from '../components/common/WashiTape';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Download, Printer, BarChart2, Award, Zap, AlertTriangle, Layers } from 'lucide-react';
import { FinancialSummary } from '@innovia/shared';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'collabs' | 'platforms' | 'types'>('collabs');

  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ['financialSummary'],
    queryFn: () => apiRequest('/analytics/summary'),
  });

  const { data: comparisons, isLoading: compLoading } = useQuery<any>({
    queryKey: ['comparisons'],
    queryFn: () => apiRequest('/analytics/comparisons'),
  });

  const handleExportCSV = async () => {
    try {
      const csvData = await apiRequest('/analytics/export');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creator-innovia-financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (summaryLoading || compLoading) {
    return <PageFlipLoader3D message="Running financial profitability comparisons..." />;
  }

  return (
    <div className="space-y-8 print:p-0">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Financial & Profitability Analytics
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Discover your most lucrative campaigns, content formats, and platform yields.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-paper-lines rounded-xl text-xs font-bold text-ink hover:bg-paper flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-ink-faint" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-ink hover:bg-ink-light text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Worth It Score Spotlight Card */}
      {summary && (
        <div className="relative bg-[#FCF8F2] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
          <div className="absolute -top-3.5 left-10 washi-tape washi-tape-mint w-36 h-6 rotate-[-1.5deg]" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Sticker name={summary.worthItSticker || 'trophy'} size={64} interactive />
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-faint">
                  Macro Worth It Intelligence
                </span>
                <h2 className="font-handwritten text-3xl sm:text-4xl font-bold text-ink leading-tight">
                  Overall Verdict: "{summary.worthItVerdict}"
                </h2>
                <p className="text-xs text-ink-light font-body mt-1 max-w-xl">
                  Score of <span className="font-bold text-ink font-mono">{summary.worthItScore}/100</span> synthesized across your average {summary.profitMargin}% net margin, {formatCurrency(summary.profitPerHour)}/hr return, and {summary.averageEngagement}% engagement benchmark.
                </p>
              </div>
            </div>

            <div className="flex gap-4 shrink-0 bg-white/80 border border-paper-lines p-4 rounded-2xl shadow-sm text-center">
              <div>
                <p className="text-[10px] text-ink-faint font-bold uppercase">Net Profit</p>
                <p className="text-xl font-mono font-extrabold text-mint-dark mt-0.5">
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
              <div className="w-px bg-paper-lines" />
              <div>
                <p className="text-[10px] text-ink-faint font-bold uppercase">Logged Hours</p>
                <p className="text-xl font-mono font-extrabold text-ink mt-0.5">
                  {summary.totalHours} hrs
                </p>
              </div>
              <div className="w-px bg-paper-lines" />
              <div>
                <p className="text-[10px] text-ink-faint font-bold uppercase">Profit / Hour</p>
                <p className="text-xl font-mono font-extrabold text-ink mt-0.5">
                  {formatCurrency(summary.profitPerHour)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-paper-lines pb-2">
          <button
            onClick={() => setActiveTab('collabs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'collabs'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-light hover:bg-white hover:text-ink'
            }`}
          >
            Collaboration vs Collaboration
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'platforms'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-light hover:bg-white hover:text-ink'
            }`}
          >
            Platform vs Platform
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'types'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-light hover:bg-white hover:text-ink'
            }`}
          >
            Content Format Efficiency
          </button>
        </div>

        {/* Tab 1: Collab vs Collab Comparison */}
        {activeTab === 'collabs' && (
          <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-paper-lines text-ink-faint font-mono uppercase">
                    <th className="pb-3">Brand & Deal Title</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">Expenses</th>
                    <th className="pb-3 text-right">Net Profit</th>
                    <th className="pb-3 text-center">Margin %</th>
                    <th className="pb-3 text-center">Worth It Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-lines font-body">
                  {(comparisons?.collaborations || []).map((c: any) => (
                    <tr key={c.id} className="hover:bg-paper/40">
                      <td className="py-3.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-ink-faint block">
                          {c.brandName}
                        </span>
                        <span className="font-bold text-ink text-sm">{c.title}</span>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-right text-ink">
                        {formatCurrency(c.revenue)}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-right text-coral-dark">
                        -{formatCurrency(c.expenses)}
                      </td>
                      <td className="py-3.5 font-mono font-extrabold text-right text-mint-dark">
                        {formatCurrency(c.netProfit)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-paper border border-paper-lines text-ink">
                          {c.profitMargin}%
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            c.worthItVerdict === 'Totally worth it!'
                              ? 'bg-mint text-mint-dark border border-mint-border'
                              : c.worthItVerdict === 'Meh'
                              ? 'bg-butter text-butter-dark border border-butter-border'
                              : 'bg-coral text-coral-dark border border-coral-border'
                          }`}
                        >
                          <Sticker name={c.worthItSticker} size={16} />
                          <span>{c.worthItVerdict} ({c.worthItScore})</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Platform Comparison */}
        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(comparisons?.platforms || []).map((p: any) => (
              <div
                key={p.platform}
                className="bg-white border-2 border-paper-border rounded-2xl p-5 shadow-scrapbook space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-handwritten text-3xl font-bold text-ink">{p.platform}</h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-paper border border-paper-lines">
                    {p.count} posts
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-paper-lines">
                    <span className="text-ink-faint">Total Views:</span>
                    <span className="font-bold text-ink">{formatNumber(p.views)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-paper-lines">
                    <span className="text-ink-faint">Avg Engagement:</span>
                    <span className="font-bold text-mint-dark">{p.avgEngagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Content Format Efficiency */}
        {activeTab === 'types' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(comparisons?.contentTypes || []).map((t: any) => (
              <div
                key={t.type}
                className="bg-white border-2 border-paper-border rounded-2xl p-5 shadow-scrapbook space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-handwritten text-3xl font-bold text-ink">{t.type}</h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-paper border border-paper-lines">
                    {t.count} released
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-paper-lines">
                    <span className="text-ink-faint">Total Audience Reach:</span>
                    <span className="font-bold text-ink">{formatNumber(t.views)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-paper-lines">
                    <span className="text-ink-faint">Average Engagement:</span>
                    <span className="font-bold text-mint-dark">{t.avgEngagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
