import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  VStack, 
  Button, 
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Heading,
  Divider,
  HStack,
  Icon,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa';
import { BabyService } from '../services/BabyService';
import { Logo } from '@/components/Logo';

const babyService = new BabyService();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLoginSuccess = async (userId: string) => {
    try {
      const babies = await babyService.getBabies(userId);
      if (babies.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking babies:', error);
      router.push('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(result.user.uid);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleLoginSuccess(result.user.uid);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login with Google',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={8}>
        <Logo size="lg" />
        
        <Button
          w="full"
          onClick={handleGoogleLogin}
          leftIcon={<Icon as={FaGoogle} />}
          colorScheme="red"
        >
          Continue with Google
        </Button>

        <HStack w="full">
          <Divider />
          <Text px={3} color="gray.500">or</Text>
          <Divider />
        </HStack>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="brand" w="full">
              Login
            </Button>
            <Text>
              Don't have an account?{' '}
              <Link href="/signup">
                <Text as="span" color="brand.500" textDecoration="underline">
                  Sign up
                </Text>
              </Link>
            </Text>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
} 