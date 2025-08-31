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
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.startTime);
      return activityDate >= dayStart && activityDate <= dayEnd;
    });
    
    const feeds = dayActivities.filter(a => a.type === 'feed').length;
    const diapers = dayActivities.filter(a => a.type === 'diaper').length;
    const sleepHours = dayActivities
      .filter(a => a.type === 'sleep' && a.endTime)
      .reduce((acc, curr) => acc + differenceInMinutes(curr.endTime!, curr.startTime) / 60, 0);
    
    return {
      date: dayStart,
      day: format(dayStart, 'EEE'),
      feeds,
      diapers,
      sleepHours: Math.round(sleepHours * 10) / 10,
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

  // Calculate daily averages from last 7 days
  const totalFeeds = last7Days.reduce((sum, day) => sum + day.feeds, 0);
  const totalDiapers = last7Days.reduce((sum, day) => sum + day.diapers, 0);
  const totalSleepHours = last7Days.reduce((sum, day) => sum + day.sleepHours, 0);
  
  const dailyAverages = {
    feeds: Math.round((totalFeeds / 7) * 10) / 10,
    diapers: Math.round((totalDiapers / 7) * 10) / 10,
    sleepHours: Math.round((totalSleepHours / 7) * 10) / 10,
  };

  // Today's stats
  const todayStats = last7Days[last7Days.length - 1] || { feeds: 0, diapers: 0, sleepHours: 0 };
  
  // Weekly totals
  const weeklyTotals = {
    feeds: totalFeeds,
    diapers: totalDiapers,
    sleepHours: Math.round(totalSleepHours * 10) / 10,
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
                    <SimpleGrid columns={3} spacing={4} w="full">
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                          {todayStats.feeds}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Feeds Today
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Avg: {dailyAverages.feeds}/day
                        </Text>
                      </VStack>
                      
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          {todayStats.sleepHours}h
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Sleep Today
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Avg: {dailyAverages.sleepHours}h/day
                        </Text>
                      </VStack>
                      
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                          {todayStats.diapers}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Diapers Today
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Avg: {dailyAverages.diapers}/day
                        </Text>
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
                >
                  <VStack spacing={4}>
                    <Text fontSize="lg" fontWeight="medium">Weekly Summary</Text>
                    <SimpleGrid columns={3} spacing={6}>
                      <VStack>
                        <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                          {weeklyTotals.feeds}
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Total Feeds
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          This Week
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                          {weeklyTotals.sleepHours}h
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Total Sleep
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          This Week
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                          {weeklyTotals.diapers}
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Diaper Changes
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          This Week
                        </Text>
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
                  h="300px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Daily Activity Trends</Text>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="feeds"
                        stroke="var(--chakra-colors-brand-500)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--chakra-colors-brand-500)', strokeWidth: 2, r: 4 }}
                        name="Feeds"
                      />
                      <Line
                        type="monotone"
                        dataKey="sleepHours"
                        stroke="var(--chakra-colors-purple-500)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--chakra-colors-purple-500)', strokeWidth: 2, r: 4 }}
                        name="Sleep Hours"
                      />
                      <Line
                        type="monotone"
                        dataKey="diapers"
                        stroke="var(--chakra-colors-orange-500)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--chakra-colors-orange-500)', strokeWidth: 2, r: 4 }}
                        name="Diapers"
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Sleep Patterns by Hour</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyData.filter(d => d.avgDuration > 0)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="hour"
                        tickFormatter={(hour) => `${hour}:00`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Avg Duration']}
                        labelFormatter={(hour) => `${hour}:00`}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="avgDuration" 
                        fill="var(--chakra-colors-purple-500)"
                        name="Avg Sleep Duration"
                        radius={[4, 4, 0, 0]}
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
                    <SimpleGrid columns={3} spacing={4}>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          {dailyAverages.sleepHours}h
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Daily Average
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {Math.round(sleepPatterns.length / 7 * 10) / 10}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Naps/Day
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                          {sleepPatterns.length > 0 ? 
                            Math.round(sleepPatterns.reduce((acc, curr) => acc + curr.duration, 0) / sleepPatterns.length * 10) / 10 
                            : 0}h
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Avg Nap Length
                        </Text>
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>7-Day Sleep Trend</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}h`, 'Sleep Hours']}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sleepHours"
                        stroke="var(--chakra-colors-purple-500)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--chakra-colors-purple-500)', strokeWidth: 2, r: 4 }}
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
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={feedingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {feedingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} times`, 'Total']} />
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Feeding Times by Hour</Text>
                  <VStack spacing={4}>
                    {Array.from({ length: 6 }, (_, i) => {
                      const timeRange = `${i * 4}:00 - ${(i + 1) * 4}:00`;
                      const feedCount = activities.filter(a => {
                        if (a.type !== 'feed') return false;
                        const hour = new Date(a.startTime).getHours();
                        return hour >= i * 4 && hour < (i + 1) * 4;
                      }).length;
                      
                      return (
                        <Box key={i} w="full">
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">{timeRange}</Text>
                            <Text fontSize="sm" fontWeight="bold">{feedCount} feeds</Text>
                          </HStack>
                          <Progress 
                            value={feedCount} 
                            max={Math.max(...Array.from({ length: 6 }, (_, j) => 
                              activities.filter(a => {
                                if (a.type !== 'feed') return false;
                                const hour = new Date(a.startTime).getHours();
                                return hour >= j * 4 && hour < (j + 1) * 4;
                              }).length
                            ), 1)}
                            colorScheme="brand"
                            rounded="full"
                            size="lg"
                          />
                        </Box>
                      );
                    })}
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>7-Day Feeding Trend</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={last7Days}>
                      <defs>
                        <linearGradient id="colorFeeds" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chakra-colors-brand-500)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--chakra-colors-brand-500)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        label={{ value: 'Feeds', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}`, 'Feeds']}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="feeds"
                        stroke="var(--chakra-colors-brand-500)"
                        strokeWidth={2}
                        fill="url(#colorFeeds)"
                      />
                    </AreaChart>
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
                    <SimpleGrid columns={3} spacing={4}>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                          {dailyAverages.feeds}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Feeds/Day
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                          {feedingData.length > 0 ? 
                            ((feedingData.find(d => d.name === 'breast')?.value || 0) / 
                            feedingData.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(0) 
                            : 0}%
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Breast Feeds
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {weeklyTotals.feeds}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Total This Week
                        </Text>
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Diaper Types This Week</Text>
                  <VStack spacing={4}>
                    {[
                      { name: 'Wet', value: activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'wet').length, color: 'blue.500' },
                      { name: 'Soiled', value: activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'soiled').length, color: 'orange.500' },
                      { name: 'Both', value: activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'both').length, color: 'red.500' },
                    ].map((item, index) => (
                      <Box key={index} w="full">
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">{item.name}</Text>
                          <Text fontSize="sm" fontWeight="bold">{item.value}</Text>
                        </HStack>
                        <Progress 
                          value={item.value} 
                          max={Math.max(...[
                            activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'wet').length,
                            activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'soiled').length,
                            activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'both').length,
                          ], 1)} 
                          colorScheme={item.color.split('.')[0]}
                          rounded="full"
                          size="lg"
                        />
                      </Box>
                    ))}
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>7-Day Diaper Trend</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        label={{ value: 'Changes', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value) => [`${value}`, 'Diaper Changes']}
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="diapers" 
                        fill="var(--chakra-colors-orange-500)"
                        name="Daily Changes"
                        radius={[4, 4, 0, 0]}
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
                    <SimpleGrid columns={3} spacing={4}>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                          {dailyAverages.diapers}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Changes/Day
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {activities.filter(a => a.type === 'diaper').length > 0 ? 
                            (activities.filter(a => a.type === 'diaper' && a.details?.diaperType === 'wet').length / 
                            activities.filter(a => a.type === 'diaper').length * 100).toFixed(0) 
                            : 0}%
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Wet Only
                        </Text>
                      </VStack>
                      <VStack>
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          {weeklyTotals.diapers}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Total This Week
                        </Text>
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
                  <Text fontSize="lg" fontWeight="medium" mb={4}>7-Day Feeding Pattern</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="feeds" 
                        fill="var(--chakra-colors-brand-500)"
                        name="Daily Feeds"
                        radius={[4, 4, 0, 0]}
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
                  h="400px"
                >
                  <Text fontSize="lg" fontWeight="medium" mb={4}>Feeding Type Distribution</Text>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {feedingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} times`, 'Count']} />
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
                >
                  <VStack spacing={4}>
                    <Text fontSize="lg" fontWeight="medium">Key Insights</Text>
                    <VStack align="start" spacing={3} w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Most Active Day:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {last7Days.reduce((max, day) => 
                            (day.feeds + day.diapers) > (max.feeds + max.diapers) ? day : max
                          ).day}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Best Sleep Day:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {last7Days.reduce((max, day) => 
                            day.sleepHours > max.sleepHours ? day : max
                          ).day}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Avg Time Between Feeds:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {dailyAverages.feeds > 0 ? Math.round(24 / dailyAverages.feeds * 10) / 10 : 0}h
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Sleep Efficiency:</Text>
                        <Text fontSize="sm" fontWeight="bold" color={dailyAverages.sleepHours >= 12 ? "green.500" : dailyAverages.sleepHours >= 8 ? "yellow.500" : "red.500"}>
                          {dailyAverages.sleepHours >= 12 ? "Excellent" : dailyAverages.sleepHours >= 8 ? "Good" : "Needs Attention"}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </MotionBox>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </AnimatePresence>
    </VStack>
  );
}; 