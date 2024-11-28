import mongoose from 'mongoose';
import * as config from '../config.js';
import * as OneSignal from '@onesignal/node-onesignal';

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

const app_key_provider = {
    getToken() {
        return config.onesignalRestApiKey;
    },
};

const configuration = OneSignal.createConfiguration({
    authMethods: {
        app_key: {
            tokenProvider: app_key_provider,
        },
    },
});

const client = new OneSignal.DefaultApi(configuration);

const oneSignalNotification = async (mongoNotif) => {
    const notification = new OneSignal.Notification();
    notification.app_id = config.onesignalAppId;
    notification.included_segments = ['Subscribed Users'];
    notification.contents = {
        en: mongoNotif.content,
    };

    // TODO: Uncomment this line to send the notification, only once the OneSignal account is set up
    // const { id } = await client.createNotification(notification);
    // return id;
    return '12345';
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

    this.oneSignalNotificationId = await oneSignalNotification(this);

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
