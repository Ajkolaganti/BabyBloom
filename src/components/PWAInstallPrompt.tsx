import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  Icon,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { FaDownload, FaMobile } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      onOpen();
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      onClose();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onOpen, onClose]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    onClose();
  };

  // Don't show if already installed or no install prompt available
  if (isInstalled || !deferredPrompt || !isOpen) {
    return null;
  }

  return (
    <Alert
      status="info"
      variant="left-accent"
      borderRadius="lg"
      position="fixed"
      bottom="20px"
      left="20px"
      right="20px"
      zIndex="1000"
      shadow="lg"
    >
      <AlertIcon as={FaMobile} />
      <Box flex="1">
        <AlertTitle fontSize="sm">Install BabyBloom!</AlertTitle>
        <AlertDescription fontSize="xs">
          Add to home screen for quick access and offline use
        </AlertDescription>
      </Box>
      <HStack spacing={2}>
        <Button
          size="sm"
          colorScheme="brand"
          leftIcon={<Icon as={FaDownload} />}
          onClick={handleInstallClick}
        >
          Install
        </Button>
        <CloseButton size="sm" onClick={onClose} />
      </HStack>
    </Alert>
  );
};