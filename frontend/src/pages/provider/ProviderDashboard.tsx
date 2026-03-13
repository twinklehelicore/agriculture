import { useEffect, useState } from 'react';
import { getAssignedRequests } from '../../api/provider';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: number;
  status: string;
  farmId: number;
  farmerId: number;
  preferredSlot?: string;
  appliedAt: string;
}

const statusColor: Record<string, string> = {
  ASSIGNED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function ProviderDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAssignedRequests()
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: '📋', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { label: 'Assigned', value: jobs.filter(j => j.status === 'ASSIGNED').length, icon: '📌', color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
    { label: 'In Progress', value: jobs.filter(j => j.status === 'IN_PROGRESS').length, icon: '⚙️', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
    { label: 'Completed', value: jobs.filter(j => j.status === 'COMPLETED').length, icon: '✅', color: 'bg-green-50 text-green-700', border: 'border-green-200' },
  ];

  const activeJobs = jobs.filter(j => ['ASSIGNED', 'APPROVED', 'IN_PROGRESS'].includes(j.status));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🌾</div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Provider Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your job overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.color} text-2xl mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Active Jobs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Active Jobs</h3>
          <button onClick={() => navigate('/provider/jobs')}
            className="text-sm text-green-700 hover:underline font-medium">
            View all →
          </button>
        </div>

        {activeJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">🎉</div>
            <p>No active jobs right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Job #{job.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Farm #{job.farmId} · {job.preferredSlot ?? 'No slot'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[job.status]}`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}