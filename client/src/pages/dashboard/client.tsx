import { ProtectedRoute } from '../../components/ProtectedRoute';

const ClientDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
      {/* Add your client dashboard content here */}
    </div>
  );
};

const ProtectedClientDashboard = () => (
  <ProtectedRoute allowedRoles={['client']}>
    <ClientDashboard />
  </ProtectedRoute>
);

export default ProtectedClientDashboard;