import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../api/farmer';
import { useAuth } from '../../context/AuthContext';

interface Toast { message: string; type: 'success' | 'error'; }

export default function FarmerProfile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProfile();
        const u = res.data;
        setForm({ name: u.name ?? '', email: u.email ?? '', address: u.address ?? '' });
      } catch {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      // Update auth context with new name
      const token = localStorage.getItem('token') ?? '';
      login(token, res.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🌾</div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-700' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {form.name?.charAt(0)?.toUpperCase() ?? '👨‍🌾'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{form.name || 'Farmer'}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mt-1">
              🌾 FARMER
            </span>
            <p className="text-gray-400 text-sm mt-1">{user?.mobile}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-gray-800">Personal Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Enter your name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea
            value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            placeholder="Enter your address"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
          />
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Mobile Number</label>
          <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
            {user?.mobile} <span className="text-xs text-gray-400">(cannot be changed)</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}