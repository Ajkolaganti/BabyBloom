import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { BabyOnboarding } from '../components/BabyOnboarding';
import { BabyService } from '../services/BabyService';
import { Center, Spinner } from '@chakra-ui/react';

const babyService = new BabyService();

export default function Onboarding() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Check if user already has babies
        const checkBabies = async () => {
          const babies = await babyService.getBabies(user.uid);
          if (babies.length > 0) {
            router.push('/');
          }
        };
        checkBabies();
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return <BabyOnboarding />;
} 