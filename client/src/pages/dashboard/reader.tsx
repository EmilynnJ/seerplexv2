import { ProtectedRoute } from '../../components/ProtectedRoute';

const ReaderDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reader Dashboard</h1>
      {/* Add your reader dashboard content here */}
    </div>
  );
};

const ProtectedReaderDashboard = () => (
  <ProtectedRoute allowedRoles={['reader']}>
    <ReaderDashboard />
  </ProtectedRoute>
);

export default ProtectedReaderDashboard;