"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndSendNotifications = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.checkAndSendNotifications = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
    var _a;
    const now = new Date();
    const db = admin.firestore();
    const messaging = admin.messaging();
    // Get all notification schedules
    const schedulesSnapshot = await db.collection('notificationSchedules').get();
    for (const doc of schedulesSnapshot.docs) {
        const schedule = doc.data();
        if (!schedule.enabled)
            continue;
        // Check if it's within quiet hours
        const currentHour = now.getHours();
        const quietStart = parseInt(schedule.quietHours.start.split(':')[0]);
        const quietEnd = parseInt(schedule.quietHours.end.split(':')[0]);
        if (currentHour >= quietStart || currentHour < quietEnd)
            continue;
        // Get user's FCM token
        const userDoc = await db.collection('users').doc(schedule.userId).get();
        const fcmToken = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmTokens;
        if (!fcmToken)
            continue;
        // Get last activities
        const activitiesSnapshot = await db
            .collection('activities')
            .where('babyId', '==', schedule.babyId)
            .orderBy('startTime', 'desc')
            .limit(1)
            .get();
        if (activitiesSnapshot.empty)
            continue;
        const lastActivity = activitiesSnapshot.docs[0].data();
        const lastActivityTime = lastActivity.startTime.toDate();
        const minutesSinceLastActivity = (now.getTime() - lastActivityTime.getTime()) / 1000 / 60;
        // Check feeding interval
        if (lastActivity.type === 'feed' && minutesSinceLastActivity >= schedule.feedingIntervals) {
            await messaging.send({
                token: fcmToken,
                notification: {
                    title: 'Feeding Reminder',
                    body: 'It might be time for the next feeding',
                },
                data: {
                    type: 'feed',
                    babyId: schedule.babyId,
                },
            });
        }
        // Check diaper interval
        if (lastActivity.type === 'diaper' && minutesSinceLastActivity >= schedule.diaperCheckIntervals) {
            await messaging.send({
                token: fcmToken,
                notification: {
                    title: 'Diaper Check Reminder',
                    body: 'Time to check the diaper',
                },
                data: {
                    type: 'diaper',
                    babyId: schedule.babyId,
                },
            });
        }
    }
});
//# sourceMappingURL=index.js.map