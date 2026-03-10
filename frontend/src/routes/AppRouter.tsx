//src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from './ProtectedRoute';

// Placeholder dashboards — we'll build these next
const AdminDash = () => <div className="p-8 text-green-800 font-bold text-2xl">Admin Dashboard</div>;
const FarmerDash = () => <div className="p-8 text-green-800 font-bold text-2xl">Farmer Dashboard</div>;
const ProviderDash = () => <div className="p-8 text-green-800 font-bold text-2xl">Provider Dashboard</div>;

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/*" element={
          <ProtectedRoute role="ADMIN"><AdminDash /></ProtectedRoute>
        } />
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