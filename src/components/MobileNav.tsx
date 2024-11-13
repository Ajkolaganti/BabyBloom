import {
  Box,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  useColorModeValue,
  Text,
  HStack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaBars, FaBaby, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import { Logo } from './Logo';

export const MobileNav = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const toast = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
      onClose();
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <>
      <IconButton
        aria-label="Open menu"
        icon={<FaBars />}
        position="fixed"
        top={4}
        left={4}
        variant="ghost"
        onClick={onOpen}
        zIndex={20}
      />

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader 
            borderBottomWidth="1px"
            bgGradient="linear(to-r, brand.500, accent.500)"
            color="white"
            display="flex"
            alignItems="center"
          >
            <Logo withText size="md" />
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              <Box
                as="button"
                onClick={() => {
                  router.push('/dashboard');
                  onClose();
                }}
                p={3}
                rounded="md"
                _hover={{ bg: 'gray.100' }}
              >
                <HStack>
                  <Icon as={FaBaby} />
                  <Text>Dashboard</Text>
                </HStack>
              </Box>

              <Box
                as="button"
                onClick={handleSignOut}
                p={3}
                rounded="md"
                _hover={{ bg: 'gray.100' }}
              >
                <HStack>
                  <Icon as={FaSignOutAlt} />
                  <Text>Sign Out</Text>
                </HStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}; 