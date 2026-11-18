import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { PaperSpread } from '../components/common/PaperSpread';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatCurrency, formatDate, triggerConfetti } from '../lib/utils';
import { ArrowLeft, CheckCircle2, Circle, Upload, MessageSquare, Send, FileText } from 'lucide-react';
import { Collaboration } from '@innovia/shared';

export const CollabDetailSpread: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [briefTitle, setBriefTitle] = useState('');
  const [showBriefInput, setShowBriefInput] = useState(false);

  const { data: collab, isLoading } = useQuery<Collaboration>({
    queryKey: ['collaboration', id],
    queryFn: () => apiRequest(`/collaborations/${id}`),
  });

  // Toggle Deliverable Mutation
  const toggleDeliverableMutation = useMutation({
    mutationFn: async (deliverableId: string) => {
      return apiRequest(`/collaborations/${id}/deliverables/${deliverableId}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      triggerConfetti();
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      return apiRequest(`/collaborations/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      setCommentText('');
    },
  });

  // Add Brief Mutation
  const addBriefMutation = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest(`/collaborations/${id}/briefs`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          url: 'https://assets.innovia.local/brief-spec.pdf',
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      setBriefTitle('');
      setShowBriefInput(false);
    },
  });

  if (isLoading || !collab) {
    return <PageFlipLoader3D message="Opening two-page collaboration journal..." />;
  }

  const isCreator = user?.role === 'CREATOR';
  const completedDeliverables = collab.deliverables.filter((d) => d.completed).length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/collaborations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-ink-dark bg-white border border-paper-lines px-3.5 py-1.5 rounded-full shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Kanban Board</span>
        </Link>
      </div>

      {/* Two-Page Open Journal Spread */}
      <PaperSpread
        leftContent={
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-faint">
                {collab.brandName} • Campaign Journal
              </span>
              <h2 className="font-handwritten text-4xl sm:text-5xl font-bold text-ink mt-0.5">
                {collab.title}
              </h2>
            </div>

            {/* Deal Snapshot Box */}
            <div className="p-4 bg-white/90 border border-paper-lines rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-faint">Deal Compensation</span>
                <span className="font-mono text-2xl font-extrabold text-mint-dark">
                  {formatCurrency(collab.dealValue)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-paper-lines text-xs">
                <div>
                  <span className="text-ink-faint">Status: </span>
                  <span className="font-bold text-ink">{collab.status}</span>
                </div>
                <div>
                  <span className="text-ink-faint">Payment: </span>
                  <span className="font-bold text-ink">{collab.paymentStatus}</span>
                </div>
                <div>
                  <span className="text-ink-faint">Start Date: </span>
                  <span className="font-bold text-ink">{collab.startDate}</span>
                </div>
                <div>
                  <span className="text-ink-faint">Target Deadline: </span>
                  <span className="font-bold text-coral-dark">{collab.deadlineDate}</span>
                </div>
              </div>
            </div>

            {/* Deliverables Checklist with interactive completion */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sticker name="checklist" size={24} />
                  <h3 className="font-handwritten text-2xl font-bold text-ink">Deliverables</h3>
                </div>
                <span className="text-xs font-mono font-bold text-ink-faint">
                  {completedDeliverables} / {collab.deliverables.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {collab.deliverables.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleDeliverableMutation.mutate(item.id)}
                    className="p-3 bg-white/80 border border-paper-lines rounded-xl flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-mint-dark" />
                      ) : (
                        <Circle className="w-5 h-5 text-ink-faint group-hover:text-ink" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          item.completed ? 'line-through text-ink-faint' : 'text-ink'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    {item.dueDate && (
                      <span className="text-[10px] font-mono text-ink-faint">
                        Due {item.dueDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Notes & Talking Points */}
            {collab.notes && (
              <div className="p-3.5 bg-paper-cream border border-paper-lines rounded-xl">
                <p className="text-xs font-bold text-ink-faint uppercase mb-1">Key Talking Points:</p>
                <p className="text-xs text-ink-light font-body leading-relaxed">{collab.notes}</p>
              </div>
            )}
          </div>
        }
        rightContent={
          <div className="space-y-6">
            {/* Uploaded Briefs & Guidelines */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sticker name="contract" size={24} />
                  <h3 className="font-handwritten text-2xl font-bold text-ink">Asset Briefs & Files</h3>
                </div>
                <button
                  onClick={() => setShowBriefInput(!showBriefInput)}
                  className="text-xs font-bold text-ink-dark hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Brief</span>
                </button>
              </div>

              {showBriefInput && (
                <div className="p-3 bg-white border border-paper-lines rounded-xl mb-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Brief or guideline file name..."
                    value={briefTitle}
                    onChange={(e) => setBriefTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-paper text-xs rounded-lg border border-paper-lines focus:outline-none"
                  />
                  <button
                    onClick={() => briefTitle.trim() && addBriefMutation.mutate(briefTitle.trim())}
                    className="px-3 py-1.5 bg-ink text-white text-xs font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {(collab.briefs || []).length === 0 ? (
                  <p className="text-xs text-ink-faint italic p-3 bg-white/60 rounded-xl">
                    No briefs uploaded yet.
                  </p>
                ) : (
                  (collab.briefs || []).map((brief) => (
                    <div
                      key={brief.id}
                      className="p-3 bg-white/80 border border-paper-lines rounded-xl flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-ink-faint" />
                        <div>
                          <p className="text-xs font-bold text-ink">{brief.title}</p>
                          <p className="text-[10px] text-ink-faint">
                            Uploaded by {brief.uploaderRole} • {formatDate(brief.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={brief.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-ink underline decoration-mint"
                      >
                        View
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feedback & Client Review Comments Thread */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Sticker name="comment" size={24} />
                <h3 className="font-handwritten text-2xl font-bold text-ink">
                  Feedback & Deliverable Review
                </h3>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(collab.feedbackComments || []).length === 0 ? (
                  <p className="text-xs text-ink-faint italic p-3 bg-white/60 rounded-xl">
                    No feedback comments logged yet.
                  </p>
                ) : (
                  (collab.feedbackComments || []).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white/90 border border-paper-lines rounded-xl shadow-sm space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-ink">{c.authorName}</span>
                        <span className="font-mono text-ink-faint">{formatDate(c.date)}</span>
                      </div>
                      <p className="text-xs text-ink-light font-body leading-relaxed">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (commentText.trim()) addCommentMutation.mutate(commentText.trim());
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave review feedback or approval notes..."
                  className="flex-1 px-3 py-2 bg-white border border-paper-lines rounded-xl text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-mint shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="px-3.5 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        }
      />
    </div>
  );
};
