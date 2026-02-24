'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import { User, UserRole } from '@/types';
import { Plus, Settings, Shield, Users } from 'lucide-react';

export default function TeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'field_sales' as UserRole,
  });

  useEffect(() => {
    if (user && user.role !== 'founder') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'field_sales' });
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  const roleLabels: Record<UserRole, string> = {
    founder: 'Founder (Admin)',
    field_sales: 'Field Sales Rep',
    inside_sales: 'Inside Sales Rep',
  };

  const roleColors: Record<UserRole, string> = {
    founder: 'bg-purple-100 text-purple-800',
    field_sales: 'bg-blue-100 text-blue-800',
    inside_sales: 'bg-green-100 text-green-800',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Team Management"
        description="Manage sales team members and their roles"
        action={
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-5 card-hover">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-indigo-600">
                  {member.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                <span className={`badge ${roleColors[member.role]} mt-2`}>
                  {roleLabels[member.role]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Permissions Guide */}
      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          Role Permissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-purple-700 mb-2">Founder (Admin)</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Full access to all data</li>
              <li>• Dashboard with full pipeline</li>
              <li>• Assign tasks to reps</li>
              <li>• View all rep performance</li>
              <li>• See projections & forecasts</li>
              <li>• Manage team members</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-700 mb-2">Field Sales Reps</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Add and update their leads</li>
              <li>• Log activities on deals</li>
              <li>• Update deal stages</li>
              <li>• View own dashboard</li>
              <li>• Own performance metrics</li>
              <li className="text-red-500">• Cannot view other reps&apos; deals</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-700 mb-2">Inside Sales Reps</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Add and update their leads</li>
              <li>• Log activities on deals</li>
              <li>• Update deal stages</li>
              <li>• View own dashboard</li>
              <li>• Own performance metrics</li>
              <li className="text-red-500">• Cannot view other reps&apos; deals</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setError(''); }} title="Add Team Member">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" minLength={6} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="field_sales">Field Sales Rep</option>
              <option value="inside_sales">Inside Sales Rep</option>
              <option value="founder">Founder (Admin)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); setError(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Creating...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
