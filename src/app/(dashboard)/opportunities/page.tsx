'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Opportunity, SalesStage, User } from '@/types';
import { formatCurrency, formatDate, getStageColor, getStageProbability } from '@/lib/utils';
import { Plus, Target, Search, Filter } from 'lucide-react';

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Opportunity | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    dealValue: '',
    stage: 'Prospecting' as SalesStage,
    expectedCloseDate: '',
    assignedTo: '',
    notes: '',
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [opRes, userRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/users'),
      ]);
      const [opData, userData] = await Promise.all([opRes.json(), userRes.json()]);
      setOpportunities(opData.data || []);
      setUsers(userData.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: '',
      dealValue: '',
      stage: 'Prospecting',
      expectedCloseDate: '',
      assignedTo: user?.id || '',
      notes: '',
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dealValue: parseFloat(form.dealValue) || 0 }),
      });
      setShowCreate(false);
      resetForm();
      await fetchData();
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!showEdit) return;
    setSaving(true);
    try {
      await fetch('/api/opportunities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showEdit.id, ...form, dealValue: parseFloat(form.dealValue) || 0 }),
      });
      setShowEdit(null);
      resetForm();
      await fetchData();
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  }

  function openEdit(op: Opportunity) {
    setForm({
      name: op.name,
      dealValue: op.dealValue.toString(),
      stage: op.stage,
      expectedCloseDate: op.expectedCloseDate,
      assignedTo: op.assignedTo,
      notes: op.notes || '',
    });
    setShowEdit(op);
  }

  const stages: SalesStage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const filtered = opportunities.filter((o) => {
    const matchesSearch = !search || o.name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || o.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const OpportunityForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          placeholder="e.g., Acme Corp — Annual License"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value ($) *</label>
          <input
            type="number"
            value={form.dealValue}
            onChange={(e) => setForm({ ...form, dealValue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
          <input
            type="date"
            value={form.expectedCloseDate}
            onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
        <select
          value={form.stage}
          onChange={(e) => setForm({ ...form, stage: e.target.value as SalesStage })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          {stages.map(s => (
            <option key={s} value={s}>{s} ({getStageProbability(s)}%)</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Probability: {getStageProbability(form.stage)}% · Weighted: {formatCurrency((parseFloat(form.dealValue) || 0) * getStageProbability(form.stage) / 100)}
        </p>
      </div>

      {user?.role === 'founder' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">Select rep...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => { setShowCreate(false); setShowEdit(null); resetForm(); }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update Deal' : 'Create Deal'}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Track and manage active deals through your sales pipeline"
        action={
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Deal
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
            <option value="">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {(['Prospecting', 'Qualification', 'Proposal', 'Negotiation'] as SalesStage[]).map(stage => {
          const stageDeals = opportunities.filter(o => o.stage === stage);
          const total = stageDeals.reduce((s, o) => s + o.dealValue, 0);
          return (
            <div key={stage} className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs text-gray-500 mb-0.5">{stage}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
              <p className="text-xs text-gray-400">{stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Deal</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Stage</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Value</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Weighted</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Close Date</th>
                  {user?.role === 'founder' && (
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Rep</th>
                  )}
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((op) => (
                  <tr key={op.id} className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{op.name}</p>
                      <p className="text-xs text-gray-400">{op.forecastCategory}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${getStageColor(op.stage)}`}>{op.stage}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-right">{formatCurrency(op.dealValue)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{formatCurrency(op.weightedValue)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(op.expectedCloseDate)}</td>
                    {user?.role === 'founder' && (
                      <td className="px-5 py-3.5 text-sm text-gray-600">{op.assignedToName || '—'}</td>
                    )}
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(op)} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={<Target className="w-6 h-6" />} title="No opportunities found" description="Start creating deals to build your pipeline"
          action={!search && !stageFilter ? (
            <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Create First Deal
            </button>
          ) : undefined}
        />
      )}

      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="New Opportunity" maxWidth="max-w-xl">
        <OpportunityForm onSubmit={handleCreate} isEdit={false} />
      </Modal>
      <Modal open={!!showEdit} onClose={() => { setShowEdit(null); resetForm(); }} title="Edit Opportunity" maxWidth="max-w-xl">
        <OpportunityForm onSubmit={handleUpdate} isEdit={true} />
      </Modal>
    </div>
  );
}
