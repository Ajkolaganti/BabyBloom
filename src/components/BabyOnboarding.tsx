import { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Progress,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { BabyService } from '../services/BabyService';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

interface OnboardingStep {
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Baby's Name",
    description: "What's your baby's name?",
  },
  {
    title: "Birth Date",
    description: "When was your baby born?",
  },
  {
    title: "Gender",
    description: "What's your baby's gender?",
  },
  {
    title: "Birth Weight",
    description: "What was your baby's birth weight?",
  },
];

export const BabyOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [babyData, setBabyData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    birthWeight: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const babyService = new BabyService();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await babyService.addBaby({
        ...babyData,
        userId: user.uid,
        birthDate: new Date(babyData.birthDate),
      });

      toast({
        title: 'Profile created!',
        description: `Welcome, ${babyData.name}!`,
        status: 'success',
        duration: 3000,
      });

      router.push('/');
    } catch (error) {
      toast({
        title: 'Error creating profile',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Enter baby's name"
              value={babyData.name}
              onChange={(e) => setBabyData({ ...babyData, name: e.target.value })}
            />
          </FormControl>
        );
      case 1:
        return (
          <FormControl isRequired>
            <FormLabel>Birth Date</FormLabel>
            <Input
              type="date"
              value={babyData.birthDate}
              onChange={(e) => setBabyData({ ...babyData, birthDate: e.target.value })}
            />
          </FormControl>
        );
      case 2:
        return (
          <FormControl isRequired>
            <FormLabel>Gender</FormLabel>
            <Select
              placeholder="Select gender"
              value={babyData.gender}
              onChange={(e) => setBabyData({ ...babyData, gender: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormControl>
        );
      case 3:
        return (
          <FormControl isRequired>
            <FormLabel>Birth Weight (kg)</FormLabel>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter birth weight"
              value={babyData.birthWeight}
              onChange={(e) => setBabyData({ ...babyData, birthWeight: e.target.value })}
            />
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6}>
      <VStack spacing={8} align="stretch">
        <Progress
          value={(currentStep + 1) * (100 / steps.length)}
          size="sm"
          colorScheme="brand"
          borderRadius="full"
        />

        <VStack spacing={2} align="center">
          <Heading size="lg" color="brand.500">
            {steps[currentStep].title}
          </Heading>
          <Text color="gray.500">
            {steps[currentStep].description}
          </Text>
        </VStack>

        <Box>
          {renderStep()}
        </Box>

        <HStack justify="space-between">
          <Button
            onClick={handleBack}
            isDisabled={currentStep === 0}
            variant="ghost"
          >
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              colorScheme="brand"
              onClick={handleSubmit}
              isLoading={loading}
            >
              Complete
            </Button>
          ) : (
            <Button
              colorScheme="brand"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}; 