import { Box, Text, Icon, useColorModeValue, Stat, StatLabel, StatNumber, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

const MotionBox = motion(Box);

interface TrackingCardProps {
  icon: IconType;
  title: string;
  value: string;
  subValue?: string;
  onClick: () => void;
}

export const TrackingCard = ({ icon, title, value, subValue, onClick }: TrackingCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('brand.100', 'brand.900');
  
  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      cursor="pointer"
      onClick={onClick}
      bg={bgColor}
      p={6}
      rounded="2xl"
      shadow="lg"
      position="relative"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, var(--chakra-colors-brand-500), var(--chakra-colors-accent-500))',
      }}
    >
      <HStack spacing={4} align="flex-start">
        <Icon 
          as={icon} 
          boxSize={8} 
          color="brand.500"
          transform="rotate(-10deg)"
        />
        <Stat>
          <StatLabel fontSize="sm" color="gray.500">{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" bgGradient="linear(to-r, brand.500, accent.500)" bgClip="text">
            {value}
          </StatNumber>
          {subValue && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              {subValue}
            </Text>
          )}
        </Stat>
      </HStack>
    </MotionBox>
  );
}; 