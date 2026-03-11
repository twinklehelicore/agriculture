import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../pages/admin/Admin';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Services from '../pages/admin/Services';
import Crops from '../pages/admin/Crops';
import ServiceRequests from '../pages/admin/ServiceRequests';

const FarmerDash = () => <div className="p-8 text-green-800 font-bold text-2xl">Farmer Dashboard — Coming next!</div>;
const ProviderDash = () => <div className="p-8 text-green-800 font-bold text-2xl">Provider Dashboard — Coming next!</div>;

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="services" element={<Services />} />
          <Route path="crops" element={<Crops />} />
          <Route path="requests" element={<ServiceRequests />} />
        </Route>

        <Route path="/farmer/*" element={
          <ProtectedRoute role="FARMER"><FarmerDash /></ProtectedRoute>
        } />
        <Route path="/provider/*" element={
          <ProtectedRoute role="PROVIDER"><ProviderDash /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}