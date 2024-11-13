const checkInterval = 5 * 60 * 1000; // 5 minutes

interface NotificationSchedule {
  feedingIntervals: number;
  diaperCheckIntervals: number;
  sleepReminders: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  enabled: boolean;
  userId: string;
  babyId: string;
  updatedAt: string;
}

interface LastActivities {
  lastFeed?: string;
  lastDiaper?: string;
  lastSleep?: string;
}

let activeSchedules: { [key: string]: NotificationSchedule } = {};
let lastActivities: { [key: string]: LastActivities } = {};

// Function to check notifications based on schedule
const checkNotifications = () => {
  const now = new Date();
  const currentHour = now.getHours();

  Object.values(activeSchedules).forEach(schedule => {
    if (!schedule.enabled) return;

    // Check quiet hours
    const quietStart = parseInt(schedule.quietHours.start.split(':')[0]);
    const quietEnd = parseInt(schedule.quietHours.end.split(':')[0]);
    
    if (currentHour >= quietStart || currentHour < quietEnd) return;

    const activities = lastActivities[`${schedule.userId}_${schedule.babyId}`] || {};

    // Check feeding interval
    if (activities.lastFeed) {
      const lastFeedTime = new Date(activities.lastFeed);
      const minutesSinceLastFeed = (now.getTime() - lastFeedTime.getTime()) / 1000 / 60;
      
      if (minutesSinceLastFeed >= schedule.feedingIntervals) {
        postMessage({
          type: 'notification',
          title: 'Feeding Reminder',
          body: 'It might be time for the next feeding',
          activityType: 'feed',
          babyId: schedule.babyId
        });
      }
    }

    // Check diaper interval
    if (activities.lastDiaper) {
      const lastDiaperTime = new Date(activities.lastDiaper);
      const minutesSinceLastDiaper = (now.getTime() - lastDiaperTime.getTime()) / 1000 / 60;
      
      if (minutesSinceLastDiaper >= schedule.diaperCheckIntervals) {
        postMessage({
          type: 'notification',
          title: 'Diaper Check Reminder',
          body: 'Time to check the diaper',
          activityType: 'diaper',
          babyId: schedule.babyId
        });
      }
    }

    // Check sleep reminders if enabled
    if (schedule.sleepReminders && activities.lastSleep) {
      const lastSleepTime = new Date(activities.lastSleep);
      const hoursSinceLastSleep = (now.getTime() - lastSleepTime.getTime()) / 1000 / 60 / 60;
      
      if (hoursSinceLastSleep >= 3) { // Suggest sleep after 3 hours of being awake
        postMessage({
          type: 'notification',
          title: 'Sleep Reminder',
          body: 'Your baby might be getting tired',
          activityType: 'sleep',
          babyId: schedule.babyId
        });
      }
    }
  });
};

// Start periodic checks
setInterval(checkNotifications, checkInterval);

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'updateSchedule':
      const scheduleKey = `${data.userId}_${data.babyId}`;
      activeSchedules[scheduleKey] = data;
      break;

    case 'removeSchedule':
      const removeKey = `${data.userId}_${data.babyId}`;
      delete activeSchedules[removeKey];
      break;

    case 'updateActivity':
      const activityKey = `${data.userId}_${data.babyId}`;
      lastActivities[activityKey] = {
        ...lastActivities[activityKey],
        [`last${data.activityType.charAt(0).toUpperCase() + data.activityType.slice(1)}`]: new Date().toISOString()
      };
      break;

    case 'clearData':
      activeSchedules = {};
      lastActivities = {};
      break;
  }
});

// Export empty object to satisfy TypeScript module requirements
export {}; 