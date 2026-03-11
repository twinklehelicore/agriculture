import { useEffect, useState } from 'react';
import { getCrops, createCrop, updateCrop, deleteCrop } from '../../api/admin';

interface Crop { id: number; name: string; }

export default function Crops() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Crop | null>(null);
  const [name, setName] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCrops = async () => {
    try { const res = await getCrops(); setCrops(res.data); }
    catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCrops(); }, []);

  const openAdd = () => { setEditing(null); setName(''); setError(''); setShowForm(true); };
  const openEdit = (c: Crop) => { setEditing(c); setName(c.name); setError(''); setShowForm(true); };

  const handleSubmit = async () => {
    setError('');
    setFormLoading(true);
    try {
      if (editing) await updateCrop(editing.id, { name });
      else await createCrop({ name });
      setShowForm(false);
      fetchCrops();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save crop');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this crop?')) return;
    try { await deleteCrop(id); fetchCrops(); }
    catch { alert('Failed to delete crop'); }
  };

  const cropEmojis: Record<string, string> = {
    wheat: '🌾', rice: '🍚', corn: '🌽', cotton: '🌿',
    sugarcane: '🎋', soybean: '🫘', default: '🌱'
  };
  const getCropEmoji = (name: string) =>
    cropEmojis[name.toLowerCase()] || cropEmojis.default;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Crops</h1>
          <p className="text-gray-500 text-sm mt-1">Manage crop types on the platform</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
          + Add Crop
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Crop' : 'Add Crop'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
              <input type="text" placeholder="e.g. Wheat" value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={formLoading || !name.trim()}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {formLoading ? 'Saving...' : editing ? 'Update' : 'Add Crop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading crops...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {crops.length === 0 ? (
            <div className="col-span-4 text-center py-16 text-gray-400">No crops yet. Add one!</div>
          ) : crops.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center space-y-3">
              <div className="text-4xl">{getCropEmoji(c.name)}</div>
              <p className="font-semibold text-gray-800">{c.name}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => openEdit(c)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100">Edit</button>
                <button onClick={() => handleDelete(c.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}