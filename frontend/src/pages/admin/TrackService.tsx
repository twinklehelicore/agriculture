import { useEffect, useState } from 'react';
import { getTrackService } from '../../api/admin';

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const priorityColor: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  NORMAL: 'bg-gray-100 text-gray-600',
};

export default function TrackService() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getTrackService()
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['ALL', 'PENDING', 'ASSIGNED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchSearch = search === '' ||
      r.id.toString().includes(search) ||
      r.farmer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.provider?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceType?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-gray-500">Loading tracker...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Track Service</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor progress of all service requests</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by request ID, farmer, provider, service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filterStatus === s
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Request Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-gray-800">Request #{r.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[r.priority]}`}>
                        {r.priority === 'URGENT' ? '⚠️ URGENT' : 'NORMAL'}
                      </span>
                      {r.logs?.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          📝 {r.logs.length} note{r.logs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                      <div>
                        <p className="text-gray-400">Service</p>
                        <p className="font-medium text-gray-700">{r.serviceType?.name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Farmer</p>
                        <p className="font-medium text-gray-700">{r.farmer?.name ?? `#${r.farmerId}`}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Provider</p>
                        <p className="font-medium text-gray-700">{r.provider?.name ?? 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Farm</p>
                        <p className="font-medium text-gray-700">{r.farm?.name ?? `#${r.farmId}`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-lg flex-shrink-0">
                    {expanded === r.id ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {/* Expanded Timeline */}
              {expanded === r.id && (
                <div className="border-t border-gray-100 px-5 py-4">

                  {/* Status Timeline */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status Timeline</p>
                  <div className="flex items-center gap-1 flex-wrap mb-5">
                    {[
                      { label: 'Applied', time: r.appliedAt, done: true },
                      { label: 'Assigned', time: r.assignedAt, done: !!r.assignedAt },
                      { label: 'Approved', time: r.approvedAt, done: !!r.approvedAt },
                      { label: 'In Progress', time: r.inProgressAt, done: !!r.inProgressAt },
                      { label: 'Completed', time: r.completedAt, done: !!r.completedAt },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`flex flex-col items-center`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {step.done ? '✓' : i + 1}
                          </div>
                          <p className={`text-xs mt-0.5 ${step.done ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {step.time && (
                            <p className="text-xs text-gray-400">{timeAgo(step.time)}</p>
                          )}
                        </div>
                        {i < 4 && (
                          <div className={`w-6 h-0.5 mb-5 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Provider Notes */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Provider Progress Notes
                  </p>
                  {r.logs?.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl">
                      <p>📝 No progress notes added yet</p>
                    </div>
                  ) : (
                    <div className="relative pl-5">
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-green-100" />
                      <div className="space-y-4">
                        {r.logs.map((log: any) => (
                          <div key={log.id} className="relative">
                            <div className="absolute -left-3.5 top-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            <div className="bg-gray-50 rounded-xl p-3 ml-2">
                              <p className="text-sm text-gray-800">{log.note}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-gray-400">
                                  by {log.provider?.name ?? 'Provider'}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(log.createdAt).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}