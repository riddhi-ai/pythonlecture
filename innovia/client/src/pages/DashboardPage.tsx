import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { PolaroidCard } from '../components/common/PolaroidCard';
import { WashiTape } from '../components/common/WashiTape';
import { KpiCoin3D } from '../3d/KpiCoin3D';
import { KpiHourglass3D } from '../3d/KpiHourglass3D';
import { TrophyShelf3D } from '../3d/TrophyShelf3D';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatCurrency, formatNumber } from '../lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Sparkles, Filter, TrendingUp, Clock, DollarSign, Heart, Trophy, Eye } from 'lucide-react';
import { FinancialSummary, Collaboration, Insight } from '@innovia/shared';

const COLORS = ['#D4F5E4', '#FFD6E0', '#FFF3B8', '#D6EBFF', '#E4D9FF', '#FFE0CC'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [platformFilter, setPlatformFilter] = useState('');
  const [collabFilter, setCollabFilter] = useState('');

  // 1. Fetch Creator Financial Summary
  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ['financialSummary', platformFilter, collabFilter],
    queryFn: () =>
      apiRequest(
        `/analytics/summary?platform=${encodeURIComponent(platformFilter)}&collaborationId=${encodeURIComponent(
          collabFilter
        )}`
      ),
    enabled: user?.role === 'CREATOR',
  });

  // 2. Fetch BI Charts Data
  const { data: charts, isLoading: chartsLoading } = useQuery<any>({
    queryKey: ['chartsData'],
    queryFn: () => apiRequest('/analytics/charts'),
    enabled: user?.role === 'CREATOR',
  });

  // 3. Fetch Insights
  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ['insights'],
    queryFn: () => apiRequest('/analytics/insights'),
    enabled: user?.role === 'CREATOR',
  });

  // 4. Fetch Collaborations (for dropdown and Collaborator view)
  const { data: collabs = [] } = useQuery<Collaboration[]>({
    queryKey: ['collaborations'],
    queryFn: () => apiRequest('/collaborations'),
  });

  // 5. Fetch Tasks & Payments for Team Member view
  const { data: teamTasks = [] } = useQuery<any[]>({
    queryKey: ['tasks'],
    queryFn: () => apiRequest('/tasks'),
    enabled: user?.role === 'TEAM_MEMBER',
  });

  const { data: teamPayments = [] } = useQuery<any[]>({
    queryKey: ['payments'],
    queryFn: () => apiRequest('/expenses/payments'),
    enabled: user?.role === 'TEAM_MEMBER',
  });

  if (user?.role === 'CREATOR' && (summaryLoading || chartsLoading)) {
    return <PageFlipLoader3D message="Calculating financial metrics & margins..." />;
  }

  // ==========================================
  // 1. COLLABORATOR (SPONSOR) DASHBOARD VIEW
  // ==========================================
  if (user?.role === 'COLLABORATOR') {
    return (
      <div className="space-y-6">
        <div className="relative bg-[#FFFBF5] border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="absolute -top-3.5 left-10 washi-tape washi-tape-lavender w-32 h-6 rotate-[-1deg]" />
          <div className="flex items-center gap-3">
            <Sticker name="handshake" size={40} />
            <div>
              <h1 className="font-handwritten text-4xl font-bold text-ink">
                Sponsor Collaboration Portal
              </h1>
              <p className="text-xs text-ink-light">
                Monitor deliverable progress, content status, reach metrics, and payment records.
              </p>
            </div>
          </div>
        </div>

        {collabs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-paper-lines rounded-2xl">
            <Sticker name="handshake" size={48} className="mx-auto mb-2" />
            <p className="font-handwritten text-2xl font-bold text-ink">No linked collaborations found.</p>
          </div>
        ) : (
          collabs.map((collab) => {
            const completedCount = collab.deliverables.filter((d) => d.completed).length;
            const totalCount = collab.deliverables.length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={collab.id || (collab as any)._id}
                className="bg-white border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook space-y-6 relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-lines pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-ink-faint uppercase">
                      Brand Deal • {collab.brandName}
                    </span>
                    <h2 className="font-handwritten text-3xl font-bold text-ink">{collab.title}</h2>
                    <p className="text-xs text-ink-light mt-0.5">
                      Target Deadline: <span className="font-bold text-ink">{collab.deadlineDate}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-lavender text-ink border border-lavender-dark">
                      Status: {collab.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-mint text-mint-dark border border-mint-border">
                      Payment: {collab.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-ink mb-1">
                    <span>Deliverables Progress</span>
                    <span>{progressPct}% ({completedCount}/{totalCount})</span>
                  </div>
                  <div className="w-full bg-paper rounded-full h-3 border border-paper-lines overflow-hidden">
                    <div
                      className="bg-mint-dark h-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div>
                  <h3 className="font-bold text-sm text-ink mb-3">Deliverables Checklist:</h3>
                  <div className="space-y-2">
                    {collab.deliverables.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-paper-cream border border-paper-lines rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Sticker name={item.completed ? 'checklist' : 'clock'} size={20} />
                          <span className={item.completed ? 'line-through text-ink-faint text-sm' : 'text-sm font-semibold text-ink'}>
                            {item.title}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-paper-lines">
                          {item.completed ? 'Approved' : 'In Production'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ==========================================
  // 2. TEAM MEMBER (EDITOR) DASHBOARD VIEW
  // ==========================================
  if (user?.role === 'TEAM_MEMBER') {
    const totalEarnings = teamPayments
      .filter((p) => p.status === 'Paid')
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingEarnings = teamPayments
      .filter((p) => p.status !== 'Paid')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    return (
      <div className="space-y-6">
        <div className="relative bg-[#FFFBF5] border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="absolute -top-3.5 left-10 washi-tape washi-tape-butter w-32 h-6 rotate-[-1deg]" />
          <div className="flex items-center gap-3">
            <Sticker name="clapperboard" size={40} />
            <div>
              <h1 className="font-handwritten text-4xl font-bold text-ink">
                Team Member Production Hub
              </h1>
              <p className="text-xs text-ink-light">
                Track your active editing queue, time tracking, and approved payouts.
              </p>
            </div>
          </div>
        </div>

        {/* Team KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PolaroidCard title="Assigned Tasks" subtitle="Active Queue" tapeColor="yellow" rotation={-1}>
            <div className="text-center py-2">
              <p className="text-4xl font-mono font-extrabold text-ink">{teamTasks.length}</p>
              <p className="text-xs text-ink-faint mt-1">
                {teamTasks.filter((t) => t.status === 'Done').length} completed
              </p>
            </div>
          </PolaroidCard>

          <PolaroidCard title="Paid Payouts" subtitle="Direct to You" tapeColor="mint" rotation={1}>
            <div className="text-center py-2">
              <p className="text-4xl font-mono font-extrabold text-mint-dark">
                {formatCurrency(totalEarnings)}
              </p>
              <p className="text-xs text-ink-faint mt-1">Processed earnings</p>
            </div>
          </PolaroidCard>

          <PolaroidCard title="Pending Payouts" subtitle="Awaiting Batch" tapeColor="pink" rotation={-1}>
            <div className="text-center py-2">
              <p className="text-4xl font-mono font-extrabold text-coral-dark">
                {formatCurrency(pendingEarnings)}
              </p>
              <p className="text-xs text-ink-faint mt-1">Scheduled for release</p>
            </div>
          </PolaroidCard>
        </div>

        {/* Task Queue List */}
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <h3 className="font-handwritten text-3xl font-bold text-ink mb-4">Your Active Tasks</h3>
          <div className="space-y-3">
            {teamTasks.map((t) => (
              <div
                key={t.id || t._id}
                className="p-3.5 bg-paper-cream border border-paper-lines rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-ink">{t.title}</h4>
                  <p className="text-xs text-ink-light mt-0.5">
                    Due: {t.dueDate} • Est: {t.estimatedHours} hrs • Actual: {t.actualHours} hrs
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-paper-lines">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. CONTENT CREATOR FULL BI DASHBOARD VIEW
  // ==========================================
  const topCollabs = (charts?.scatterData || []).map((s: any, idx: number) => ({
    rank: idx + 1,
    brandName: s.name,
    profit: s.dealValue * 70, // 70% estimated net
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Quick Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Business Intelligence Journal
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Connecting social performance with net profit, expenses, and hours worked.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white/90 border border-paper-lines p-2 rounded-2xl shadow-sm">
          <Filter className="w-4 h-4 text-ink-faint ml-2" />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-2 py-1 bg-paper border border-paper-lines rounded-lg text-xs font-bold text-ink focus:outline-none"
          >
            <option value="">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
            <option value="TikTok">TikTok</option>
            <option value="Twitter/X">Twitter/X</option>
            <option value="Blog">Blog</option>
          </select>

          <select
            value={collabFilter}
            onChange={(e) => setCollabFilter(e.target.value)}
            className="px-2 py-1 bg-paper border border-paper-lines rounded-lg text-xs font-bold text-ink focus:outline-none"
          >
            <option value="">All Collaborations</option>
            {collabs.map((c) => (
              <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                {c.brandName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3D KPI Parallax Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Revenue */}
          <PolaroidCard
            title="Total Revenue"
            subtitle="Deal Values & Monetization"
            tapeColor="yellow"
            rotation={-1}
            enableTilt
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-mono font-extrabold text-ink">
                  {formatCurrency(summary.totalRevenue)}
                </p>
                <p className="text-xs font-mono font-bold text-mint-dark mt-1">+18.4% vs last mo</p>
              </div>
              <KpiCoin3D size={48} />
            </div>
          </PolaroidCard>

          {/* 2. Total Expenses */}
          <PolaroidCard
            title="Total Expenses"
            subtitle="Gear, Props, Travel & Team"
            tapeColor="pink"
            rotation={1}
            enableTilt
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-mono font-extrabold text-coral-dark">
                  {formatCurrency(summary.totalExpenses)}
                </p>
                <p className="text-xs font-mono font-bold text-ink-faint mt-1">
                  Incl. Approved Payouts
                </p>
              </div>
              <Sticker name="wallet" size={44} interactive />
            </div>
          </PolaroidCard>

          {/* 3. Net Profit & Margin */}
          <PolaroidCard
            title="Net Profit"
            subtitle={`Profit Margin: ${summary.profitMargin}%`}
            tapeColor="mint"
            rotation={-0.8}
            enableTilt
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-mono font-extrabold text-mint-dark">
                  {formatCurrency(summary.netProfit)}
                </p>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-mint text-mint-dark border border-mint-border inline-block mt-1">
                  {summary.profitMargin}% Margin
                </span>
              </div>
              <Sticker name="trophy" size={44} interactive />
            </div>
          </PolaroidCard>

          {/* 4. Profit Per Hour */}
          <PolaroidCard
            title="Profit / Hour"
            subtitle={`${summary.totalHours} Total Logged Hours`}
            tapeColor="lavender"
            rotation={1.2}
            enableTilt
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-mono font-extrabold text-ink">
                  {formatCurrency(summary.profitPerHour)}/h
                </p>
                <p className="text-xs font-mono font-bold text-mint-dark mt-1">
                  Worth It: {summary.worthItScore}/100
                </p>
              </div>
              <KpiHourglass3D size={48} />
            </div>
          </PolaroidCard>
        </div>
      )}

      {/* 3D Trophy Shelf for Top 3 Profitable Deals */}
      <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook relative">
        <div className="absolute -top-3.5 left-10 washi-tape washi-tape-mint w-36 h-6 rotate-[-1.5deg]" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sticker name="trophy" size={28} />
            <h3 className="font-handwritten text-3xl font-bold text-ink">
              Top 3 Profitable Collaborations
            </h3>
          </div>
          <span className="text-xs font-mono text-ink-faint">Marquee Deals</span>
        </div>
        <TrophyShelf3D items={topCollabs} />
      </div>

      {/* Charts Grid: Styled as "Pasted Pages" with corner tape */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Revenue vs Expenses Over Time */}
        <div className="relative bg-[#FCF8F2] border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="absolute -top-3 left-8 washi-tape washi-tape-yellow w-28 h-6 rotate-[-2deg]" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-handwritten text-2xl font-bold text-ink">Revenue vs Expenses</h3>
              <p className="text-xs text-ink-light">Monthly trajectory (in USD)</p>
            </div>
            <Sticker name="coin" size={28} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE3D5" />
                <XAxis dataKey="month" stroke="#4A4458" fontSize={12} fontFamily="monospace" />
                <YAxis stroke="#4A4458" fontSize={12} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    borderRadius: '12px',
                    border: '1px solid #E8DCCB',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#166534"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#166534' }}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#991B1B"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#991B1B' }}
                  name="Expenses ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Breakdown Donut */}
        <div className="relative bg-[#FCF8F2] border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="absolute -top-3 right-8 washi-tape washi-tape-pink w-28 h-6 rotate-[2deg]" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-handwritten text-2xl font-bold text-ink">Spend Allocation</h3>
              <p className="text-xs text-ink-light">Where production money goes</p>
            </div>
            <Sticker name="calculator" size={28} />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.expenseDonut || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="category"
                >
                  {(charts?.expenseDonut || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    borderRadius: '12px',
                    border: '1px solid #E8DCCB',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-[11px] font-bold text-ink">
            {(charts?.expenseDonut || []).map((e: any, idx: number) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="capitalize">{e.category} (${e.amount})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Chart 3: Engagement vs Profit Scatter */}
        <div className="relative bg-[#FCF8F2] border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="absolute -top-3 left-8 washi-tape washi-tape-mint w-28 h-6 rotate-[-1deg]" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-handwritten text-2xl font-bold text-ink">Engagement vs Deal Value</h3>
              <p className="text-xs text-ink-light">High engagement deals vs dollar yield</p>
            </div>
            <Sticker name="flame" size={28} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE3D5" />
                <XAxis
                  type="number"
                  dataKey="engagement"
                  name="Engagement %"
                  unit="%"
                  stroke="#4A4458"
                  fontFamily="monospace"
                />
                <YAxis
                  type="number"
                  dataKey="dealValue"
                  name="Value"
                  unit="$"
                  stroke="#4A4458"
                  fontFamily="monospace"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    borderRadius: '12px',
                    border: '1px solid #E8DCCB',
                    fontFamily: 'monospace',
                  }}
                />
                <Scatter name="Deals" data={charts?.scatterData || []} fill="#4A4458" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Content Type Efficiency Radar */}
        <div className="relative bg-[#FCF8F2] border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="absolute -top-3 right-8 washi-tape washi-tape-blue w-28 h-6 rotate-[1.5deg]" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-handwritten text-2xl font-bold text-ink">Format Efficiency Radar</h3>
              <p className="text-xs text-ink-light">Hourly return by content format</p>
            </div>
            <Sticker name="rocket" size={28} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts?.efficiencyData || []}>
                <PolarGrid stroke="#EFE3D5" />
                <PolarAngleAxis dataKey="subject" stroke="#4A4458" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4A4458" />
                <Radar
                  name="Profit / Hour"
                  dataKey="profitPerHour"
                  stroke="#166534"
                  fill="#D4F5E4"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    borderRadius: '12px',
                    border: '1px solid #E8DCCB',
                    fontFamily: 'monospace',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Auto-Generated Plain English Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sticker name="lightbulb" size={28} />
          <h3 className="font-handwritten text-3xl font-bold text-ink">
            Rule-Based Creator Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-5 bg-white border-2 border-paper-border rounded-2xl shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow"
            >
              <Sticker name={insight.verdictSticker || 'star'} size={38} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-handwritten text-2xl font-bold text-ink leading-tight">
                  {insight.title}
                </h4>
                <p className="text-xs text-ink-light leading-relaxed mt-1 font-body">
                  {insight.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
