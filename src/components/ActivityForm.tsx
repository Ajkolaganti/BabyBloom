import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
} from '@chakra-ui/react';
import { Activity, ActivityDetails } from '../models/Activity';
import { ActivityService } from '../services/ActivityService';
import { useAuth } from '../contexts/AuthContext';

interface ActivityFormProps {
  babyId: string;
  onSuccess?: () => void;
}

const activityService = new ActivityService();

export const ActivityForm = ({ babyId, onSuccess }: ActivityFormProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('feed');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState('');
  const [details, setDetails] = useState<ActivityDetails>({});
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      const activity = new Activity({
        type,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        details,
        notes,
        babyId,
        userId: user.uid,
      });

      await activityService.addActivity(activity);
      
      toast({
        title: 'Activity added',
        status: 'success',
        duration: 3000,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error adding activity',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsFields = () => {
    switch (type) {
      case 'feed':
        return (
          <FormControl>
            <FormLabel>Feed Type</FormLabel>
            <Select
              value={details.feedType || ''}
              onChange={(e) => setDetails({ ...details, feedType: e.target.value as 'breast' | 'bottle' })}
            >
              <option value="breast">Breast</option>
              <option value="bottle">Bottle</option>
            </Select>
          </FormControl>
        );
      case 'diaper':
        return (
          <FormControl>
            <FormLabel>Diaper Type</FormLabel>
            <Select
              value={details.diaperType || ''}
              onChange={(e) => setDetails({ ...details, diaperType: e.target.value as 'wet' | 'soiled' | 'both' })}
            >
              <option value="wet">Wet</option>
              <option value="soiled">Soiled</option>
              <option value="both">Both</option>
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Activity Type</FormLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="feed">Feeding</option>
            <option value="diaper">Diaper Change</option>
            <option value="sleep">Sleep</option>
            <option value="growth">Growth</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Start Time</FormLabel>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </FormControl>

        {(type === 'feed' || type === 'sleep') && (
          <FormControl>
            <FormLabel>End Time</FormLabel>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </FormControl>
        )}

        {renderDetailsFields()}

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="brand"
          isLoading={loading}
          w="full"
        >
          Save Activity
        </Button>
      </VStack>
    </form>
  );
}; 