import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';

export interface Baby {
  id?: string;
  name: string;
  userId: string;
  birthDate: Date;
  gender: string;
  birthWeight: string;
  createdAt?: Date;
}

export class BabyService {
  private collection;

  constructor() {
    this.collection = collection(db, 'babies');
  }

  async addBaby(baby: Baby): Promise<string> {
    try {
      const docRef = await addDoc(this.collection, {
        ...baby,
        birthDate: Timestamp.fromDate(baby.birthDate),
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding baby:', error);
      throw error;
    }
  }

  async getBabies(userId: string): Promise<Baby[]> {
    try {
      const q = query(
        this.collection,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          birthDate: data.birthDate.toDate(),
          createdAt: data.createdAt?.toDate(),
        } as Baby;
      });
    } catch (error) {
      console.error('Error getting babies:', error);
      throw error;
    }
  }

  async updateBaby(id: string, baby: Baby): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      await updateDoc(docRef, {
        ...baby,
        birthDate: Timestamp.fromDate(baby.birthDate),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating baby:', error);
      throw error;
    }
  }
} 