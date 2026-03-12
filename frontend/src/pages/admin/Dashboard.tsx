import { useEffect, useState } from 'react';
import { getUsers, getServices, getCrops, getAllRequests } from '../../api/admin';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';

interface Stats {
  users: number;
  farmers: number;
  providers: number;
  services: number;
  crops: number;
  requests: number;
  pending: number;
  completed: number;
  assigned: number;
  approved: number;
  inProgress: number;
  rejected: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0, farmers: 0, providers: 0,
    services: 0, crops: 0, requests: 0,
    pending: 0, completed: 0, assigned: 0,
    approved: 0, inProgress: 0, rejected: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
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
          assigned: requests.filter((r: any) => r.status === 'ASSIGNED').length,
          approved: requests.filter((r: any) => r.status === 'APPROVED').length,
          inProgress: requests.filter((r: any) => r.status === 'IN_PROGRESS').length,
          rejected: requests.filter((r: any) => r.status === 'REJECTED').length,
        });

        // Build monthly data
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthlyCounts: Record<string, number> = {};
        requests.forEach((r: any) => {
          const date = new Date(r.appliedAt);
          const key = monthNames[date.getMonth()];
          monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        });
        const monthly = monthNames
          .filter(m => monthlyCounts[m])
          .map(m => ({ month: m, requests: monthlyCounts[m] }));
        setMonthlyData(monthly.length > 0 ? monthly : [
          { month: 'Jan', requests: 0 },
          { month: 'Feb', requests: 0 },
          { month: 'Mar', requests: 0 },
        ]);

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

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#EAB308' },
    { name: 'Assigned', value: stats.assigned, color: '#3B82F6' },
    { name: 'Approved', value: stats.approved, color: '#6366F1' },
    { name: 'In Progress', value: stats.inProgress, color: '#A855F7' },
    { name: 'Completed', value: stats.completed, color: '#22C55E' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const userBarData = [
    { name: 'Farmers', count: stats.farmers },
    { name: 'Providers', count: stats.providers },
  ];

  const statusBarData = [
    { status: 'Pending', count: stats.pending, fill: '#EAB308' },
    { status: 'Assigned', count: stats.assigned, fill: '#3B82F6' },
    { status: 'Approved', count: stats.approved, fill: '#6366F1' },
    { status: 'In Progress', count: stats.inProgress, fill: '#A855F7' },
    { status: 'Completed', count: stats.completed, fill: '#22C55E' },
    { status: 'Rejected', count: stats.rejected, fill: '#EF4444' },
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">All your platform stats at a glance</p>
      </div>

      {/* Stat Cards */}
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-1">Request Status Breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">Distribution of all service requests</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No requests yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} requests`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart - Users */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-1">Users Overview</h3>
          <p className="text-xs text-gray-400 mb-4">Farmers vs Providers on platform</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={userBarData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} users`, '']} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                <Cell fill="#16A34A" />
                <Cell fill="#CA8A04" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line Chart - Monthly */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-1">Monthly Requests</h3>
          <p className="text-xs text-gray-400 mb-4">Service requests over time</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} requests`, '']} />
              <Line type="monotone" dataKey="requests" stroke="#16A34A" strokeWidth={2.5}
                dot={{ fill: '#16A34A', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Status Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-1">Request Status Summary</h3>
          <p className="text-xs text-gray-400 mb-4">Count per status</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusBarData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} requests`, '']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}