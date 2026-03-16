import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import PatientProfile from './pages/PatientProfile.jsx';
import AdminDepartments from './pages/AdminDepartments.jsx';
import AdminDoctors from './pages/AdminDoctors.jsx';
import AdminPharmacy from './pages/AdminPharmacy.jsx';
import AdminReports from './pages/AdminReports.jsx';
import AdminPages from './pages/AdminPages.jsx';
import AdminPageDetail from './pages/AdminPageDetail.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import AdminPatients from './pages/AdminPatients.jsx';
import AdminAppointments from './pages/AdminAppointments.jsx';
import DoctorProfile from './pages/DoctorProfile.jsx';
import DoctorDepartment from './pages/DoctorDepartment.jsx';
import DoctorReports from './pages/DoctorReports.jsx';
import DoctorPharmacy from './pages/DoctorPharmacy.jsx';
import DoctorNotifications from './pages/DoctorNotifications.jsx';
import DoctorSettings from './pages/DoctorSettings.jsx';
import RoleRedirect from './pages/RoleRedirect.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDepartments />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminPatients />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDoctors />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pharmacy"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminPharmacy />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pages"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminPages />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pages/:id"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminPageDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/dashboard"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/department"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorDepartment />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/reports"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/pharmacy"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorPharmacy />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/notifications"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorNotifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/settings"
          element={
            <PrivateRoute roles={['doctor']}>
              <DoctorSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <PrivateRoute roles={['patient']}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <PrivateRoute roles={['patient']}>
              <PatientProfile />
            </PrivateRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
