import { Box, VStack, IconButton } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { FaTimes } from 'react-icons/fa';

interface GlassmorphicFormProps {
  children: React.ReactNode;
  onSubmit: () => void;
  onClose: () => void;
}

export const GlassmorphicForm = ({ children, onSubmit, onClose }: GlassmorphicFormProps) => {
  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        onClick={onClose}
        zIndex={999}
      />
      <Box
        css={css`
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        `}
        p={6}
        rounded="2xl"
        shadow="xl"
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        maxW="md"
        w="90%"
        maxH="90vh"
        overflowY="auto"
        zIndex={1000}
      >
        <IconButton
          aria-label="Close"
          icon={<FaTimes />}
          position="absolute"
          right={2}
          top={2}
          variant="ghost"
          onClick={onClose}
        />
        <VStack spacing={4} pt={8}>
          {children}
        </VStack>
      </Box>
    </>
  );
}; 