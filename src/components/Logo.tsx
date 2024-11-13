import { Box, Text, HStack, Circle } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCircle = motion(Circle);

interface LogoProps {
  withText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ withText = true, size = 'md' }: LogoProps) => {
  const sizes = {
    sm: { icon: '24px', text: 'lg', circle: '10px' },
    md: { icon: '32px', text: 'xl', circle: '12px' },
    lg: { icon: '40px', text: '2xl', circle: '14px' },
  };

  return (
    <HStack spacing={2}>
      <MotionBox
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        position="relative"
        width={sizes[size].icon}
        height={sizes[size].icon}
      >
        <Circle
          size={sizes[size].icon}
          bg="brand.500"
          position="absolute"
          opacity={0.3}
          transform="scale(1.2)"
        />
        <Circle
          size={sizes[size].icon}
          bgGradient="linear(to-r, brand.500, accent.500)"
        />
        <MotionCircle
          position="absolute"
          top="15%"
          right="15%"
          size={sizes[size].circle}
          bg="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
      </MotionBox>
      {withText && (
        <Text
          fontSize={sizes[size].text}
          fontWeight="bold"
          bgGradient="linear(to-r, brand.500, accent.500)"
          bgClip="text"
          letterSpacing="tight"
          fontFamily="heading"
        >
          BabyDiary
        </Text>
      )}
    </HStack>
  );
}; 