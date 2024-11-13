import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Avatar,
  HStack,
  Box,
  Divider,
  MenuDivider,
  MenuGroup,
} from '@chakra-ui/react';
import { FaBaby, FaEdit, FaPlus } from 'react-icons/fa';
import { Baby } from '../services/BabyService';
import { format } from 'date-fns';
import { EditBabyProfile } from './EditBabyProfile';
import { useEffect } from 'react';

interface BabyProfileProps {
  baby: Baby;
  allBabies: Baby[];
  onBabySelect: (babyId: string) => void;
  onGenderChange: (gender: string) => void;
  onAddNewBaby: () => void;
}

export const BabyProfile = ({ 
  baby, 
  allBabies, 
  onBabySelect, 
  onGenderChange,
  onAddNewBaby 
}: BabyProfileProps) => {
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  useEffect(() => {
    onGenderChange(baby.gender);
  }, [baby.gender, onGenderChange]);

  const handleEditSuccess = () => {
    onGenderChange(baby.gender);
    onEditClose();
  };

  const getAge = (birthDate: Date) => {
    if (!birthDate || !(birthDate instanceof Date)) {
      return 'Unknown';
    }

    try {
      const today = new Date();
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
        today.getMonth() - birthDate.getMonth();
      
      if (months < 1) {
        const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        return `${days} days`;
      }
      return `${months} months`;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'Unknown';
    }
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FaBaby />}
          variant="ghost"
          position="fixed"
          top={4}
          right={4}
          rounded="full"
        />
        <MenuList>
          <MenuGroup title="Select Baby">
            {allBabies.map((b) => (
              <MenuItem
                key={b.id}
                onClick={() => onBabySelect(b.id!)}
                icon={
                  <Avatar
                    name={b.name}
                    size="xs"
                    bg={b === baby ? 'brand.500' : 'gray.500'}
                  />
                }
                fontWeight={b === baby ? 'bold' : 'normal'}
              >
                {b.name}
              </MenuItem>
            ))}
            <MenuItem
              icon={<FaPlus />}
              onClick={onAddNewBaby}
            >
              Add New Baby
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuItem onClick={onViewOpen}>View Profile</MenuItem>
          <MenuItem onClick={onEditOpen}>Edit Profile</MenuItem>
        </MenuList>
      </Menu>

      <Modal isOpen={isViewOpen} onClose={onViewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Baby Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} pb={6}>
              <Avatar
                size="xl"
                name={baby.name}
                src=""
                bg="brand.500"
              />
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">{baby.name}</Text>
                <Text color="gray.500">{getAge(baby.birthDate)} old</Text>
              </VStack>
              <Box w="full">
                <HStack justify="space-between" py={2}>
                  <Text fontWeight="medium">Birth Date</Text>
                  <Text>{baby.birthDate ? format(baby.birthDate, 'MMMM d, yyyy') : 'Not set'}</Text>
                </HStack>
                <HStack justify="space-between" py={2}>
                  <Text fontWeight="medium">Gender</Text>
                  <Text>{baby.gender || 'Not set'}</Text>
                </HStack>
                <HStack justify="space-between" py={2}>
                  <Text fontWeight="medium">Birth Weight</Text>
                  <Text>{baby.birthWeight ? `${baby.birthWeight} kg` : 'Not set'}</Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <EditBabyProfile
        baby={baby}
        isOpen={isEditOpen}
        onClose={onEditClose}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}; 