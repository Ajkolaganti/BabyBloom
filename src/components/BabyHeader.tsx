import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionText = motion(Text);

interface BabyHeaderProps {
  babyName: string;
  gender: string;
}

export const BabyHeader = ({ babyName, gender }: BabyHeaderProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      w="full"
      maxW="container.md"
      mx="auto"
      bg={bgColor}
      p={6}
      rounded="2xl"
      shadow="lg"
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
      textAlign="center"
    >
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        w="300px"
        h="300px"
        bg={gender === 'female' ? 'pink.500' : 'blue.500'}
        opacity="0.1"
        borderRadius="full"
        filter="blur(40px)"
      />
      
      <VStack spacing={2}>
        <MotionText
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          bgGradient={
            gender === 'female' 
              ? 'linear(to-r, pink.400, purple.500)' 
              : 'linear(to-r, blue.400, cyan.500)'
          }
          bgClip="text"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {babyName}'s Dashboard
        </MotionText>
        
        <MotionText
          color="gray.500"
          fontSize="sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Tracking every precious moment of your little one's day
        </MotionText>
      </VStack>
      
      <Box
        position="absolute"
        bottom="-30%"
        left="-10%"
        w="200px"
        h="200px"
        bg={gender === 'female' ? 'purple.500' : 'cyan.500'}
        opacity="0.05"
        borderRadius="full"
        filter="blur(40px)"
      />
    </MotionBox>
  );
}; 