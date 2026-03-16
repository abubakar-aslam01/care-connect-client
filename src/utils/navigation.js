export const getNavItems = (role) => {
  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Patients', path: '/admin/patients' },
        { label: 'Appointments', path: '/admin/appointments' },
        { label: 'Departments', path: '/admin/departments' },
        { label: 'Doctors', path: '/admin/doctors' },
        { label: 'Pharmacy', path: '/admin/pharmacy' },
        { label: 'Reports', path: '/admin/reports' },
        { label: 'Add Pages', path: '/admin/pages' },
        { label: 'Profile', path: '/admin/profile' },
        { label: 'Settings', path: '/settings' }
      ];
    case 'doctor':
      return [
        { label: 'Dashboard', path: '/doctor/dashboard' },
        { label: 'My Profile', path: '/doctor/profile' },
        { label: 'My Department', path: '/doctor/department' },
        { label: 'My Reports', path: '/doctor/reports' },
        { label: 'Pharmacy', path: '/doctor/pharmacy' },
        { label: 'Notifications', path: '/doctor/notifications' },
        { label: 'Settings', path: '/settings' }
      ];
    case 'patient':
    default:
      return [
        { label: 'Dashboard', path: '/patient/dashboard' },
        { label: 'Profile', path: '/patient/profile' },
        { label: 'Settings', path: '/settings' }
      ];
  }
};
