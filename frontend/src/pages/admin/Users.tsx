import { useEffect, useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../../api/admin';

interface User {
  id: number;
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  role?: { name: string };
}

const emptyAddForm = { role: 'FARMER', name: '', mobile: '', email: '', address: '' };
const emptyEditForm = { name: '', email: '', address: '' };

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FARMER' | 'PROVIDER'>('ALL');

  // Add
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async () => {
    setAddError('');
    setAddLoading(true);
    try {
      await addUser(addForm);
      setShowAdd(false);
      setAddForm(emptyAddForm);
      fetchUsers();
    } catch (e: any) {
      setAddError(e.response?.data?.error || 'Failed to add user');
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      address: u.address || '',
    });
    setEditError('');
  };

  const handleEdit = async () => {
    if (!editUser) return;
    setEditError('');
    setEditLoading(true);
    try {
      await updateUser(editUser.id, editForm);
      setEditUser(null);
      fetchUsers();
    } catch (e: any) {
      setEditError(e.response?.data?.error || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this user? They will not be able to login.')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch {
      alert('Failed to deactivate user');
    }
  };

  const filtered = users.filter(u =>
    filter === 'ALL' ? u.role?.name !== 'ADMIN' : u.role?.name === filter
  );

  const getRoleBadge = (role?: string) => {
    if (role === 'FARMER') return 'bg-green-100 text-green-700';
    if (role === 'PROVIDER') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage farmers and providers</p>
        </div>
        <button onClick={() => { setShowAdd(true); setAddError(''); }}
          className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
          + Add User
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(['ALL', 'FARMER', 'PROVIDER'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f === 'ALL' ? '👥 All' : f === 'FARMER' ? '👨‍🌾 Farmers' : '🚜 Providers'}
          </button>
        ))}
      </div>

      {/* ── ADD USER MODAL ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
              <button onClick={() => { setShowAdd(false); setAddError(''); }}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {addError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {addError}
              </div>
            )}

            {/* Role toggle */}
            <div className="flex gap-2">
              {['FARMER', 'PROVIDER'].map(r => (
                <button key={r} onClick={() => setAddForm(p => ({ ...p, role: r }))}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    addForm.role === r
                      ? 'border-green-700 bg-green-700 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-green-400'
                  }`}>
                  {r === 'FARMER' ? '👨‍🌾 Farmer' : '🚜 Provider'}
                </button>
              ))}
            </div>

            {[
              { key: 'name', label: 'Full Name *', placeholder: 'Ramesh Kumar', type: 'text' },
              { key: 'mobile', label: 'Mobile *', placeholder: '9876543210', type: 'tel' },
              { key: 'email', label: 'Email (optional)', placeholder: 'user@email.com', type: 'email' },
              { key: 'address', label: 'Address (optional)', placeholder: 'Village, District', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder}
                  value={(addForm as any)[field.key]}
                  onChange={e => setAddForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setAddError(''); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={addLoading || !addForm.name || !addForm.mobile}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {addLoading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
              <button onClick={() => setEditUser(null)}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* User info pill */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {editUser.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{editUser.name}</p>
                <p className="text-xs text-gray-500">{editUser.mobile}</p>
              </div>
              <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(editUser.role?.name)}`}>
                {editUser.role?.name}
              </span>
            </div>

            {editError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {editError}
              </div>
            )}

            {[
              { key: 'name', label: 'Full Name', placeholder: 'Ramesh Kumar', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'user@email.com', type: 'email' },
              { key: 'address', label: 'Address', placeholder: 'Village, District', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder}
                  value={(editForm as any)[field.key]}
                  onChange={e => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEdit} disabled={editLoading}
                className="flex-1 py-2.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading users...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['#', 'Name', 'Mobile', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No users found</td>
                  </tr>
                ) : filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-400">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.mobile || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role?.name)}`}>
                        {user.role?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {/* Edit always visible */}
                        <button onClick={() => openEdit(user)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition-colors font-medium">
                          Edit
                        </button>
                        {/* Deactivate only if active */}
                        {user.isActive && (
                          <button onClick={() => handleDeactivate(user.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors font-medium">
                            Deactivate
                          </button>
                        )}
                      </div>
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