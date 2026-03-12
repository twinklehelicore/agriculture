import { useEffect, useState } from 'react';
import { getMyFarms, createFarm, updateFarm, deleteFarm } from '../../api/farmer';
import { getCrops } from '../../api/farmer';

interface Farm {
  id: number;
  name: string;
  area?: number;
  address?: string;
  surveyNo?: string;
  cropId?: number;
  crop?: { id: number; name: string };
}

interface Crop { id: number; name: string; }

interface Toast { message: string; type: 'success' | 'error'; }

const emptyForm = { name: '', area: '', address: '', surveyNo: '', cropId: '' };

export default function MyFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Farm | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Farm | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [farmsRes, cropsRes] = await Promise.all([getMyFarms(), getCrops()]);
      setFarms(farmsRes.data);
      setCrops(cropsRes.data);
    } catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (f: Farm) => {
    setEditing(f);
    setForm({
      name: f.name,
      area: f.area?.toString() || '',
      address: f.address || '',
      surveyNo: f.surveyNo || '',
      cropId: f.cropId?.toString() || '',
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError('');
    setFormLoading(true);
    try {
      const payload = {
        name: form.name,
        area: form.area ? Number(form.area) : undefined,
        address: form.address || undefined,
        surveyNo: form.surveyNo || undefined,
        cropId: form.cropId ? Number(form.cropId) : undefined,
      };
      if (editing) await updateFarm(editing.id, payload);
      else await createFarm(payload);
      setShowForm(false);
      fetchAll();
      showToast(editing ? 'Farm updated!' : 'Farm added!', 'success');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save farm');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await deleteFarm(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchAll();
      showToast('Farm deleted', 'success');
    } catch {
      showToast('Failed to delete farm', 'error');
    } finally { setDeleteLoading(false); }
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-700' : 'bg-red-600'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Farms</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your registered farms</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
          + Add Farm
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Farm' : 'Add Farm'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            {[
              { key: 'name', label: 'Farm Name *', placeholder: 'e.g. Green Valley Farm', type: 'text' },
              { key: 'area', label: 'Area (acres)', placeholder: '5.5', type: 'number' },
              { key: 'surveyNo', label: 'Survey Number', placeholder: 'e.g. 123/A', type: 'text' },
              { key: 'address', label: 'Address', placeholder: 'Village, Taluka, District', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select value={form.cropId}
                onChange={e => setForm(p => ({ ...p, cropId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option value="">— Select crop —</option>
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={formLoading || !form.name}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {formLoading ? 'Saving...' : editing ? 'Update Farm' : 'Add Farm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Delete Farm</h2>
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Delete <span className="font-semibold">"{deleteConfirm.name}"</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farm Cards */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading farms...</div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-3">🌾</div>
          <p className="text-gray-500 font-medium">No farms yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first farm to get started</p>
          <button onClick={openAdd}
            className="mt-4 px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800">
            + Add Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map(farm => (
            <div key={farm.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🌾</div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(farm)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100">Edit</button>
                  <button onClick={() => setDeleteConfirm(farm)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">Delete</button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{farm.name}</h3>
                {farm.address && <p className="text-gray-500 text-sm mt-1">📍 {farm.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {farm.area && (
                  <div className="bg-green-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="text-sm font-semibold text-green-700">{farm.area} acres</p>
                  </div>
                )}
                {farm.surveyNo && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Survey No</p>
                    <p className="text-sm font-semibold text-gray-700">{farm.surveyNo}</p>
                  </div>
                )}
                {farm.crop && (
                  <div className="bg-yellow-50 rounded-lg px-3 py-2 col-span-2">
                    <p className="text-xs text-gray-500">Crop</p>
                    <p className="text-sm font-semibold text-yellow-700">🌱 {farm.crop.name}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}