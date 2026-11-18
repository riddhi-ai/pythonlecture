import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { PaperSpread } from '../components/common/PaperSpread';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatDate, formatCurrency } from '../lib/utils';
import { Bell, CheckCheck, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Notification } from '@innovia/shared';

export const NotificationsRecapPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading: notifsLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiRequest('/notifications'),
  });

  const { data: digest, isLoading: digestLoading } = useQuery<any>({
    queryKey: ['weeklyDigest'],
    queryFn: () => apiRequest('/notifications/digest'),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/notifications/mark-all-read', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (notifsLoading || digestLoading) {
    return <PageFlipLoader3D message="Compiling your weekly journal recap..." />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Journal Recap & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Automated weekly digest summary and priority notification inbox.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="px-3.5 py-2 bg-white border border-paper-lines rounded-xl text-xs font-bold text-ink hover:bg-paper flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-mint-dark" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Two-Page Open Journal Digest Spread */}
      <PaperSpread
        leftContent={
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-faint">
                  Weekly Executive Recap
                </span>
                <h2 className="font-handwritten text-4xl font-bold text-ink mt-0.5">
                  The Week in Review
                </h2>
              </div>
              <Sticker name={digest?.stickerVerdict || 'trophy'} size={48} interactive />
            </div>

            {/* Highlights List */}
            <div className="space-y-3">
              {(digest?.highlights || []).map((highlight: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white/90 border border-paper-lines rounded-xl shadow-sm flex items-start gap-3"
                >
                  <Sticker name="star" size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-ink leading-relaxed font-body">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>

            {/* Digest Metrics Box */}
            <div className="p-4 bg-paper-cream border border-paper-lines rounded-2xl flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] font-bold text-ink-faint uppercase">
                  Completed Collabs
                </span>
                <p className="text-2xl font-mono font-extrabold text-ink mt-0.5">
                  {digest?.completedCollabsCount || 0}
                </p>
              </div>
              <div className="w-px h-8 bg-paper-lines" />
              <div>
                <span className="text-[10px] font-bold text-ink-faint uppercase">Tasks Finished</span>
                <p className="text-2xl font-mono font-extrabold text-mint-dark mt-0.5">
                  {digest?.completedTasksCount || 0}
                </p>
              </div>
              <div className="w-px h-8 bg-paper-lines" />
              <div>
                <span className="text-[10px] font-bold text-ink-faint uppercase">Engagement Benchmark</span>
                <p className="text-2xl font-mono font-extrabold text-coral-dark mt-0.5">
                  {digest?.summary?.averageEngagement || 5.2}%
                </p>
              </div>
            </div>
          </div>
        }
        rightContent={
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-paper-lines">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-ink-faint" />
                <h3 className="font-handwritten text-2xl font-bold text-ink">In-App Alerts</h3>
              </div>
              <span className="text-xs font-mono font-bold text-ink-faint">
                {unreadCount} unread
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-ink-faint italic p-4 bg-white/60 rounded-xl text-center">
                  Your notification inbox is clean!
                </p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id || (notif as any)._id}
                    onClick={() =>
                      !notif.isRead && markReadMutation.mutate(notif.id || (notif as any)._id)
                    }
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      notif.isRead
                        ? 'bg-white/70 border-paper-lines opacity-75'
                        : 'bg-white border-coral-border shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sticker
                          name={
                            notif.type === 'DEADLINE'
                              ? 'mood_deadline'
                              : notif.type === 'PAYMENT'
                              ? 'coin'
                              : notif.type === 'INSIGHT'
                              ? 'sparkle'
                              : 'bell'
                          }
                          size={22}
                        />
                        <h4 className="font-bold text-xs text-ink">{notif.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-ink-faint">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-light font-body mt-1 pl-7">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        }
      />
    </div>
  );
};
