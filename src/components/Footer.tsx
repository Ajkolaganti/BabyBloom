import { Box, Text, Icon, HStack, useColorModeValue } from '@chakra-ui/react';
import { FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionIcon = motion(Icon);

export const Footer = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const heartColor = useColorModeValue('pink.500', 'pink.400');

  return (
    <Box
      as="footer"
      w="full"
      py={4}
      textAlign="center"
      position="relative"
      mt="auto"
    >
      <HStack 
        spacing={2} 
        justify="center"
        fontSize="sm"
        color={textColor}
      >
        <Text>Made with</Text>
        <MotionIcon
          as={FaHeart}
          color={heartColor}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <Text>by a parent, for parents</Text>
      </HStack>
      <Text
        fontSize="xs"
        color={textColor}
        mt={1}
        fontStyle="italic"
      >
        Because every moment with your little one is precious
      </Text>
    </Box>
  );
}; 