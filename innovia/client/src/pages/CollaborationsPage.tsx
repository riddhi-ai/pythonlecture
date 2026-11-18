import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { StickyNote } from '../components/common/StickyNote';
import { PolaroidCard } from '../components/common/PolaroidCard';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatCurrency, triggerConfetti } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Plus, Handshake, CheckCircle2, Clock, X, DollarSign, Calendar } from 'lucide-react';
import { Collaboration, CollaborationStatus } from '@innovia/shared';

const KANBAN_COLUMNS: CollaborationStatus[] = [
  'Pitched',
  'Negotiating',
  'Signed',
  'In Production',
  'Delivered',
  'Paid',
];

export const CollaborationsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // New Collab Form State
  const [formData, setFormData] = useState({
    brandName: '',
    title: '',
    dealValue: 3000, // in dollars for form input
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Signed' as CollaborationStatus,
    notes: '',
  });

  const { data: collabs = [], isLoading } = useQuery<Collaboration[]>({
    queryKey: ['collaborations'],
    queryFn: () => apiRequest('/collaborations'),
  });

  // Create Collab Mutation
  const createCollabMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/collaborations', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          dealValue: Math.round(data.dealValue * 100), // convert to cents
          deliverables: [
            { id: 'del-1', title: '1x Integrated Video / Reel', completed: false },
            { id: 'del-2', title: '2x Story Swipe-Up Frames', completed: false },
          ],
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      setShowModal(false);
      triggerConfetti();
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CollaborationStatus }) => {
      const updatePayload: any = { status };
      if (status === 'Paid') {
        updatePayload.paymentStatus = 'Paid';
      }
      return apiRequest(`/collaborations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      if (data.status === 'Paid') {
        triggerConfetti();
      }
    },
  });

  if (isLoading) {
    return <PageFlipLoader3D message="Loading collaboration pinboard..." />;
  }

  const isCreator = user?.role === 'CREATOR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Collaborations Kanban Board
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Deals pinned as sticky notes. Drag or click status to advance through production.
          </p>
        </div>

        {isCreator && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Collaboration</span>
          </button>
        )}
      </div>

      {/* Kanban Board of Pinned Sticky Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {KANBAN_COLUMNS.map((column, colIdx) => {
          const items = collabs.filter((c) => c.status === column);
          const colors = ['yellow', 'pink', 'lavender', 'blue', 'mint', 'mint'] as const;
          const noteColor = colors[colIdx];

          return (
            <div
              key={column}
              className="bg-[#FCF8F2]/80 border border-[#E8DCCB] rounded-2xl p-3 min-h-[500px] flex flex-col gap-3 shadow-inner"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-paper-lines px-1">
                <span className="font-handwritten text-xl font-bold text-ink">{column}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-paper-lines text-ink-faint">
                  {items.length}
                </span>
              </div>

              {/* Items in Column */}
              <div className="space-y-3 flex-1">
                {items.map((collab, itemIdx) => {
                  const completedDeliverables = collab.deliverables.filter((d) => d.completed).length;

                  return (
                    <StickyNote
                      key={collab.id || (collab as any)._id}
                      color={noteColor}
                      rotation={(itemIdx % 2 === 0 ? 1 : -1) * 1.2}
                      className="group"
                    >
                      <Link to={`/collaborations/${collab.id || (collab as any)._id}`} className="block">
                        <span className="text-[10px] font-mono uppercase font-bold text-ink-faint">
                          {collab.brandName}
                        </span>
                        <h4 className="font-bold text-ink text-sm leading-snug line-clamp-2 mt-0.5">
                          {collab.title}
                        </h4>

                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span className="font-mono font-extrabold text-mint-dark">
                            {formatCurrency(collab.dealValue)}
                          </span>
                          <span className="text-[10px] font-mono text-ink-faint">
                            {completedDeliverables}/{collab.deliverables.length} Done
                          </span>
                        </div>
                      </Link>

                      {/* Advance Status Dropdown */}
                      {isCreator && (
                        <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between">
                          <span className="text-[10px] text-ink-faint">Move:</span>
                          <select
                            value={collab.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                id: collab.id || (collab as any)._id,
                                status: e.target.value as CollaborationStatus,
                              })
                            }
                            className="text-[10px] font-bold bg-white/80 border border-black/10 rounded px-1.5 py-0.5 text-ink focus:outline-none"
                          >
                            {KANBAN_COLUMNS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </StickyNote>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Collab Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FFF8F0] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape washi-tape-mint w-36 h-6 rotate-[-1deg]" />

            <div className="flex items-center justify-between pb-3 border-b border-paper-lines mb-4">
              <h3 className="font-handwritten text-3xl font-bold text-ink">New Brand Collaboration</h3>
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
                createCollabMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike, Notion, Sony"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Collaboration Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Q3 Product Launch Reel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Deal Value (USD)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.dealValue}
                    onChange={(e) => setFormData({ ...formData, dealValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                  >
                    {KANBAN_COLUMNS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-mint"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-mint"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createCollabMutation.isPending}
                className="w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>{createCollabMutation.isPending ? 'Pinning...' : 'Pin Deal to Board'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
