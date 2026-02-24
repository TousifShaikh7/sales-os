'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Activity, ActivityType, Opportunity } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Activity as ActivityIcon, Search, Phone, Mail, Users2, Monitor, MapPin } from 'lucide-react';

const activityTypeIcons: Record<ActivityType, React.ReactNode> = {
  'Call': <Phone className="w-3.5 h-3.5" />,
  'Email': <Mail className="w-3.5 h-3.5" />,
  'Meeting': <Users2 className="w-3.5 h-3.5" />,
  'Demo': <Monitor className="w-3.5 h-3.5" />,
  'Site Visit': <MapPin className="w-3.5 h-3.5" />,
};

const activityTypeColors: Record<ActivityType, string> = {
  'Call': 'bg-green-50 text-green-600',
  'Email': 'bg-blue-50 text-blue-600',
  'Meeting': 'bg-purple-50 text-purple-600',
  'Demo': 'bg-orange-50 text-orange-600',
  'Site Visit': 'bg-pink-50 text-pink-600',
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    opportunityId: '',
    type: 'Call' as ActivityType,
    description: '',
    outcome: '',
    date: new Date().toISOString().split('T')[0],
    nextFollowUp: '',
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [actRes, opRes] = await Promise.all([
        fetch('/api/activities'),
        fetch('/api/opportunities'),
      ]);
      const [actData, opData] = await Promise.all([actRes.json(), opRes.json()]);
      setActivities(actData.data || []);
      setOpportunities(opData.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      opportunityId: '',
      type: 'Call',
      description: '',
      outcome: '',
      date: new Date().toISOString().split('T')[0],
      nextFollowUp: '',
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  const types: ActivityType[] = ['Call', 'Email', 'Meeting', 'Demo', 'Site Visit'];

  const filtered = activities.filter((a) => {
    const matchesSearch = !search || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Log and track all interactions with prospects"
        action={
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Log Activity
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Activity List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl border border-gray-100 p-4 card-hover">
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${activityTypeColors[activity.type]}`}>
                  {activityTypeIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{activity.type}</span>
                    {activity.opportunityName && (
                      <span className="text-xs text-gray-400">· {activity.opportunityName}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  {activity.outcome && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Outcome:</span> {activity.outcome}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                    <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
                    {activity.performedByName && (
                      <span className="text-xs text-gray-400">by {activity.performedByName}</span>
                    )}
                    {activity.nextFollowUp && (
                      <span className="text-xs text-indigo-500">Follow-up: {formatDate(activity.nextFollowUp)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<ActivityIcon className="w-6 h-6" />} title="No activities logged" description="Start logging calls, emails and meetings to track interactions"
          action={
            <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Log First Activity
            </button>
          }
        />
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Log Activity" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity *</label>
            <select value={form.opportunityId} onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required>
              <option value="">Select opportunity...</option>
              {opportunities.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              placeholder="What happened during this interaction?" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <input type="text" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., Positive, needs follow-up" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-Up Date</label>
            <input type="date" value={form.nextFollowUp} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); resetForm(); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
