import { Navigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function RegisterPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AuthForm mode="register" />;
}
