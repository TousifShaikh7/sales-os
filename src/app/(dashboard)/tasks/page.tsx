'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Task, TaskStatus, TaskPriority, Opportunity, User } from '@/types';
import { formatDate, getTaskStatusColor, getPriorityColor, isOverdue } from '@/lib/utils';
import { Plus, CheckSquare, Search, Filter, AlertTriangle } from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    opportunityId: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium' as TaskPriority,
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [taskRes, opRes, userRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/opportunities'),
        fetch('/api/users'),
      ]);
      const [taskData, opData, userData] = await Promise.all([taskRes.json(), opRes.json(), userRes.json()]);
      setTasks(taskData.data || []);
      setOpportunities(opData.data || []);
      setUsers(userData.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: '', description: '', opportunityId: '', assignedTo: '', dueDate: '', priority: 'Medium' });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/tasks', {
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

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  }

  const statuses: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Overdue'];
  const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

  const filtered = tasks.filter(t => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueTasks = tasks.filter(t => t.status === 'Overdue' || (t.dueDate && isOverdue(t.dueDate) && t.status !== 'Completed'));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage action items and track their completion"
        action={
          user?.role === 'founder' ? (
            <button onClick={() => { resetForm(); setShowCreate(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Assign Task
            </button>
          ) : undefined
        }
      />

      {/* Overdue banner */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-600">These tasks need immediate attention</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Task Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div key={task.id} className={`bg-white rounded-xl border p-4 card-hover ${
              task.status === 'Overdue' ? 'border-red-200' : 'border-gray-100'
            }`}>
              <div className="flex items-start flex-col sm:flex-row sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-sm font-medium ${
                      task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}>{task.title}</h3>
                    <span className={`badge ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className={`badge ${getTaskStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                  {task.description && <p className="text-sm text-gray-500 mb-2">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>Due: {formatDate(task.dueDate)}</span>
                    {task.opportunityName && <span>Deal: {task.opportunityName}</span>}
                    {task.assignedToName && <span>Assigned to: {task.assignedToName}</span>}
                  </div>
                </div>

                {/* Status actions */}
                {task.status !== 'Completed' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.status === 'Not Started' && (
                      <button onClick={() => updateTaskStatus(task.id, 'In Progress')}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                        Start
                      </button>
                    )}
                    <button onClick={() => updateTaskStatus(task.id, 'Completed')}
                      className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium">
                      Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<CheckSquare className="w-6 h-6" />} title="No tasks found" description={search || statusFilter ? 'Try adjusting your filters' : 'No tasks have been assigned yet'} />
      )}

      {/* Create Modal (Founder only) */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Assign Task" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., Follow up with Acme Corp" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required>
                <option value="">Select rep...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Opportunity</label>
              <select value={form.opportunityId} onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                <option value="">None</option>
                {opportunities.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); resetForm(); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
