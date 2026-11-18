import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { StickyNote } from '../components/common/StickyNote';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatDate, triggerConfetti } from '../lib/utils';
import { Plus, Play, Pause, Clock, CheckCircle2, User, X } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TimeLog } from '@innovia/shared';

const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // New task form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do' as TaskStatus,
    priority: 'Medium' as TaskPriority,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 2,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiRequest('/tasks'),
  });

  const { data: timeLogs = [] } = useQuery<TimeLog[]>({
    queryKey: ['timeLogs'],
    queryFn: () => apiRequest('/tasks/time/logs'),
  });

  // Ticking stopwatch effect for running timer
  useEffect(() => {
    const running = timeLogs.find((t) => t.isRunning);
    if (running) {
      setActiveTimerTask(running.taskId);
      const start = new Date(running.startTime).getTime();
      const interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setActiveTimerTask(null);
      setElapsedSeconds(0);
    }
  }, [timeLogs]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowModal(false);
      triggerConfetti();
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      return apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      if (data.status === 'Done') {
        triggerConfetti();
      }
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/tasks/${taskId}/timer/start`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/tasks/${taskId}/timer/stop`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      triggerConfetti();
    },
  });

  if (tasksLoading) {
    return <PageFlipLoader3D message="Loading production task board..." />;
  }

  const formatStopwatch = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Stopwatch Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Task Board & Live Time Tracker
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Auto-starts when moving tasks to In Progress. Tracks working hours to compute true profit per hour.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Active Stopwatch Notification if timer is running */}
      {activeTimerTask && (
        <div className="p-4 bg-mint border-2 border-mint-border rounded-2xl shadow-scrapbook flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Sticker name="clock" size={32} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mint-dark">
                Live Time Tracker Running
              </p>
              <p className="font-mono text-2xl font-extrabold text-ink">
                {formatStopwatch(elapsedSeconds)}
              </p>
            </div>
          </div>
          <button
            onClick={() => stopTimerMutation.mutate(activeTimerTask)}
            className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
          >
            <Pause className="w-4 h-4" />
            <span>Pause & Log Time</span>
          </button>
        </div>
      )}

      {/* Kanban Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TASK_STATUSES.map((status, colIdx) => {
          const items = tasks.filter((t) => t.status === status);
          const colors = ['yellow', 'blue', 'lavender', 'mint'] as const;
          const noteColor = colors[colIdx];

          return (
            <div
              key={status}
              className="bg-[#FCF8F2] border border-[#E8DCCB] rounded-2xl p-3 min-h-[500px] flex flex-col gap-3 shadow-inner"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-paper-lines px-1">
                <span className="font-handwritten text-2xl font-bold text-ink">{status}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-paper-lines text-ink-faint">
                  {items.length}
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3 flex-1">
                {items.map((task) => {
                  const isRunningThis = activeTimerTask === (task.id || (task as any)._id);

                  return (
                    <StickyNote
                      key={task.id || (task as any)._id}
                      color={noteColor}
                      className="group"
                    >
                      <h4 className="font-bold text-ink text-sm leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-ink-light font-body mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-ink-light">
                        <span>Due: {task.dueDate}</span>
                        <span className="font-bold text-mint-dark">
                          {task.actualHours || 0} / {task.estimatedHours}h
                        </span>
                      </div>

                      {/* Timer & Status Controls */}
                      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between">
                        {status === 'In Progress' ? (
                          isRunningThis ? (
                            <button
                              onClick={() => stopTimerMutation.mutate(task.id || (task as any)._id)}
                              className="px-2 py-1 rounded bg-coral text-coral-dark text-[10px] font-bold flex items-center gap-1"
                            >
                              <Pause className="w-3 h-3" />
                              <span>Stop Timer</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => startTimerMutation.mutate(task.id || (task as any)._id)}
                              className="px-2 py-1 rounded bg-mint text-mint-dark text-[10px] font-bold flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Start Timer</span>
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-ink-faint">{task.priority}</span>
                        )}

                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTaskStatusMutation.mutate({
                              id: task.id || (task as any)._id,
                              status: e.target.value as TaskStatus,
                            })
                          }
                          className="text-[10px] font-bold bg-white/80 border border-black/10 rounded px-1.5 py-0.5 text-ink focus:outline-none"
                        >
                          {TASK_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </StickyNote>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FFF8F0] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape washi-tape-lavender w-36 h-6 rotate-[-1deg]" />

            <div className="flex items-center justify-between pb-3 border-b border-paper-lines mb-4">
              <h3 className="font-handwritten text-3xl font-bold text-ink">Add Task to Board</h3>
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
                createTaskMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Color grade A-roll, Record audio voiceover"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements, LUT presets, or clip references..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-xs text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent 🚨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm font-mono text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>{createTaskMutation.isPending ? 'Pinning...' : 'Stick to Board'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
