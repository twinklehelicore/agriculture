//src/pages/auth/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtp, verifyOtp, adminLogin } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

type Mode = 'otp-mobile' | 'otp-verify' | 'admin';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('otp-mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await sendOtp(mobile);
      setMode('otp-verify');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      const { token, user } = res.data;
      login(token, { ...user, role: user.role ?? 'FARMER' });
      navigate(user.role === 'PROVIDER' ? '/provider' : '/farmer');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      const { token, user } = res.data;
      login(token, { ...user, role: 'ADMIN' });
      navigate('/admin');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-2xl mb-4">
            <span className="text-white text-2xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-green-800">AgriOwn</h1>
          <p className="text-gray-500 mt-1">Agriculture Service Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-green-50 p-1 rounded-xl">
            <button
              onClick={() => { setMode('otp-mobile'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode !== 'admin'
                  ? 'bg-green-700 text-white shadow'
                  : 'text-gray-500 hover:text-green-700'
              }`}
            >
              Farmer / Provider
            </button>
            <button
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'admin'
                  ? 'bg-green-700 text-white shadow'
                  : 'text-gray-500 hover:text-green-700'
              }`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* OTP Flow */}
          {mode === 'otp-mobile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || mobile.length !== 10}
                className="w-full py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* OTP Verify */}
          {mode === 'otp-verify' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">OTP sent to <span className="font-medium text-green-700">+91 {mobile}</span></p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 text-center text-xl tracking-widest border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                onClick={() => { setMode('otp-mobile'); setOtp(''); }}
                className="w-full text-sm text-green-700 hover:underline"
              >
                ← Change number
              </button>
            </div>
          )}

          {/* Admin Login */}
          {mode === 'admin' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="admin@agriown.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleAdminLogin}
                disabled={loading || !email || !password}
                className="w-full py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          )}

          {/* Register link */}
          {mode !== 'admin' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              New here?{' '}
              <Link to="/register" className="text-green-700 font-medium hover:underline">
                Register your account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}