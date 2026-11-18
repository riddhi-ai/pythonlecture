import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatNumber, formatDate, triggerConfetti } from '../lib/utils';
import { Plus, Calendar, List, Eye, Heart, MessageCircle, Share2, Bookmark, UserPlus, X, Edit3 } from 'lucide-react';
import { Content, PlatformType, ContentFormat, ContentStatus } from '@innovia/shared';

export const ContentPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    platform: 'Instagram' as PlatformType,
    type: 'Reel' as ContentFormat,
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Planned' as ContentStatus,
    views: 12000,
    likes: 950,
    comments: 85,
    shares: 60,
    saves: 140,
  });

  const { data: contents = [], isLoading } = useQuery<any[]>({
    queryKey: ['contents'],
    queryFn: () => apiRequest('/content'),
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/content', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          platform: data.platform,
          type: data.type,
          publishDate: data.publishDate,
          status: data.status,
          metrics: {
            views: data.views,
            likes: data.likes,
            comments: data.comments,
            shares: data.shares,
            saves: data.saves,
            followersGained: Math.floor(data.views * 0.005),
          },
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      setShowModal(false);
      triggerConfetti();
    },
  });

  if (isLoading) {
    return <PageFlipLoader3D message="Loading your content journal & calendar..." />;
  }

  const isCreator = user?.role === 'CREATOR';

  // Group by date for calendar view
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Content & Performance Hub
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Log your published reels, shorts, videos and track true engagement rates.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex bg-white border border-paper-lines rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-ink text-white' : 'text-ink-light hover:bg-paper'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'calendar' ? 'bg-ink text-white' : 'text-ink-light hover:bg-paper'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {isCreator && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Content</span>
            </button>
          )}
        </div>
      </div>

      {/* View Mode: List View */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contents.map((item) => {
            const m = item.metrics || {};
            const engRate = m.engagementRate || 0;

            return (
              <div
                key={item.id || item._id}
                className="bg-white border-2 border-paper-border rounded-2xl p-5 shadow-scrapbook hover:shadow-lg transition-all relative group"
              >
                {/* Format Sticker */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Sticker
                      name={
                        item.type === 'Reel'
                          ? 'reels_icon'
                          : item.type === 'Short'
                          ? 'shorts_icon'
                          : item.type === 'Video'
                          ? 'video_icon'
                          : 'post_icon'
                      }
                      size={28}
                    />
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-ink-faint">
                        {item.platform} • {item.type}
                      </span>
                      <h3 className="font-bold text-ink text-base leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-paper border border-paper-lines text-ink font-bold whitespace-nowrap">
                    {formatDate(item.publishDate)}
                  </span>
                </div>

                {/* Social Metrics Bar */}
                <div className="grid grid-cols-4 gap-1 p-2.5 bg-paper-cream border border-paper-lines rounded-xl text-center text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-ink-faint block">Views</span>
                    <span className="font-bold text-ink">{formatNumber(m.views)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-faint block">Likes</span>
                    <span className="font-bold text-ink">{formatNumber(m.likes)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-faint block">Comments</span>
                    <span className="font-bold text-ink">{formatNumber(m.comments)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-faint block">Saves</span>
                    <span className="font-bold text-ink">{formatNumber(m.saves)}</span>
                  </div>
                </div>

                {/* Engagement Badge */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-ink-light">Auto Engagement Rate:</span>
                  <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-mint text-mint-dark border border-mint-border">
                    {engRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar View with stickers on publish dates */
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-paper-lines">
            <h3 className="font-handwritten text-3xl font-bold text-ink">
              {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <span className="text-xs text-ink-faint font-mono">Stickers Mark Scheduled Releases</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-ink-faint mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                day
              ).padStart(2, '0')}`;
              const dayContents = contents.filter((c) => c.publishDate?.startsWith(dateStr));

              return (
                <div
                  key={day}
                  className="min-h-[85px] p-2 bg-[#FCF8F2] border border-[#E8DCCB] rounded-xl flex flex-col justify-between"
                >
                  <span className="text-xs font-mono font-bold text-ink-light text-left">{day}</span>
                  <div className="flex flex-wrap gap-1 justify-center my-1">
                    {dayContents.map((c) => (
                      <div key={c.id || c._id} title={c.title}>
                        <Sticker
                          name={
                            c.type === 'Reel'
                              ? 'reels_icon'
                              : c.type === 'Short'
                              ? 'shorts_icon'
                              : 'video_icon'
                          }
                          size={24}
                          interactive
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan New Content Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FFF8F0] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape washi-tape-pink w-36 h-6 rotate-[-1deg]" />

            <div className="flex items-center justify-between pb-3 border-b border-paper-lines mb-4">
              <h3 className="font-handwritten text-3xl font-bold text-ink">Plan New Content Post</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-paper-lines text-ink-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createContentMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Content Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Editing Secrets I Wish I Knew Earlier"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Twitter/X">Twitter/X</option>
                    <option value="Blog">Blog</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Format</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none"
                  >
                    <option value="Reel">Reel (9:16)</option>
                    <option value="Short">Short (9:16)</option>
                    <option value="Video">Video (16:9)</option>
                    <option value="Post">Post / Carousel</option>
                    <option value="Story">Story</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Publish Date</label>
                  <input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Filming">Filming</option>
                    <option value="Editing">Editing</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              {/* Initial Metrics inputs */}
              <div className="pt-2 border-t border-paper-lines">
                <p className="text-xs font-bold text-ink-faint uppercase mb-2">Social Performance Numbers:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-ink-light">Views</label>
                    <input
                      type="number"
                      value={formData.views}
                      onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1 bg-white border border-paper-lines rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-light">Likes</label>
                    <input
                      type="number"
                      value={formData.likes}
                      onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1 bg-white border border-paper-lines rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-light">Comments</label>
                    <input
                      type="number"
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1 bg-white border border-paper-lines rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={createContentMutation.isPending}
                className="w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>{createContentMutation.isPending ? 'Logging...' : 'Log Content in Journal'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
