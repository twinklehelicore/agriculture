import { useEffect, useState } from 'react';
import { getServices } from '../../api/farmer';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: number;
  name: string;
  price?: number;
  unit?: string;
  description?: string;
  image?: string;
}

export default function AvailableServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getServices()
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Available Services</h1>
        <p className="text-gray-500 text-sm mt-1">Browse services you can request for your farm</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-3">🛠️</div>
          <p className="text-gray-500">No services available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-green-50 flex items-center justify-center text-5xl">🛠️</div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="font-semibold text-gray-800 text-lg">{s.name}</h3>
                {s.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{s.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {s.price && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                      ₹{s.price}
                    </span>
                  )}
                  {s.unit && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{s.unit}</span>
                  )}
                </div>
                <button
                  onClick={() => navigate('/farmer/requests')}
                  className="w-full py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
                  Request This Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}