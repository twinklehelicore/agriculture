import { useEffect, useState } from 'react';
import { getServices, getCategories } from '../../api/farmer';
import { useNavigate } from 'react-router-dom';

interface Service { id: number; name: string; price?: number; unit?: string; description?: string; image?: string; categoryId?: number; }
interface Category { id: number; name: string; services?: Service[]; }

export default function AvailableServices() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uncategorized, setUncategorized] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          getServices(), getCategories()
        ]);
        const services: Service[] = servicesRes.data;
        const cats: Category[] = categoriesRes.data;

        // Attach services to categories
        const catsWithServices = cats.map(c => ({
          ...c,
          services: services.filter(s => s.categoryId === c.id)
        })).filter(c => c.services.length > 0);

        setCategories(catsWithServices);
        setUncategorized(services.filter(s => !s.categoryId));
      } catch { console.error('Failed'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🛠️</div>
        <p className="text-gray-500">Loading services...</p>
      </div>
    </div>
  );

  // Show services under selected category
  if (selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedCategory(null)}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200">
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{selectedCategory.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{selectedCategory.services?.length} service{(selectedCategory.services?.length ?? 0) !== 1 ? 's' : ''} available</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategory.services?.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-green-50 flex items-center justify-center text-5xl">🛠️</div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                {s.description && <p className="text-gray-500 text-sm line-clamp-2">{s.description}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  {s.price && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">₹{s.price}</span>}
                  {s.unit && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{s.unit}</span>}
                </div>
                <button
                  onClick={() => navigate('/farmer/requests')}
                  className="w-full py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
                  Request This Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show category cards
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Available Services</h1>
        <p className="text-gray-500 text-sm mt-1">Browse services by category</p>
      </div>

      {categories.length === 0 && uncategorized.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🛠️</div>
          <p>No services available yet</p>
        </div>
      ) : (
        <>
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  🛠️
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">{cat.name}</h3>
                <p className="text-green-600 text-sm mt-1 font-medium">
                  {cat.services?.length} service{(cat.services?.length ?? 0) !== 1 ? 's' : ''} available
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.services?.slice(0, 3).map(s => (
                    <span key={s.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{s.name}</span>
                  ))}
                  {(cat.services?.length ?? 0) > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{(cat.services?.length ?? 0) - 3} more</span>
                  )}
                </div>
                <div className="mt-4 text-green-700 text-sm font-medium">View services →</div>
              </div>
            ))}
          </div>

          {/* Uncategorized services */}
          {uncategorized.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Other Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uncategorized.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {s.image ? (
                      <img src={s.image} alt={s.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-green-50 flex items-center justify-center text-5xl">🛠️</div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="font-semibold text-gray-800">{s.name}</h3>
                      {s.description && <p className="text-gray-500 text-sm line-clamp-2">{s.description}</p>}
                      <div className="flex items-center gap-2">
                        {s.price && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">₹{s.price}</span>}
                        {s.unit && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{s.unit}</span>}
                      </div>
                      <button onClick={() => navigate('/farmer/requests')}
                        className="w-full py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800">
                        Request This Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}