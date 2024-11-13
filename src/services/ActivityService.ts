import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  CollectionReference,
  Timestamp 
} from 'firebase/firestore';
import { Activity } from '../models/Activity';

export class ActivityService {
  private collection: CollectionReference;

  constructor() {
    this.collection = collection(db, 'activities');
  }

  async addActivity(activity: Activity): Promise<string> {
    try {
      if (!activity.userId) {
        throw new Error('User ID is required');
      }

      const docRef = await addDoc(this.collection, {
        ...activity.toJSON(),
        startTime: Timestamp.fromDate(activity.startTime),
        endTime: activity.endTime ? Timestamp.fromDate(activity.endTime) : null,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  async updateActivity(id: string, activity: Activity): Promise<void> {
    try {
      if (!activity.userId) {
        throw new Error('User ID is required');
      }

      const docRef = doc(this.collection, id);
      await updateDoc(docRef, {
        ...activity.toJSON(),
        startTime: Timestamp.fromDate(activity.startTime),
        endTime: activity.endTime ? Timestamp.fromDate(activity.endTime) : null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(id: string, userId: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const docRef = doc(this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  async getActivities(
    babyId: string,
    userId: string,
    type: string | null = null,
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<Activity[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Simpler query while index is building
      const q = query(
        this.collection,
        where('babyId', '==', babyId),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      let activities = querySnapshot.docs.map(doc => 
        Activity.fromJSON(doc.data(), doc.id)
      );

      // Sort and filter in memory
      activities.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      if (type) {
        activities = activities.filter(activity => activity.type === type);
      }
      if (startDate) {
        activities = activities.filter(activity => activity.startTime >= startDate);
      }
      if (endDate) {
        activities = activities.filter(activity => activity.startTime <= endDate);
      }

      return activities;
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  }
} 