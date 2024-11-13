import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Landing from './landing';
import Dashboard from './dashboard';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in and tries to access landing page,
    // redirect them to dashboard
    if (user && router.pathname === '/') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <ProtectedRoute isPublic>
        <Landing />
      </ProtectedRoute>
    );
  }

  // Show dashboard for authenticated users
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
