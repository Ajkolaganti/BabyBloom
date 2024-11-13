import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
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
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (user) {
      router.push('/onboarding');
    }
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/onboarding');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/onboarding');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up with Google',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Container maxW="container.xl" centerContent minH="100vh" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        w="full"
        maxW="md"
        p={8}
        borderRadius="2xl"
        bg={bgColor}
        boxShadow="xl"
      >
        <VStack spacing={8}>
          <Logo size="lg" />
          <VStack spacing={2} textAlign="center">
            <Heading size="lg">Create your account</Heading>
            <Text color="gray.500">
              Start tracking your baby's daily activities
            </Text>
          </VStack>

          <Button
            w="full"
            size="lg"
            onClick={handleGoogleSignup}
            leftIcon={<Icon as={FaGoogle} />}
            colorScheme="red"
            variant="outline"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'md',
            }}
          >
            Continue with Google
          </Button>

          <HStack w="full">
            <Divider />
            <Text px={3} color="gray.500" fontSize="sm">
              or sign up with email
            </Text>
            <Divider />
          </HStack>

          <form onSubmit={handleSignup} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  size="lg"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button 
                type="submit" 
                colorScheme="brand" 
                w="full"
                size="lg"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
              >
                Sign Up
              </Button>
            </VStack>
          </form>

          <Text fontSize="sm">
            Don&apos;t have an account?{' '}
            <Link href="/login">
              <Text as="span" color="brand.500" _hover={{ textDecoration: 'underline' }}>
                Log in
              </Text>
            </Link>
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  );
} 