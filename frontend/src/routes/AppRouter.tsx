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
import FarmerLayout from '../pages/farmer/Farmer';
import FarmerHome from '../pages/farmer/FarmerDashboard';
import MyFarms from '../pages/farmer/MyFarms';
import MyRequests from '../pages/farmer/MyRequest';
import AvailableServices from '../pages/farmer/AvailableService';
import ProviderLayout from '../pages/provider/Provider';
import ProviderHome from '../pages/provider/ProviderDashboard';
import MyJobs from '../pages/provider/MyJob';
import AdminProfile from '../pages/admin/Profile';
import ProviderProfile from '../pages/provider/Profile';
import FarmerProfile from '../pages/farmer/Profile';
import TrackService from '../pages/admin/TrackService';
import Categories from '../pages/admin/Categories';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="services" element={<Services />} />
          <Route path="crops" element={<Crops />} />
          <Route path="requests" element={<ServiceRequests />} />
          <Route path= "profile" element={ <AdminProfile /> } />
          <Route path= "track" element= { <TrackService /> } />
          <Route path="categories" element={<Categories />} />

        </Route>

        <Route path="/farmer" element={<ProtectedRoute role="FARMER"><FarmerLayout /></ProtectedRoute>}>
          <Route index element={<FarmerHome />} />
          <Route path="farms" element={<MyFarms />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="services" element={<AvailableServices />} />
          <Route path= "profile" element={ <FarmerProfile /> } />
         
        </Route>

        {/* Provider routes */}
        <Route path="/provider" element={<ProtectedRoute role="PROVIDER"><ProviderLayout /></ProtectedRoute>}>
          <Route index element={<ProviderHome />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path= "profile" element={ <ProviderProfile /> } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}