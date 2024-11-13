import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isPublic?: boolean;
}

export const ProtectedRoute = ({ children, isPublic = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublic) {
        // Redirect to login for protected routes when not authenticated
        router.replace('/login');
      } else if (user && isPublic) {
        // Redirect to dashboard for public routes when authenticated
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router, isPublic]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  // Only render children if conditions are met
  if (isPublic && !user) return <>{children}</>;
  if (!isPublic && user) return <>{children}</>;
  return null;
}; 