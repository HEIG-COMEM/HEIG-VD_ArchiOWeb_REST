import mongoose from 'mongoose';
import * as config from '../config.js';

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    oneSignalNotificationId: {
        type: String,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
});

const oneSignalNotification = async (mongoNotif) => {
    const url = 'https://api.onesignal.com/notifications?c=push';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            Authorization: `Key ${config.onesignalRestApiKey}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            app_id: config.onesignalAppId,
            contents: { en: mongoNotif.content },
            included_segments: ['Total Subscriptions'],
            small_icon:
                'https://res.cloudinary.com/dsfssjubh/image/upload/v1736975785/logo_czekgx.png',
            large_icon:
                'https://res.cloudinary.com/dsfssjubh/image/upload/v1736975785/logo_czekgx.png',
            chrome_web_icon:
                'https://res.cloudinary.com/dsfssjubh/image/upload/v1736975785/logo_czekgx.png',
            chrome_web_badge:
                'https://res.cloudinary.com/dsfssjubh/image/upload/v1736975785/logo_czekgx.png',
        }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    return data.id;
};

notificationSchema.pre('save', async function (next) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const count = await Notification.countDocuments({
        _id: { $ne: this._id },
        type: 'bereal', // Type of the notification to tell users to take their bereal
        sentAt: { $gte: today, $lt: tomorrow },
    });
    if (count > 0) {
        throw new Error('notification already sent today');
    }

    const notificationId = await oneSignalNotification(this);
    if (!notificationId) {
        throw new Error('failed to send notification');
    }
    this.oneSignalNotificationId = notificationId;

    next();
});

notificationSchema.set('toJSON', {
    transform: transformJsonNotification,
});

function transformJsonNotification(doc, json, options) {
    delete json.__v;
    return json;
}

const Notification = mongoose.model(
    'Notification',
    notificationSchema,
    'notifications'
);
export default Notification;
