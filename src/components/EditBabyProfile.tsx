import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Baby, BabyService } from '../services/BabyService';

interface EditBabyProfileProps {
  baby: Baby;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const babyService = new BabyService();

export const EditBabyProfile = ({ baby, isOpen, onClose, onSuccess }: EditBabyProfileProps) => {
  const [name, setName] = useState(baby.name);
  const [birthDate, setBirthDate] = useState(baby.birthDate.toISOString().split('T')[0]);
  const [gender, setGender] = useState(baby.gender);
  const [birthWeight, setBirthWeight] = useState(baby.birthWeight);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await babyService.updateBaby(baby.id!, {
        ...baby,
        name,
        birthDate: new Date(birthDate),
        gender,
        birthWeight,
      });

      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} pb={6}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Birth Date</FormLabel>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Birth Weight (kg)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                w="full"
                isLoading={loading}
              >
                Save Changes
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 