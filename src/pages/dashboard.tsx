import { useState, useEffect, useCallback } from 'react';
import { VStack, Heading, Grid, Button, useDisclosure, Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBaby, FaBed, FaToilet } from 'react-icons/fa';
import { TrackingCard } from '@/components/TrackingCard';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityService } from '../services/ActivityService';
import { useAuth } from '../contexts/AuthContext';
import { GlassmorphicForm } from '../components/TrackingForm';
import { ActivityList } from '../components/ActivityList';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { BabyProfile } from '../components/BabyProfile';
import { BabySelector } from '../components/BabySelector';
import { BabyService, Baby } from '../services/BabyService';
import { useRouter } from 'next/router';
import { MobileNav } from '@/components/MobileNav';
import { Logo } from '@/components/Logo';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { format } from 'date-fns';
import { BabyInsights } from '@/components/BabyInsights';
import { BabyHeader } from '@/components/BabyHeader';
import { Footer } from '@/components/Footer';
import { NotificationSettings } from '../components/NotificationSettings';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

const activityService = new ActivityService();
const babyService = new BabyService();
const MotionGrid = motion(Grid);

interface DashboardProps {
  onGenderChange: (gender: string) => void;
}

export default function Dashboard({ onGenderChange }: DashboardProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  // Handle PWA shortcut actions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action && ['feed', 'sleep', 'diaper'].includes(action)) {
      // Auto-open the activity form when coming from PWA shortcut
      setTimeout(() => {
        onOpen();
      }, 1000); // Small delay to ensure component is ready
    }
  }, [onOpen]);

  const loadBabies = useCallback(async () => {
    try {
      const data = await babyService.getBabies(user!.uid);
      setBabies(data);
      
      if (data.length === 0) {
        router.push('/onboarding');
      } else if (!selectedBaby) {
        setSelectedBaby(data[0]);
      }
    } catch (error) {
      console.error('Error loading babies:', error);
    }
  }, [user, router, selectedBaby]);

  const fetchActivities = useCallback(async () => {
    try {
      if (!user || !selectedBaby) return;
      const data = await activityService.getActivities(selectedBaby.id!, user.uid);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedBaby]);

  useEffect(() => {
    if (user) {
      loadBabies();
    }
  }, [user, loadBabies]);

  useEffect(() => {
    if (selectedBaby) {
      fetchActivities();
    }
  }, [selectedBaby, fetchActivities]);

  const getLastActivity = (type: string) => {
    return activities.find(activity => activity.type === type);
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'h:mm a');
  };

  const handleAddNewBaby = () => {
    router.push('/onboarding');
  };

  return (
    <ProtectedRoute>
      <MobileNav />
      <Box minH="100vh" w="full" p={4} pt={16}>
        <VStack spacing={8} w="full">
          {selectedBaby && (
            <>
              <BabyProfile
                baby={selectedBaby}
                allBabies={babies}
                onBabySelect={(babyId) => {
                  const baby = babies.find(b => b.id === babyId);
                  setSelectedBaby(baby || null);
                }}
                onGenderChange={onGenderChange}
                onAddNewBaby={handleAddNewBaby}
              />
              
              <BabyHeader
                babyName={selectedBaby.name}
                gender={selectedBaby.gender}
              />
            </>
          )}

          <VStack w="full" spacing={6}>
            <Heading size="md" alignSelf="start">Quick Actions</Heading>
            <AnimatePresence>
              <MotionGrid
                templateColumns="repeat(auto-fit, minmax(240px, 1fr))"
                gap={6}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                w="full"
              >
                <TrackingCard 
                  icon={FaBaby}
                  title="Last Feed"
                  value={formatTime(getLastActivity('feed')?.startTime)}
                  onClick={onOpen}
                />
                <TrackingCard
                  icon={FaBed}
                  title="Last Sleep"
                  value={formatTime(getLastActivity('sleep')?.startTime)}
                  onClick={onOpen}
                />
                <TrackingCard
                  icon={FaToilet}
                  title="Last Diaper"
                  value={formatTime(getLastActivity('diaper')?.startTime)}
                  onClick={onOpen}
                />
              </MotionGrid>
            </AnimatePresence>
          </VStack>

          <Tabs variant="soft-rounded" colorScheme="brand" w="full">
            <TabList>
              <Tab>Insights</Tab>
              <Tab>History</Tab>
              <Tab>Notification Settings</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <BabyInsights 
                  activities={activities} 
                  babyName={selectedBaby?.name || 'Baby'} 
                />
              </TabPanel>

              <TabPanel>
                <ActivityList 
                  activities={activities} 
                  onSuccess={fetchActivities}
                />
              </TabPanel>

              <TabPanel>
                <NotificationSettings babyId={selectedBaby?.id || ''} />
              </TabPanel>
            </TabPanels>
          </Tabs>

          {isOpen && (
            <GlassmorphicForm onSubmit={() => {}} onClose={onClose}>
              <ActivityForm 
                babyId={selectedBaby?.id || ''}
                onSuccess={() => {
                  fetchActivities();
                  onClose();
                }}
              />
            </GlassmorphicForm>
          )}

          <Button 
            colorScheme="brand" 
            size="lg" 
            onClick={onOpen}
            position="fixed"
            bottom="80px"
            right="20px"
            borderRadius="full"
            w="60px"
            h="60px"
            shadow="lg"
            _hover={{
              transform: 'scale(1.1)',
              shadow: 'xl',
            }}
          >
            +
          </Button>

          <Footer />
          <PWAInstallPrompt />
        </VStack>
      </Box>
    </ProtectedRoute>
  );
} 