import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker } from '../stickers/Sticker';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { formatCurrency, formatDate, triggerConfetti } from '../lib/utils';
import { Plus, Receipt, CheckCircle, Clock, X, DollarSign, RefreshCw, FileText } from 'lucide-react';
import { Expense, ExpenseCategory, Payment } from '@innovia/shared';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'equipment',
  'props',
  'travel',
  'editing',
  'ads',
  'software',
  'team_payment',
  'other',
];

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'expenses' | 'recurring' | 'payments'>('expenses');
  const [showModal, setShowModal] = useState(false);

  // New Expense Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'props' as ExpenseCategory,
    amount: 150, // in dollars
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: () => apiRequest('/expenses'),
  });

  const { data: recurring = [] } = useQuery<any[]>({
    queryKey: ['recurringExpenses'],
    queryFn: () => apiRequest('/expenses/recurring'),
    enabled: user?.role === 'CREATOR',
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => apiRequest('/expenses/payments'),
  });

  // Create Expense Mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          amount: Math.round(data.amount * 100), // convert to cents
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowModal(false);
      triggerConfetti();
    },
  });

  // Approve Expense Mutation
  const approveExpenseMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/expenses/${id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ approvalStatus: status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  // Pay Team Payment Mutation
  const payPaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/expenses/payments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Paid' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      triggerConfetti();
    },
  });

  if (expensesLoading) {
    return <PageFlipLoader3D message="Loading production expenses ledger..." />;
  }

  const isCreator = user?.role === 'CREATOR';
  const totalProductionExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Expense & Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Log camera gear, props, travel, software, and team member payouts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreator ? 'Record Expense' : 'Submit Expense'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-paper-lines pb-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expenses'
              ? 'bg-ink text-white shadow-sm'
              : 'text-ink-light hover:bg-white hover:text-ink'
          }`}
        >
          Production Expenses ({expenses.length})
        </button>
        {isCreator && (
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recurring'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-light hover:bg-white hover:text-ink'
            }`}
          >
            Recurring Subscriptions ({recurring.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-ink text-white shadow-sm'
              : 'text-ink-light hover:bg-white hover:text-ink'
          }`}
        >
          Team Member Payouts ({payments.length})
        </button>
      </div>

      {/* Tab 1: Production Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-paper-lines text-ink-faint font-mono uppercase">
                  <th className="pb-3">Item Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Status</th>
                  {isCreator && <th className="pb-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-lines font-body">
                {expenses.map((expense) => (
                  <tr key={expense.id || (expense as any)._id} className="hover:bg-paper/40">
                    <td className="py-3 font-bold text-ink">
                      {expense.title}
                      {expense.receiptUrl && (
                        <span className="ml-2 text-[10px] text-mint-dark font-mono bg-mint/50 px-1.5 py-0.5 rounded">
                          Receipt attached
                        </span>
                      )}
                    </td>
                    <td className="py-3 capitalize">
                      <span className="px-2 py-0.5 rounded-full bg-paper border border-paper-lines text-ink-light text-[11px]">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-ink-light">{formatDate(expense.date)}</td>
                    <td className="py-3 font-mono font-bold text-right text-coral-dark">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          expense.approvalStatus === 'Approved'
                            ? 'bg-mint text-mint-dark'
                            : expense.approvalStatus === 'Pending'
                            ? 'bg-butter text-butter-dark'
                            : 'bg-coral text-coral-dark'
                        }`}
                      >
                        {expense.approvalStatus}
                      </span>
                    </td>
                    {isCreator && (
                      <td className="py-3 text-center">
                        {expense.approvalStatus === 'Pending' && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() =>
                                approveExpenseMutation.mutate({
                                  id: expense.id || (expense as any)._id,
                                  status: 'Approved',
                                })
                              }
                              className="px-2 py-1 bg-mint text-mint-dark rounded-lg text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                approveExpenseMutation.mutate({
                                  id: expense.id || (expense as any)._id,
                                  status: 'Rejected',
                                })
                              }
                              className="px-2 py-1 bg-coral text-coral-dark rounded-lg text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Recurring Subscriptions */}
      {activeTab === 'recurring' && isCreator && (
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook space-y-4">
          <p className="text-xs text-ink-light font-body">
            Recurring expenses auto-generate on the 1st of every month via our scheduled cron automation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recurring.map((rec) => (
              <div
                key={rec._id || rec.id}
                className="p-4 bg-paper-cream border border-paper-lines rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-ink text-sm">{rec.title}</h4>
                  <p className="text-xs text-ink-faint font-mono capitalize">
                    {rec.category} • {rec.frequency}
                  </p>
                  <p className="text-[11px] text-ink-light mt-1">Next Run: {rec.nextRunDate}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-extrabold text-ink block">
                    {formatCurrency(rec.amount)}/mo
                  </span>
                  <span className="text-[10px] font-bold text-mint-dark bg-mint px-2 py-0.5 rounded-full inline-block mt-1">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Team Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-paper-lines text-ink-faint font-mono uppercase">
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3">Reference / Task Details</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Status</th>
                  {isCreator && <th className="pb-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-lines font-body">
                {payments.map((payment) => (
                  <tr key={payment.id || (payment as any)._id} className="hover:bg-paper/40">
                    <td className="py-3 font-bold text-ink">{payment.recipientName}</td>
                    <td className="py-3 text-ink-light font-mono text-[11px]">
                      {payment.referenceNote || 'Hourly task completion batch'}
                    </td>
                    <td className="py-3 font-mono font-bold text-right text-ink">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          payment.status === 'Paid'
                            ? 'bg-mint text-mint-dark'
                            : payment.status === 'Approved'
                            ? 'bg-butter text-butter-dark'
                            : 'bg-lavender text-ink'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    {isCreator && (
                      <td className="py-3 text-center">
                        {payment.status !== 'Paid' && (
                          <button
                            onClick={() => payPaymentMutation.mutate(payment.id || (payment as any)._id)}
                            className="px-3 py-1 bg-mint text-mint-dark font-bold rounded-lg text-xs hover:bg-mint-border transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FFF8F0] border-2 border-paper-border rounded-3xl p-6 sm:p-8 shadow-scrapbook">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape washi-tape-pink w-36 h-6 rotate-[-1deg]" />

            <div className="flex items-center justify-between pb-3 border-b border-paper-lines mb-4">
              <h3 className="font-handwritten text-3xl font-bold text-ink">
                {isCreator ? 'Record Production Expense' : 'Submit Expense for Approval'}
              </h3>
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
                createExpenseMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Expense Title / Item</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Props, Sony Cage Rig, Travel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm capitalize text-ink focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm font-mono text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-paper-lines rounded-xl text-sm text-ink font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="w-full py-3 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>{createExpenseMutation.isPending ? 'Saving...' : 'Add to Ledger'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
