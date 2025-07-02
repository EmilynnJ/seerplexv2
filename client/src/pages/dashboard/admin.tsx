import { ProtectedRoute } from '../../components/ProtectedRoute';

const AdminDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {/* Add your admin dashboard content here */}
    </div>
  );
};

const ProtectedAdminDashboard = () => (
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
);

export default ProtectedAdminDashboard;