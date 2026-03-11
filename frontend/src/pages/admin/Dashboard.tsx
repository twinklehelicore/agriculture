import { useEffect, useState } from 'react';
import { getUsers, getServices, getCrops, getAllRequests } from '../../api/admin';

interface Stats {
  users: number;
  farmers: number;
  providers: number;
  services: number;
  crops: number;
  requests: number;
  pending: number;
  completed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0, farmers: 0, providers: 0,
    services: 0, crops: 0, requests: 0,
    pending: 0, completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, servicesRes, cropsRes, requestsRes] = await Promise.all([
          getUsers(), getServices(), getCrops(), getAllRequests(),
        ]);

        const users = usersRes.data;
        const requests = requestsRes.data;

        setStats({
          users: users.length,
          farmers: users.filter((u: any) => u.role?.name === 'FARMER').length,
          providers: users.filter((u: any) => u.role?.name === 'PROVIDER').length,
          services: servicesRes.data.length,
          crops: cropsRes.data.length,
          requests: requests.length,
          pending: requests.filter((r: any) => r.status === 'PENDING').length,
          completed: requests.filter((r: any) => r.status === 'COMPLETED').length,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: '👥', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { label: 'Farmers', value: stats.farmers, icon: '👨‍🌾', color: 'bg-green-50 text-green-700', border: 'border-green-200' },
    { label: 'Providers', value: stats.providers, icon: '🚜', color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
    { label: 'Services', value: stats.services, icon: '🛠️', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
    { label: 'Crops', value: stats.crops, icon: '🌱', color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
    { label: 'Total Requests', value: stats.requests, icon: '📋', color: 'bg-orange-50 text-orange-700', border: 'border-orange-200' },
    { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-red-50 text-red-700', border: 'border-red-200' },
    { label: 'Completed', value: stats.completed, icon: '✅', color: 'bg-teal-50 text-teal-700', border: 'border-teal-200' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🌾</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">All your platform stats at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.color} text-2xl mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Request Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
            { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
            { label: 'Completed', color: 'bg-green-100 text-green-800' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl px-4 py-3 text-center`}>
              <p className="font-semibold text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}