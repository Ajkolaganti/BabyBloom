import {
  Box,
  Grid,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Button,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { FaBaby, FaBed, FaToilet, FaClock, FaChartLine, FaWeight } from 'react-icons/fa';
import { Activity } from '../models/Activity';
import { format, startOfDay, endOfDay, differenceInMinutes, eachDayOfInterval, subDays } from 'date-fns';
import { useState } from 'react';

const MotionBox = motion(Box);

interface BabyInsightsProps {
  activities: Activity[];
  babyName: string;
}

const COLORS = ['#E728AB', '#9850FF', '#00C9FF', '#FF9800'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string | number | Date;
}

interface LegendPayload {
  value: any;
  type?: string;
  id?: string;
  color?: string;
  payload?: {
    dataKey?: string;
    value?: any;
    strokeDasharray?: string;
  };
}

interface ChartData {
  date: Date;
  feeds: number;
  diapers: number;
  sleepHours: number;
}

// Add this interface for the Legend entry
interface LegendEntry {
  value: string;
  type?: string;
  id?: string;
  color?: string;
  dataKey?: string;
  payload?: {
    strokeDasharray?: string;
    value?: any;
    dataKey?: string;
    color?: string;
  };
}

export const BabyInsights = ({ activities, babyName }: BabyInsightsProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Process data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: startOfDay(date),
      feeds: 0,
      diapers: 0,
      sleepHours: 0,
    };
  }).reverse();

  // Process sleep patterns data
  const sleepPatterns = activities
    .filter(a => a.type === 'sleep' && a.endTime)
    .map(activity => ({
      startHour: new Date(activity.startTime).getHours(),
      duration: differenceInMinutes(activity.endTime!, activity.startTime) / 60,
    }));

  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    avgDuration: sleepPatterns
      .filter(p => p.startHour === hour)
      .reduce((acc, curr) => acc + curr.duration, 0) / 
      Math.max(sleepPatterns.filter(p => p.startHour === hour).length, 1),
  }));

  // Process feeding patterns
  const feedingTypes = activities
    .filter(a => a.type === 'feed')
    .reduce((acc, curr) => {
      const type = curr.details?.feedType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const feedingData = Object.entries(feedingTypes).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate daily averages
  const dailyAverages = {
    feeds: activities.filter(a => a.type === 'feed').length / 7,
    diapers: activities.filter(a => a.type === 'diaper').length / 7,
    sleepHours: activities
      .filter(a => a.type === 'sleep' && a.endTime)
      .reduce((acc, curr) => acc + differenceInMinutes(curr.endTime!, curr.startTime) / 60, 0) / 7,
  };

  // Add zoom capability to charts
  const [chartZoom, setChartZoom] = useState(1);

  // Update tooltip with proper types
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={bgColor}
          p={3}
          rounded="md"
          shadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontWeight="bold">
            {label instanceof Date ? format(label, 'MMM d, yyyy') : label}
          </Text>
          {payload.map((entry, index) => (
            <Text key={index} color={entry.color}>
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Add interactive legends
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (dataKey: string): void => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(dataKey)) {
      newHidden.delete(dataKey);
    } else {
      newHidden.add(dataKey);
    }
    setHiddenSeries(newHidden);
  };

  // Add interactive filters
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  // Update the Legend click handler
  const handleLegendClick = (data: LegendPayload) => {
    if (data?.payload?.dataKey) {
      toggleSeries(data.payload.dataKey);
    }
  };

  // Update the Legend formatter
  const formatLegend = (value: string, entry: LegendPayload) => {
    const dataKey = entry?.payload?.dataKey;
    if (!dataKey) return value;

    return (
      <Text
        as="span"
        color={hiddenSeries.has(dataKey) ? 'gray.400' : entry.color}
        cursor="pointer"
        _hover={{ textDecoration: 'underline' }}
      >
        {value}
      </Text>
    );
  };

  return (
    <VStack spacing={8} w="full">
      <AnimatePresence mode="wait">
        <MotionBox
          key="insights-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          w="full"
        >
          <Text
            fontSize="3xl"
            fontWeight="bold"
            textAlign="center"
            bgGradient="linear(to-r, brand.500, accent.500)"
            bgClip="text"
            mb={2}
          >
            {babyName}'s Insights
          </Text>
          <Text fontSize="md" color={textColor} textAlign="center">
            Last 7 Days Overview
          </Text>
        </MotionBox>

        <Tabs variant="soft-rounded" colorScheme="brand" w="full" mt={8}>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Sleep</Tab>
            <Tab>Feeding</Tab>
            <Tab>Trends</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <VStack align="start" spacing={4}>
                    <HStack spacing={4}>
                      <Icon as={FaClock} boxSize={8} color="brand.500" />
                      <Text fontSize="lg" fontWeight="medium">Daily Averages</Text>
                    </HStack>
                    <VStack align="start" spacing={2} w="full">
                      <Text fontSize="sm" color="gray.500">Feedings</Text>
                      <Progress 
                        value={dailyAverages.feeds} 
                        max={12} 
                        w="full" 
                        colorScheme="brand" 
                        rounded="full"
                      />
                      <Text fontSize="xs">{dailyAverages.feeds.toFixed(1)} times/day</Text>
                      
                      <Text fontSize="sm" color="gray.500" mt={2}>Sleep</Text>
                      <Progress 
                        value={dailyAverages.sleepHours} 
                        max={24} 
                        w="full" 
                        colorScheme="purple" 
                        rounded="full"
                      />
                      <Text fontSize="xs">{dailyAverages.sleepHours.toFixed(1)} hours/day</Text>
                      
                      <Text fontSize="sm" color="gray.500" mt={2}>Diapers</Text>
                      <Progress 
                        value={dailyAverages.diapers} 
                        max={10} 
                        w="full" 
                        colorScheme="orange" 
                        rounded="full"
                      />
                      <Text fontSize="xs">{dailyAverages.diapers.toFixed(1)} changes/day</Text>
                    </VStack>
                  </VStack>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="300px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Feeding Distribution</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {feedingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="300px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Activity Timeline</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={last7Days}
                      onMouseDown={() => setChartZoom(prev => prev * 1.2)}
                      onMouseUp={() => setChartZoom(1)}
                    >
                      <defs>
                        <linearGradient id="colorFeeds" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chakra-colors-brand-500)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--chakra-colors-brand-500)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chakra-colors-purple-500)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--chakra-colors-purple-500)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(date, 'EEE')}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        // @ts-ignore
                        onClick={handleLegendClick}
                        // @ts-ignore
                        formatter={formatLegend}
                      />
                      {!hiddenSeries.has('feeds') && (
                        <Area
                          type="monotone"
                          dataKey="feeds"
                          stroke="var(--chakra-colors-brand-500)"
                          fillOpacity={1}
                          fill="url(#colorFeeds)"
                        />
                      )}
                      {/* ... other series */}
                    </AreaChart>
                  </ResponsiveContainer>
                </MotionBox>
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Sleep Patterns</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="avgDuration" 
                        fill="var(--chakra-colors-purple-500)"
                        name="Average Sleep Duration (hours)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <VStack spacing={4}>
                    <Text fontSize="lg" fontWeight="medium">Sleep Quality</Text>
                    <SimpleGrid columns={2} spacing={6}>
                      <VStack>
                        <CircularProgress 
                          value={dailyAverages.sleepHours} 
                          max={24} 
                          size="120px"
                          thickness="8px"
                          color="purple.500"
                        >
                          <CircularProgressLabel>
                            {dailyAverages.sleepHours.toFixed(1)}h
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500">Daily Average</Text>
                      </VStack>
                      <VStack>
                        <CircularProgress 
                          value={sleepPatterns.length} 
                          max={10} 
                          size="120px"
                          thickness="8px"
                          color="brand.500"
                        >
                          <CircularProgressLabel>
                            {sleepPatterns.length}
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500">Naps/Day</Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Weekly Sleep Trend</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(date, 'EEE')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(date, 'MMM d')}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sleepHours"
                        stroke="var(--chakra-colors-purple-500)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--chakra-colors-purple-500)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MotionBox>
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Feeding Distribution</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="20%" 
                      outerRadius="80%" 
                      data={feedingData}
                    >
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        dataKey="value"
                      />
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Feeding Times</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={hourlyData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="hour" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Feeds"
                        dataKey="feeds"
                        stroke="var(--chakra-colors-brand-500)"
                        fill="var(--chakra-colors-brand-500)"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Weekly Feeding Trend</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(date, 'EEE')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(date, 'MMM d')}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="feeds"
                        stroke="var(--chakra-colors-brand-500)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--chakra-colors-brand-500)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <VStack spacing={4}>
                    <Text fontSize="lg" fontWeight="medium">Feeding Summary</Text>
                    <SimpleGrid columns={2} spacing={6}>
                      <VStack>
                        <CircularProgress 
                          value={dailyAverages.feeds} 
                          max={12} 
                          size="120px"
                          thickness="8px"
                          color="brand.500"
                        >
                          <CircularProgressLabel>
                            {dailyAverages.feeds.toFixed(1)}
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500">Feeds/Day</Text>
                      </VStack>
                      <VStack>
                        <CircularProgress 
                          value={(feedingData.find(d => d.name === 'breast')?.value || 0) / 
                            (feedingData.reduce((acc, curr) => acc + curr.value, 0) || 1) * 100} 
                          max={100} 
                          size="120px"
                          thickness="8px"
                          color="accent.500"
                        >
                          <CircularProgressLabel>
                            {((feedingData.find(d => d.name === 'breast')?.value || 0) / 
                              (feedingData.reduce((acc, curr) => acc + curr.value, 0) || 1) * 100).toFixed(0)}%
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500">Breast Feeds</Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </MotionBox>
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Diaper Changes by Type</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Wet', value: activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'wet').length },
                          { name: 'Soiled', value: activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'soiled').length },
                          { name: 'Both', value: activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'both').length },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {activities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Daily Diaper Changes</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(date, 'EEE')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(date, 'MMM d')}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                        }}
                      />
                      <Bar 
                        dataKey="diapers" 
                        fill="var(--chakra-colors-orange-500)"
                        name="Diaper Changes"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </MotionBox>

                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  bg={bgColor}
                  p={6}
                  rounded="2xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <VStack spacing={4}>
                    <Text fontSize="lg" fontWeight="medium">Diaper Summary</Text>
                    <SimpleGrid columns={2} spacing={6}>
                      <VStack>
                        <CircularProgress 
                          value={dailyAverages.diapers} 
                          max={12} 
                          size="120px"
                          thickness="8px"
                          color="orange.500"
                        >
                          <CircularProgressLabel>
                            {dailyAverages.diapers.toFixed(1)}
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500">Changes/Day</Text>
                      </VStack>
                      <VStack>
                        <CircularProgress 
                          value={activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'wet').length / 
                            Math.max(activities.filter(a => a.type === 'diaper').length, 1) * 100} 
                          max={100} 
                          size="120px"
                          thickness="8px"
                          color="blue.500"
                        >
                          <CircularProgressLabel>
                            {(activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'wet').length / 
                              Math.max(activities.filter(a => a.type === 'diaper').length, 1) * 100).toFixed(0)}%
                          </CircularProgressLabel>
                        </CircularProgress>
                        <Text fontSize="sm" color="gray.500">Wet Diapers</Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </MotionBox>
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              {/* Add overall trends and patterns here */}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </AnimatePresence>
    </VStack>
  );
}; 