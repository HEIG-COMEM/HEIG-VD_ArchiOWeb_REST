import Notification from '../models/notification.js';
import { asyncHandler } from '../utils/wrapper.js';

export const sendBeRealNotification = asyncHandler(async (req, res) => {
    const notification = new Notification({
        content: 'Time to be real',
        type: 'bereal',
    });
    const notif = await notification.save();

    if (!notif) {
        return res.status(500).json({ message: 'Failed to send notification' });
    }

    res.status(201).json(notif);
});
