import { upload } from '../middlewares/upload.js';

export const loadPublicationImages = upload.fields([
    { name: 'frontCamera', maxCount: 1 },
    { name: 'backCamera', maxCount: 1 },
]);
