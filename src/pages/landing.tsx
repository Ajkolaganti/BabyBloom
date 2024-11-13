import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  SimpleGrid,
  useColorModeValue,
  Image,
  Flex,
  Badge,
  chakra,
} from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaBaby, FaBed, FaChartLine, FaShieldAlt, FaMobileAlt, FaCloud } from 'react-icons/fa';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

const Feature = ({ icon, title, description }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      bg={useColorModeValue('white', 'gray.800')}
      p={8}
      rounded="2xl"
      shadow="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      _hover={{
        transform: 'translateY(-5px)',
        shadow: '2xl',
      }}
      style={{
        transition: 'all 0.3s'
      }}
    >
      <VStack spacing={4} align="start">
        <Flex
          w={12}
          h={12}
          align="center"
          justify="center"
          rounded="xl"
          bg={useColorModeValue('brand.50', 'brand.900')}
        >
          <Icon as={icon} boxSize={6} color="brand.500" />
        </Flex>
        <Heading size="md">{title}</Heading>
        <Text color="gray.500" lineHeight="tall">
          {description}
        </Text>
      </VStack>
    </MotionBox>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Navigation */}
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={100}
        bg={useColorModeValue('white', 'gray.800')}
        borderBottomWidth="1px"
        borderColor={useColorModeValue('gray.100', 'gray.700')}
        py={4}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <Logo size="md" />
            <HStack spacing={4}>
              <Link href="/login">
                <Button variant="ghost" colorScheme="brand">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button colorScheme="brand">
                  Get Started
                </Button>
              </Link>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        bg={useColorModeValue('gray.50', 'gray.900')}
        pt={{ base: 32, md: 40 }}
        pb={{ base: 16, md: 24 }}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl" position="relative">
          <MotionBox
            style={{ opacity, y }}
            position="absolute"
            top="-20%"
            right="-10%"
            w="500px"
            h="500px"
            bg="brand.500"
            filter="blur(100px)"
            opacity="0.2"
            borderRadius="full"
          />
          
          <VStack spacing={8} align="center" textAlign="center">
            <Badge
              colorScheme="brand"
              px={3}
              py={1}
              rounded="full"
              textTransform="capitalize"
              fontSize="sm"
            >
              👶 Your Baby's Journey Starts Here
            </Badge>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heading
                size={{ base: "2xl", md: "3xl", lg: "4xl" }}
                bgGradient="linear(to-r, brand.500, accent.500)"
                bgClip="text"
                lineHeight="shorter"
                mb={4}
                fontWeight="extrabold"
              >
                Track Every Precious Moment
                <br />
                of Your Baby's Growth
              </Heading>
              <MotionText 
                fontSize={{ base: "lg", md: "xl" }}
                color="gray.500"
                maxW="2xl"
                mx="auto"
              >
                Keep track of feedings, diapers, sleep, and more with our intuitive baby tracking app.
                Designed by parents, for parents.
              </MotionText>
            </MotionBox>

            <HStack spacing={4} pt={4}>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  colorScheme="brand"
                  rounded="full"
                  px={8}
                  rightIcon={<Icon as={FaChartLine} />}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                >
                  Start Tracking Free
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="ghost"
                  colorScheme="brand"
                  rounded="full"
                  px={8}
                  _hover={{
                    transform: 'translateY(-2px)',
                  }}
                >
                  Learn More
                </Button>
              </Link>
            </HStack>

            <Box 
              w="full" 
              maxW="4xl"
              mt={16}
              rounded="3xl"
              overflow="hidden"
              shadow="2xl"
              position="relative"
            >
              <Box
                position="absolute"
                top="-10%"
                left="-10%"
                right="-10%"
                bottom="-10%"
                bg="brand.500"
                opacity="0.1"
                filter="blur(60px)"
              />
              <Image 
                src="/dashboard-preview.png" 
                alt="Dashboard Preview"
                w="full"
                h="auto"
                position="relative"
              />
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={8}
        >
          <Feature
            icon={FaBaby}
            title="Complete Tracking"
            description="Log feedings, diaper changes, sleep patterns, and growth measurements all in one place."
          />
          <Feature
            icon={FaChartLine}
            title="Smart Insights"
            description="Get personalized insights and visualize patterns with beautiful charts and summaries."
          />
          <Feature
            icon={FaMobileAlt}
            title="Mobile First"
            description="Access your baby's data anywhere, anytime with our mobile-friendly design."
          />
          <Feature
            icon={FaBed}
            title="Sleep Analysis"
            description="Monitor sleep patterns and get suggestions for better sleep schedules."
          />
          <Feature
            icon={FaCloud}
            title="Cloud Sync"
            description="Your data is automatically synced across all your devices in real-time."
          />
          <Feature
            icon={FaShieldAlt}
            title="Secure & Private"
            description="Your baby's data is encrypted and stored securely. Only you can access it."
          />
        </SimpleGrid>
      </Container>

      {/* CTA Section */}
      <Box 
        bg={useColorModeValue('gray.50', 'gray.900')}
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl" position="relative">
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            bg={useColorModeValue('white', 'gray.800')}
            p={12}
            rounded="3xl"
            shadow="xl"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
          >
            <VStack spacing={8} align="center" textAlign="center">
              <Heading size="xl">Ready to Start Tracking?</Heading>
              <Text fontSize="lg" color="gray.500" maxW="2xl">
                Join thousands of parents who trust BabyDiary to track their baby's daily activities.
                Start your free account today!
              </Text>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  colorScheme="brand"
                  rounded="full"
                  px={12}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                >
                  Create Free Account
                </Button>
              </Link>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 