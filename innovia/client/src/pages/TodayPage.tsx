import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker, StickerName } from '../stickers/Sticker';
import { StickyNote } from '../components/common/StickyNote';
import { TicketStub } from '../components/common/TicketStub';
import { PolaroidCard } from '../components/common/PolaroidCard';
import { WashiTape } from '../components/common/WashiTape';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { triggerConfetti, formatCurrency, formatDate } from '../lib/utils';
import { CheckCircle2, Circle, Clock, Plus, Flame, Sparkles } from 'lucide-react';
import { Task, Collaboration, FinancialSummary } from '@innovia/shared';

export const TodayPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentMood, setCurrentMood] = useState<StickerName>('mood_happy');
  const [quickTaskText, setQuickTaskText] = useState('');

  // 1. Fetch Today's Tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiRequest('/tasks'),
    enabled: user?.role !== 'COLLABORATOR',
  });

  // 2. Fetch Collaborations for upcoming deadlines
  const { data: collabs = [], isLoading: collabsLoading } = useQuery<Collaboration[]>({
    queryKey: ['collaborations'],
    queryFn: () => apiRequest('/collaborations'),
  });

  // 3. Fetch Financial Summary (if Creator)
  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ['financialSummary'],
    queryFn: () => apiRequest('/analytics/summary'),
    enabled: user?.role === 'CREATOR',
  });

  // Task Toggle Mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, currentStatus }: { taskId: string; currentStatus: string }) => {
      const nextStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
      return apiRequest(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.status === 'Done') {
        triggerConfetti();
      }
    },
  });

  // Quick Task Create Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          status: 'To Do',
          priority: 'Medium',
          dueDate: new Date().toISOString().split('T')[0],
          estimatedHours: 1,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setQuickTaskText('');
    },
  });

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (tasksLoading && collabsLoading) {
    return <PageFlipLoader3D message="Loading your daily journal page..." />;
  }

  const upcomingDeadlines = collabs
    .filter((c) => c.status !== 'Delivered' && c.status !== 'Paid')
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Journal Header Spread */}
      <div className="relative bg-[#FFFBF5] border-2 border-[#EFE3D5] rounded-3xl p-6 sm:p-8 shadow-scrapbook">
        {/* Washi tape accents */}
        <div className="absolute -top-3.5 left-10 washi-tape washi-tape-pink w-32 h-6 rotate-[-2deg]" />
        <div className="absolute -top-3.5 right-12 washi-tape washi-tape-mint w-28 h-6 rotate-[3deg]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-lines pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink-faint uppercase tracking-wider">
              <span>Today's Journal Entry</span>
              <span>•</span>
              <span>{todayStr}</span>
            </div>
            <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink mt-1">
              Good morning, {user?.name?.split(' ')[0]}! ☀️
            </h1>
            <p className="text-sm text-ink-light font-body mt-1">
              Here is your daily creative pulse, priority deliverables, and financial health.
            </p>
          </div>

          {/* Daily Mood Sticker Selector */}
          <div className="flex items-center gap-2 bg-white/80 border border-paper-lines p-2 rounded-2xl shadow-sm self-start md:self-center">
            <span className="text-xs font-bold text-ink-faint pl-2">Today's Mood:</span>
            {(['mood_happy', 'mood_fire', 'mood_tired', 'mood_deadline'] as StickerName[]).map((mood) => (
              <button
                key={mood}
                onClick={() => setCurrentMood(mood)}
                className={`p-1 rounded-xl transition-transform ${
                  currentMood === mood
                    ? 'scale-125 bg-paper-lines shadow-sm'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
              >
                <Sticker name={mood} size={28} />
              </button>
            ))}
          </div>
        </div>

        {/* Creator Daily Snapshot (If Creator) */}
        {user?.role === 'CREATOR' && summary && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-white/90 border border-paper-lines rounded-xl shadow-sm flex items-center gap-3">
              <Sticker name="money_bag" size={32} />
              <div>
                <p className="text-[11px] font-bold text-ink-faint uppercase">Net Profit</p>
                <p className="text-xl font-mono font-extrabold text-mint-dark">
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/90 border border-paper-lines rounded-xl shadow-sm flex items-center gap-3">
              <Sticker name="trophy" size={32} />
              <div>
                <p className="text-[11px] font-bold text-ink-faint uppercase">Profit Margin</p>
                <p className="text-xl font-mono font-extrabold text-ink">
                  {summary.profitMargin}%
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/90 border border-paper-lines rounded-xl shadow-sm flex items-center gap-3">
              <Sticker name="hourglass" size={32} />
              <div>
                <p className="text-[11px] font-bold text-ink-faint uppercase">Profit / Hour</p>
                <p className="text-xl font-mono font-extrabold text-ink">
                  {formatCurrency(summary.profitPerHour)}/hr
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/90 border border-paper-lines rounded-xl shadow-sm flex items-center gap-3">
              <Sticker name={summary.worthItSticker || 'star'} size={32} />
              <div>
                <p className="text-[11px] font-bold text-ink-faint uppercase">Verdict</p>
                <p className="text-sm font-handwritten font-bold text-mint-dark truncate">
                  {summary.worthItVerdict}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Tasks as Sticky Notes & Upcoming Deadlines as Ticket Stubs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Sticky Note Task Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sticker name="checklist" size={26} />
              <h3 className="font-handwritten text-3xl font-bold text-ink">Today's Sticky Notes</h3>
            </div>
            <span className="text-xs font-mono font-bold text-ink-faint">
              {tasks.filter((t) => t.status === 'Done').length} / {tasks.length} Completed
            </span>
          </div>

          {/* Quick task input */}
          {user?.role !== 'COLLABORATOR' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quickTaskText.trim()) createTaskMutation.mutate(quickTaskText.trim());
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={quickTaskText}
                onChange={(e) => setQuickTaskText(e.target.value)}
                placeholder="Jot down a quick task..."
                className="flex-1 px-4 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-mint shadow-sm"
              />
              <button
                type="submit"
                disabled={!quickTaskText.trim() || createTaskMutation.isPending}
                className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Stick Note</span>
              </button>
            </form>
          )}

          {tasks.length === 0 ? (
            <div className="p-8 bg-paper-cream border-2 border-dashed border-paper-border rounded-2xl text-center">
              <Sticker name="sparkle" size={40} className="mx-auto mb-2" />
              <p className="font-handwritten text-xl font-bold text-ink">All tasks cleared for today!</p>
              <p className="text-xs text-ink-light">Add a note or review your upcoming collaborations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tasks.map((task, idx) => {
                const colors = ['yellow', 'pink', 'mint', 'blue', 'lavender'] as const;
                const noteColor = colors[idx % colors.length];
                const isDone = task.status === 'Done';

                return (
                  <StickyNote
                    key={task.id || (task as any)._id}
                    color={noteColor}
                    rotation={(idx % 3) - 1}
                    className={isDone ? 'opacity-65' : ''}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <button
                            onClick={() =>
                              toggleTaskMutation.mutate({
                                taskId: task.id || (task as any)._id,
                                currentStatus: task.status,
                              })
                            }
                            className="text-ink hover:text-mint-dark transition-colors"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-mint-dark" />
                            ) : (
                              <Circle className="w-4 h-4 text-ink-faint" />
                            )}
                          </button>
                          <span
                            className={`font-handwritten text-lg font-bold leading-tight ${
                              isDone ? 'line-through text-ink-faint' : 'text-ink'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-ink-light line-clamp-2 pl-5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-ink-light">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-ink-faint" />
                        <span>Due {task.dueDate}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/70 text-ink font-bold text-[10px]">
                        {task.priority}
                      </span>
                    </div>
                  </StickyNote>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Upcoming Deadlines as Ticket Stubs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sticker name="calendar" size={26} />
            <h3 className="font-handwritten text-3xl font-bold text-ink">Upcoming Deadlines</h3>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-6 bg-white border border-paper-lines rounded-xl text-center">
                <Sticker name="star" size={32} className="mx-auto mb-2" />
                <p className="font-handwritten text-lg font-bold text-ink">No looming deadlines!</p>
              </div>
            ) : (
              upcomingDeadlines.map((c, idx) => (
                <TicketStub
                  key={c.id || (c as any)._id}
                  title={c.title}
                  subtitle={c.brandName}
                  date={c.deadlineDate}
                  badge={c.status}
                  badgeColor={idx % 2 === 0 ? 'yellow' : 'mint'}
                  rotation={(idx % 2 === 0 ? 1 : -1) * 0.8}
                />
              ))
            )}
          </div>

          {/* Inspirational Creator Doodle Card */}
          <PolaroidCard
            title="Creator Motto"
            subtitle="Consistency beats algorithm changes"
            tapeColor="lavender"
            rotation={1}
            className="mt-6"
          >
            <div className="p-4 bg-paper-cream rounded-xl text-center">
              <Sticker name="rocket" size={48} className="mx-auto mb-2" interactive />
              <p className="font-handwritten text-xl font-bold text-ink">
                "Create with intent, measure with clarity."
              </p>
            </div>
          </PolaroidCard>
        </div>
      </div>
    </div>
  );
};
