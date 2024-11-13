import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Landing from './landing';
import Dashboard from './dashboard';

interface HomeProps {
  onGenderChange: (gender: string) => void;
}

export default function Home({ onGenderChange }: HomeProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && router.pathname === '/') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <ProtectedRoute isPublic>
        <Landing />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Dashboard onGenderChange={onGenderChange} />
    </ProtectedRoute>
  );
}
