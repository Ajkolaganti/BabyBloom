import {
  VStack,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  useToast,
  Box,
  Text,
  Input,
  HStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { notificationService, NotificationSchedule } from '../services/NotificationService';
import { useAuth } from '../contexts/AuthContext';

interface NotificationSettingsProps {
  babyId: string;
}

export const NotificationSettings = ({ babyId }: NotificationSettingsProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<NotificationSchedule>({
    feedingIntervals: 180, // 3 hours
    diaperCheckIntervals: 120, // 2 hours
    sleepReminders: true,
    quietHours: {
      start: '22:00',
      end: '07:00',
    },
    enabled: false,
  });

  const handlePermission = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      const granted = await notificationService.requestPermission();
      if (granted) {
        toast({
          title: 'Notifications enabled',
          description: 'You will now receive baby care reminders',
          status: 'success',
          duration: 3000,
        });
        // Enable the schedule automatically when permission is granted
        setSchedule(prev => ({ ...prev, enabled: true }));
      } else {
        toast({
          title: 'Notifications not enabled',
          description: 'Please allow notifications in your browser settings',
          status: 'warning',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error enabling notifications',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      await notificationService.setupNotificationSchedule(user.uid, babyId, schedule);
      toast({
        title: 'Schedule saved',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error saving schedule',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Notification Settings
        </Text>
        <Text color="gray.500" fontSize="sm">
          Get reminders for feeding times, diaper checks, and more.
        </Text>
      </Box>

      <FormControl display="flex" alignItems="center">
        <FormLabel mb="0">Enable Notifications</FormLabel>
        <Switch
          isChecked={schedule.enabled}
          onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Feeding Reminder Interval (minutes)</FormLabel>
        <NumberInput
          value={schedule.feedingIntervals}
          onChange={(_, value) => setSchedule({ ...schedule, feedingIntervals: value })}
          min={30}
          max={480}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Diaper Check Interval (minutes)</FormLabel>
        <NumberInput
          value={schedule.diaperCheckIntervals}
          onChange={(_, value) => setSchedule({ ...schedule, diaperCheckIntervals: value })}
          min={30}
          max={480}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <FormLabel mb="0">Sleep Reminders</FormLabel>
        <Switch
          isChecked={schedule.sleepReminders}
          onChange={(e) => setSchedule({ ...schedule, sleepReminders: e.target.checked })}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Quiet Hours</FormLabel>
        <HStack>
          <Input
            type="time"
            value={schedule.quietHours.start}
            onChange={(e) => setSchedule({
              ...schedule,
              quietHours: { ...schedule.quietHours, start: e.target.value }
            })}
          />
          <Text>to</Text>
          <Input
            type="time"
            value={schedule.quietHours.end}
            onChange={(e) => setSchedule({
              ...schedule,
              quietHours: { ...schedule.quietHours, end: e.target.value }
            })}
          />
        </HStack>
      </FormControl>

      <VStack spacing={4}>
        <Button
          colorScheme="brand"
          onClick={handlePermission}
          isLoading={loading}
          w="full"
        >
          Enable Browser Notifications
        </Button>
        <Button
          colorScheme="brand"
          variant="outline"
          onClick={handleSaveSchedule}
          isLoading={loading}
          w="full"
        >
          Save Schedule
        </Button>
      </VStack>
    </VStack>
  );
}; 