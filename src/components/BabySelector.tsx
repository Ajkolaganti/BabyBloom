import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useDisclosure,
  Select,
  useToast,
} from '@chakra-ui/react';
import { BabyService, Baby } from '../services/BabyService';
import { useAuth } from '../contexts/AuthContext';

interface BabySelectorProps {
  selectedBabyId: string;
  onBabySelect: (babyId: string) => void;
}

const babyService = new BabyService();

export const BabySelector = ({ selectedBabyId, onBabySelect }: BabySelectorProps) => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [newBabyName, setNewBabyName] = useState('');
  const toast = useToast();

  const loadBabies = useCallback(async () => {
    if (!user) return;
    const data = await babyService.getBabies(user.uid);
    setBabies(data);
    if (data.length > 0 && !selectedBabyId) {
      onBabySelect(data[0].id!);
    }
  }, [user, selectedBabyId, onBabySelect]);

  useEffect(() => {
    if (user) {
      loadBabies();
    }
  }, [user, loadBabies]);

  const handleAddBaby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await babyService.addBaby({
        name: newBabyName,
        userId: user.uid,
      });
      await loadBabies();
      setNewBabyName('');
      onClose();
      toast({
        title: 'Baby added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error adding baby',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <>
      <Select
        value={selectedBabyId}
        onChange={(e) => onBabySelect(e.target.value)}
        mb={4}
      >
        {babies.map((baby) => (
          <option key={baby.id} value={baby.id}>
            {baby.name}
          </option>
        ))}
      </Select>
      <Button size="sm" onClick={onOpen} colorScheme="brand" mb={4}>
        Add New Baby
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Baby</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleAddBaby}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Baby Name</FormLabel>
                  <Input
                    value={newBabyName}
                    onChange={(e) => setNewBabyName(e.target.value)}
                    placeholder="Enter baby's name"
                  />
                </FormControl>
                <Button type="submit" colorScheme="brand" w="full">
                  Add Baby
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 