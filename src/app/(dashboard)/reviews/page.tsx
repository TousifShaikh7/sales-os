'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { WeeklyReview } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/weekly-reviews');
        const data = await res.json();
        setReviews(data.data || []);
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
        title="Weekly Reviews"
        description="Performance snapshots and pipeline health tracking"
      />

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Week of {formatDate(review.weekStartDate)} — {formatDate(review.weekEndDate)}
                  </h3>
                  {review.repName && user?.role === 'founder' && (
                    <p className="text-xs text-gray-500 mt-0.5">Rep: {review.repName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Pipeline Value</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(review.totalPipelineValue)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Deals Added</p>
                  <p className="text-lg font-bold text-gray-900">{review.dealsAdded}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Deals Closed</p>
                  <p className="text-lg font-bold text-green-600">{review.dealsClosed}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Activities</p>
                  <p className="text-lg font-bold text-gray-900">{review.activitiesLogged}</p>
                </div>
              </div>

              {review.notes && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-sm text-gray-600">{review.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BarChart3 className="w-6 h-6" />}
          title="No weekly reviews yet"
          description="Weekly reviews will appear here as they're generated from your pipeline data"
        />
      )}
    </div>
  );
}
