'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { StageHistory } from '@/types';
import { formatDate, getStageColor } from '@/lib/utils';
import { History, ArrowRight } from 'lucide-react';

export default function StageHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<StageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/stage-history');
        const data = await res.json();
        setHistory(data.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Stage History"
        description="Audit trail of all deal stage changes"
      />

      {history.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Opportunity</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Stage Change</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Changed By</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Days in Stage</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {entry.opportunityName || entry.opportunityId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${getStageColor(entry.fromStage)}`}>{entry.fromStage}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className={`badge ${getStageColor(entry.toStage)}`}>{entry.toStage}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {entry.changedByName || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {formatDate(entry.changedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 text-right">
                      {entry.daysInPreviousStage ? `${entry.daysInPreviousStage}d` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No stage changes recorded"
          description="Stage transitions will be automatically tracked when deal stages are updated"
        />
      )}
    </div>
  );
}
