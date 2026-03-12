import { useEffect, useState } from 'react';
import { getMyRequests, createRequest, deleteRequest, getMyFarms } from '../../api/farmer';
import { getServices } from '../../api/farmer';

interface Request {
  id: number;
  farmId: number;
  serviceTypeId: number;
  status: string;
  details?: string;
  preferredSlot?: string;
  appliedAt: string;
}

interface Farm { id: number; name: string; }
interface Service { id: number; name: string; price?: number; unit?: string; image?: string; }
interface Toast { message: string; type: 'success' | 'error'; }

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const emptyForm = { farmId: '', serviceTypeId: '', details: '', preferredSlot: '' };

export default function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Request | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [reqRes, farmsRes, servicesRes] = await Promise.all([
        getMyRequests(), getMyFarms(), getServices()
      ]);
      setRequests(reqRes.data);
      setFarms(farmsRes.data);
      setServices(servicesRes.data);
    } catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    setError('');
    setFormLoading(true);
    try {
      await createRequest({
        farmId: Number(form.farmId),
        serviceTypeId: Number(form.serviceTypeId),
        details: form.details,
        preferredSlot: form.preferredSlot || undefined,
      });
      setShowForm(false);
      setForm(emptyForm);
      fetchAll();
      showToast('Service request created!', 'success');
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data || 'Failed to create request');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await deleteRequest(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchAll();
      showToast('Request deleted', 'success');
    } catch {
      showToast('Failed to delete request', 'error');
    } finally { setDeleteLoading(false); }
  };

  const statuses = ['ALL', 'PENDING', 'ASSIGNED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
  const filtered = filterStatus === 'ALL' ? requests : requests.filter(r => r.status === filterStatus);

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
          <h1 className="text-2xl font-bold text-gray-800">My Service Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your service requests</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(''); setForm(emptyForm); }}
          className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
          + New Request
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filterStatus === s
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-start justify-center pt-20 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">New Service Request</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            {farms.length === 0 && (
              <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                ⚠️ You need to add a farm first before creating a request.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Farm *</label>
              <select value={form.farmId} onChange={e => setForm(p => ({ ...p, farmId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option value="">— Choose your farm —</option>
                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Service *</label>
              <select value={form.serviceTypeId} onChange={e => setForm(p => ({ ...p, serviceTypeId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option value="">— Choose a service —</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.price ? ` — ₹${s.price}` : ''}{s.unit ? ` / ${s.unit}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {['MORNING', 'AFTERNOON', 'EVENING'].map(slot => (
                  <button key={slot} onClick={() => setForm(p => ({ ...p, preferredSlot: slot }))}
                    className={`py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                      form.preferredSlot === slot
                        ? 'border-green-700 bg-green-700 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-green-400'
                    }`}>
                    {slot === 'MORNING' ? '🌅 Morning' : slot === 'AFTERNOON' ? '☀️ Afternoon' : '🌙 Evening'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details *</label>
              <textarea placeholder="Describe what you need..." rows={3}
                value={form.details}
                onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit}
                disabled={formLoading || !form.farmId || !form.serviceTypeId || !form.details}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {formLoading ? 'Submitting...' : 'Submit Request'}
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
              <h2 className="text-lg font-bold text-gray-800">Cancel Request</h2>
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Cancel <span className="font-semibold">Request #{deleteConfirm.id}</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Keep</button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">No requests found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first service request</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['#', 'Farm', 'Slot', 'Details', 'Status', 'Applied', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{r.id}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {farms.find(f => f.id === r.farmId)?.name || `Farm #${r.farmId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.preferredSlot || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{r.details || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(r.appliedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'PENDING' && (
                        <button onClick={() => setDeleteConfirm(r)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 font-medium">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}