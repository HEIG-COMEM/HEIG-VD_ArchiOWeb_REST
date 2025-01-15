import Notification from '../models/notification.js';
import { asyncHandler } from '../utils/wrapper.js';

export const sendBeRealNotification = asyncHandler(async (req, res) => {
    const notification = new Notification({
        content: 'Time to be real',
        type: 'bereal',
    });
    let notif = null;
    try {
        notif = await notification.save();
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }

    res.status(201).json(notif);
});

export const getNotification = asyncHandler(async (req, res) => {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
});
