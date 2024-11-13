import { 
  VStack, 
  HStack, 
  Text, 
  Icon, 
  Box,
  useColorModeValue,
  Badge,
  Collapse,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  useDisclosure,
  Button,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaBaby, FaBed, FaToilet, FaTrash } from 'react-icons/fa';
import { Activity as ActivityModel } from '../models/Activity';
import { useState, useMemo, useRef } from 'react';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import { ActivityService } from '../services/ActivityService';

const MotionBox = motion(Box);

interface ActivityListProps {
  activities: ActivityModel[];
  onSuccess: () => void;
}

interface DailySummary {
  date: Date;
  feedCount: number;
  diaperCount: number;
  sleepCount: number;
  totalSleepDuration: number;
  activities: ActivityModel[];
}

interface ActivityCardProps {
  activity: ActivityModel;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'feed':
      return FaBaby;
    case 'sleep':
      return FaBed;
    case 'diaper':
      return FaToilet;
    default:
      return FaBaby;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'feed':
      return 'brand';
    case 'sleep':
      return 'purple';
    case 'diaper':
      return 'orange';
    default:
      return 'gray';
  }
};

const formatDuration = (startTime: Date, endTime: Date | null) => {
  if (!endTime) return null;
  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const ActivityCard = ({ activity, isExpanded, onToggle, onDelete }: ActivityCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      bg={bgColor}
      p={4}
      rounded="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <HStack spacing={4} onClick={onToggle} cursor="pointer">
        <Icon 
          as={getActivityIcon(activity.type)} 
          boxSize={6} 
          color={`${getActivityColor(activity.type)}.500`}
        />
        <VStack align="start" spacing={1} flex={1}>
          <HStack justify="space-between" w="full">
            <Text fontWeight="medium">
              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={getActivityColor(activity.type)}>
                {format(activity.startTime, 'h:mm a')}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {formatDistanceToNow(activity.startTime, { addSuffix: true })}
              </Text>
              <IconButton
                aria-label="Delete activity"
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  if (activity.id) {
                    onDelete(activity.id);
                  }
                }}
              />
            </HStack>
          </HStack>
        </VStack>
      </HStack>

      <Collapse in={isExpanded}>
        <VStack align="start" mt={4} spacing={2} pl={10}>
          {activity.endTime && (
            <HStack>
              <Text fontSize="sm" fontWeight="medium">Duration:</Text>
              <Text fontSize="sm">{formatDuration(activity.startTime, activity.endTime)}</Text>
            </HStack>
          )}
          {activity.details && Object.entries(activity.details).map(([key, value]) => (
            <HStack key={key}>
              <Text fontSize="sm" fontWeight="medium">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </Text>
              <Text fontSize="sm">
                {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
              </Text>
            </HStack>
          ))}
          {activity.notes && (
            <Box>
              <Text fontSize="sm" fontWeight="medium">Notes:</Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {activity.notes}
              </Text>
            </Box>
          )}
        </VStack>
      </Collapse>
    </MotionBox>
  );
};

const DailySummaryCard = ({ summary }: { summary: DailySummary }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      bg={bgColor}
      p={4}
      rounded="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      mb={4}
    >
      <Text fontWeight="bold" mb={4}>
        {format(summary.date, 'EEEE, MMMM d, yyyy')}
      </Text>
      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        <Stat>
          <StatLabel>Feedings</StatLabel>
          <StatNumber>{summary.feedCount}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Diapers</StatLabel>
          <StatNumber>{summary.diaperCount}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Sleep</StatLabel>
          <StatNumber>{summary.sleepCount}</StatNumber>
          <StatHelpText>
            {Math.round(summary.totalSleepDuration / 60)}h total
          </StatHelpText>
        </Stat>
      </Grid>
    </Box>
  );
};

// Create an instance of ActivityService
const activityService = new ActivityService();

export const ActivityList = ({ activities, onSuccess }: ActivityListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<ActivityModel | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const handleDelete = async () => {
    if (!activityToDelete?.id) return;

    try {
      await activityService.deleteActivity(activityToDelete.id, activityToDelete.userId);
      toast({
        title: 'Activity deleted',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error deleting activity',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      onClose();
      setActivityToDelete(null);
    }
  };

  const dailySummaries = useMemo(() => {
    const summariesMap = new Map<string, DailySummary>();
    
    activities.forEach(activity => {
      const dateStr = format(activity.startTime, 'yyyy-MM-dd');
      if (!summariesMap.has(dateStr)) {
        summariesMap.set(dateStr, {
          date: activity.startTime,
          feedCount: 0,
          diaperCount: 0,
          sleepCount: 0,
          totalSleepDuration: 0,
          activities: [],
        });
      }

      const summary = summariesMap.get(dateStr)!;
      summary.activities.push(activity);

      switch (activity.type) {
        case 'feed':
          summary.feedCount++;
          break;
        case 'diaper':
          summary.diaperCount++;
          break;
        case 'sleep':
          summary.sleepCount++;
          if (activity.endTime) {
            summary.totalSleepDuration += 
              (activity.endTime.getTime() - activity.startTime.getTime()) / (1000 * 60);
          }
          break;
      }
    });

    return Array.from(summariesMap.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [activities]);

  const filteredActivities = selectedType
    ? activities.filter(a => a.type === selectedType)
    : activities;

  return (
    <>
      <Tabs variant="soft-rounded" colorScheme="brand" w="full">
        <TabList mb={4}>
          <Tab onClick={() => setSelectedType(null)}>All</Tab>
          <Tab onClick={() => setSelectedType('feed')}>Feedings</Tab>
          <Tab onClick={() => setSelectedType('sleep')}>Sleep</Tab>
          <Tab onClick={() => setSelectedType('diaper')}>Diapers</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {dailySummaries.map(summary => (
                <Box key={summary.date.toISOString()}>
                  <DailySummaryCard summary={summary} />
                  <VStack spacing={4} align="stretch">
                    {summary.activities
                      .filter(activity => !selectedType || activity.type === selectedType)
                      .map(activity => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          isExpanded={expandedId === activity.id}
                          onToggle={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                          onDelete={() => {
                            setActivityToDelete(activity);
                            onOpen();
                          }}
                        />
                      ))}
                  </VStack>
                  <Divider my={6} />
                </Box>
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {filteredActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isExpanded={expandedId === activity.id}
                  onToggle={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                  onDelete={() => {
                    setActivityToDelete(activity);
                    onOpen();
                  }}
                />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {filteredActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isExpanded={expandedId === activity.id}
                  onToggle={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                  onDelete={() => {
                    setActivityToDelete(activity);
                    onOpen();
                  }}
                />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {filteredActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isExpanded={expandedId === activity.id}
                  onToggle={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                  onDelete={() => {
                    setActivityToDelete(activity);
                    onOpen();
                  }}
                />
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Activity
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}; 