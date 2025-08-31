import { db } from '../firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";

class NotificationService {
  private checkInterval: number | null = null;
  private worker: Worker | null = null;
  private messageListeners: ((payload: any) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  private async initializeService() {
    try {
      if ('Notification' in window) {
        // Initialize web worker for background checks
        this.worker = new Worker(new URL('../workers/notification.worker.ts', import.meta.url));
        this.worker.onmessage = (event) => {
          if (event.data.type === 'notification') {
            this.showNotification(event.data.title, event.data.body);
            // Notify all listeners
            this.messageListeners.forEach(listener => listener(event.data));
          }
        };
      }
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  setupMessageListener(callback: (payload: any) => void) {
    if (typeof callback === 'function') {
      this.messageListeners.push(callback);
    }
    return () => {
      // Return cleanup function
      this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
    };
  }

  async requestPermission() {
    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        console.log('Notifications are blocked by the user');
        return false;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Also register service worker for background notifications
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async setupNotificationSchedule(userId: string, babyId: string, schedule: NotificationSchedule) {
    try {
      // Save schedule to local storage
      const scheduleData = {
        ...schedule,
        userId,
        babyId,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(
        `notification_schedule_${userId}_${babyId}`, 
        JSON.stringify(scheduleData)
      );

      // Update worker with new schedule
      if (this.worker) {
        this.worker.postMessage({
          type: 'updateSchedule',
          data: scheduleData
        });
      }

      // Save to Firestore with proper permissions
      const scheduleRef = doc(db, 'notificationSchedules', `${userId}_${babyId}`);
      await setDoc(scheduleRef, {
        ...schedule,
        userId,
        babyId,
        updatedAt: new Date(),
        createdAt: new Date(), // Add creation date
        enabled: schedule.enabled || false,
        type: 'notification_schedule', // Add document type
        version: '1.0' // Add version for future updates
      }, { merge: true }); // Use merge to update existing documents

      return true;
    } catch (error) {
      console.error('Error saving notification schedule:', error);
      // Still return true if local storage was successful
      return true;
    }
  }

  async loadSchedule(userId: string, babyId: string): Promise<NotificationSchedule | null> {
    try {
      // Try to load from Firestore first
      const scheduleRef = doc(db, 'notificationSchedules', `${userId}_${babyId}`);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (scheduleDoc.exists()) {
        return scheduleDoc.data() as NotificationSchedule;
      }

      // Fall back to local storage
      const localSchedule = localStorage.getItem(`notification_schedule_${userId}_${babyId}`);
      if (localSchedule) {
        return JSON.parse(localSchedule);
      }

      return null;
    } catch (error) {
      console.error('Error loading notification schedule:', error);
      // Try local storage as fallback
      const localSchedule = localStorage.getItem(`notification_schedule_${userId}_${babyId}`);
      return localSchedule ? JSON.parse(localSchedule) : null;
    }
  }

  private startNotificationChecks(userId: string, babyId: string) {
    // Stop any existing interval
    this.stopNotificationChecks();

    // Start new interval
    this.checkInterval = window.setInterval(() => {
      this.checkNotifications(userId, babyId);
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private stopNotificationChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkNotifications(userId: string, babyId: string) {
    const scheduleStr = localStorage.getItem(`notification_schedule_${userId}_${babyId}`);
    if (!scheduleStr) return;

    const schedule: NotificationSchedule & { updatedAt: string } = JSON.parse(scheduleStr);
    if (!schedule.enabled) return;

    // Check if we're in quiet hours
    const now = new Date();
    const currentHour = now.getHours();
    const quietStart = parseInt(schedule.quietHours.start.split(':')[0]);
    const quietEnd = parseInt(schedule.quietHours.end.split(':')[0]);
    
    if (currentHour >= quietStart || currentHour < quietEnd) return;

    // Get last activities
    const lastActivities = JSON.parse(localStorage.getItem(`last_activities_${babyId}`) || '{}');

    // Check feeding interval
    if (lastActivities.lastFeed) {
      const lastFeedTime = new Date(lastActivities.lastFeed);
      const minutesSinceLastFeed = (now.getTime() - lastFeedTime.getTime()) / 1000 / 60;
      
      if (minutesSinceLastFeed >= schedule.feedingIntervals) {
        this.showNotification(
          'Feeding Reminder',
          'It might be time for the next feeding'
        );
      }
    }

    // Check diaper interval
    if (lastActivities.lastDiaper) {
      const lastDiaperTime = new Date(lastActivities.lastDiaper);
      const minutesSinceLastDiaper = (now.getTime() - lastDiaperTime.getTime()) / 1000 / 60;
      
      if (minutesSinceLastDiaper >= schedule.diaperCheckIntervals) {
        this.showNotification(
          'Diaper Check Reminder',
          'Time to check the diaper'
        );
      }
    }
  }

  private async showNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'baby-diary-notification',
        renotify: true,
      });
    }
  }

  updateLastActivity(babyId: string, userId: string, type: string) {
    const lastActivities = JSON.parse(localStorage.getItem(`last_activities_${babyId}`) || '{}');
    lastActivities[`last${type.charAt(0).toUpperCase() + type.slice(1)}`] = new Date().toISOString();
    localStorage.setItem(`last_activities_${babyId}`, JSON.stringify(lastActivities));

    // Update worker with new activity
    if (this.worker) {
      this.worker.postMessage({
        type: 'updateActivity',
        data: {
          userId,
          babyId,
          activityType: type,
        }
      });
    }
  }

  cleanup() {
    if (this.worker) {
      this.worker.postMessage({ type: 'clearData' });
      this.worker.terminate();
      this.worker = null;
    }
    this.messageListeners = [];
  }
}

export interface NotificationSchedule {
  feedingIntervals: number;
  diaperCheckIntervals: number;
  sleepReminders: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  enabled: boolean;
}

export const notificationService = new NotificationService(); 