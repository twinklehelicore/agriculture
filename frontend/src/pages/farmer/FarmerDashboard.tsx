import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFarms, getMyRequests } from '../../api/farmer';
import { useAuth } from '../../context/AuthContext';

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farms, setFarms] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [farmsRes, requestsRes] = await Promise.all([
          getMyFarms(), getMyRequests()
        ]);
        setFarms(farmsRes.data);
        setRequests(requestsRes.data);
      } catch { console.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const activeRequests = requests.filter(r =>
    !['COMPLETED', 'REJECTED'].includes(r.status)
  );

  const statCards = [
    { label: 'My Farms', value: farms.length, icon: '🌾', color: 'bg-green-50 text-green-700', border: 'border-green-200', link: '/farmer/farms' },
    { label: 'Total Requests', value: requests.length, icon: '📋', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200', link: '/farmer/requests' },
    { label: 'Active Requests', value: activeRequests.length, icon: '⚡', color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200', link: '/farmer/requests' },
    { label: 'Completed', value: requests.filter(r => r.status === 'COMPLETED').length, icon: '✅', color: 'bg-teal-50 text-teal-700', border: 'border-teal-200', link: '/farmer/requests' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🌾</div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}! 👨‍🌾</h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your farms and requests</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} onClick={() => navigate(card.link)}
            className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.color} text-2xl mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => navigate('/farmer/farms')}
          className="bg-green-700 rounded-2xl p-6 cursor-pointer hover:bg-green-800 transition-colors">
          <div className="text-3xl mb-3">🌾</div>
          <h3 className="text-white font-bold text-lg">Manage Farms</h3>
          <p className="text-green-300 text-sm mt-1">Add or update your farm details</p>
        </div>
        <div onClick={() => navigate('/farmer/requests')}
          className="bg-white border border-green-200 rounded-2xl p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="text-gray-800 font-bold text-lg">Request a Service</h3>
          <p className="text-gray-500 text-sm mt-1">Book agricultural services for your farm</p>
        </div>
      </div>

      {/* Recent Requests */}
      {activeRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Active Requests</h3>
            <button onClick={() => navigate('/farmer/requests')}
              className="text-sm text-green-700 hover:underline">View all →</button>
          </div>
          <div className="space-y-3">
            {activeRequests.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">Request #{r.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Farm #{r.farmId} • {r.preferredSlot || 'No slot'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}