import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '../components/common/LoadingScreen.jsx';
import { useAuthStore } from '../store/authStore.js';

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);

  if (status === 'checking') {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
