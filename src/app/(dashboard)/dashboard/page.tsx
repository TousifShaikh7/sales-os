'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Opportunity, Lead, Task, Activity } from '@/types';
import { formatCurrency, getStageColor, formatDate, isOverdue } from '@/lib/utils';
import {
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity as ActivityIcon,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [opRes, leadRes, taskRes, actRes] = await Promise.all([
          fetch('/api/opportunities'),
          fetch('/api/leads'),
          fetch('/api/tasks'),
          fetch('/api/activities'),
        ]);
        const [opData, leadData, taskData, actData] = await Promise.all([
          opRes.json(),
          leadRes.json(),
          taskRes.json(),
          actRes.json(),
        ]);
        setOpportunities(opData.data || []);
        setLeads(leadData.data || []);
        setTasks(taskData.data || []);
        setActivities(actData.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const activeDeals = opportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage));
  const wonDeals = opportunities.filter(o => o.stage === 'Closed Won');
  const totalPipeline = activeDeals.reduce((sum, o) => sum + o.dealValue, 0);
  const totalWon = wonDeals.reduce((sum, o) => sum + o.dealValue, 0);
  const weightedForecast = activeDeals.reduce((sum, o) => sum + o.weightedValue, 0);
  const overdueTasks = tasks.filter(t => t.status === 'Overdue' || (t.dueDate && isOverdue(t.dueDate) && t.status !== 'Completed'));
  const newLeads = leads.filter(l => l.status === 'New');
  const recentActivities = activities.slice(0, 5);
  const upcomingTasks = tasks
    .filter(t => t.status !== 'Completed')
    .slice(0, 5);

  // Pipeline by stage
  const stages: Opportunity['stage'][] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];
  const pipelineByStage = stages.map(stage => ({
    stage,
    count: activeDeals.filter(o => o.stage === stage).length,
    value: activeDeals.filter(o => o.stage === stage).reduce((sum, o) => sum + o.dealValue, 0),
  }));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        description={`Here's what's happening with your sales ${user?.role === 'founder' ? 'pipeline' : 'deals'} today.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Pipeline"
          value={formatCurrency(totalPipeline)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          label="Active Deals"
          value={activeDeals.length}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label={user?.role === 'founder' ? 'Weighted Forecast' : 'Won Revenue'}
          value={formatCurrency(user?.role === 'founder' ? weightedForecast : totalWon)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Overdue Tasks"
          value={overdueTasks.length}
          trend={overdueTasks.length > 0 ? 'down' : 'neutral'}
          change={overdueTasks.length > 0 ? 'Needs attention' : 'All clear'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Pipeline Overview</h2>
            <Link href="/opportunities" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pipelineByStage.length > 0 ? (
            <div className="space-y-3">
              {pipelineByStage.map((item) => (
                <div key={item.stage} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className={`badge ${getStageColor(item.stage)} w-fit sm:w-28 flex-shrink-0 justify-center`}>
                    {item.stage}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{
                          width: `${totalPipeline > 0 ? (item.value / totalPipeline) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 sm:w-32">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.count})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No active deals in pipeline</p>
          )}

          {/* Quick stats below pipeline */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xs text-gray-500">New Leads</p>
              <p className="text-lg font-bold text-gray-900">{newLeads.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Deals Won</p>
              <p className="text-lg font-bold text-green-600">{wonDeals.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Total Activities</p>
              <p className="text-lg font-bold text-gray-900">{activities.length}</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Recent Activities</h2>
              <Link href="/activities" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ActivityIcon className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400">
                        {activity.type} · {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No recent activities</p>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Tasks</h2>
              <Link href="/tasks" className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      task.status === 'Overdue' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <CheckSquare className={`w-3.5 h-3.5 ${
                        task.status === 'Overdue' ? 'text-red-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">{task.title}</p>
                      <p className={`text-xs ${task.status === 'Overdue' ? 'text-red-500' : 'text-gray-400'}`}>
                        Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No pending tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Founder: Rep Performance */}
      {user?.role === 'founder' && opportunities.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Rep Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Rep</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Active Deals</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Pipeline Value</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Won</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Won Value</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const reps = new Map<string, { name: string; active: number; pipeline: number; won: number; wonValue: number }>();
                  opportunities.forEach(o => {
                    const key = o.assignedTo || 'unassigned';
                    const name = o.assignedToName || 'Unassigned';
                    if (!reps.has(key)) reps.set(key, { name, active: 0, pipeline: 0, won: 0, wonValue: 0 });
                    const rep = reps.get(key)!;
                    if (o.stage === 'Closed Won') {
                      rep.won++;
                      rep.wonValue += o.dealValue;
                    } else if (o.stage !== 'Closed Lost') {
                      rep.active++;
                      rep.pipeline += o.dealValue;
                    }
                  });
                  return Array.from(reps.values()).map((rep, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-sm font-medium text-gray-900">{rep.name}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{rep.active}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(rep.pipeline)}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{rep.won}</td>
                      <td className="py-3 text-sm font-medium text-green-600 text-right">{formatCurrency(rep.wonValue)}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
