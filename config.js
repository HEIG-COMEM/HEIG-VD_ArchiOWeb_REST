import * as dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const mongoUri = process.env.MONGO_URI;
export const secretKey = process.env.SECRET_KEY;
export const baseUrl = process.env.BASE_URL;
export const onesignalAppId = process.env.ONESIGNAL_APP_ID;
export const onesignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY;
export const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
export const cloudinaryPrefix = process.env.NODE_ENV === 'test' ? 'test-' : '';
export const cloudinaryTags = process.env.NODE_ENV === 'test' ? 'test' : '';
export const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
export const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
export const cors = {
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS || 200,
};

if (!secretKey) {
    console.error('Please set the SECRET_KEY environment variable');
    process.exit(1);
}

if (!mongoUri) {
    console.error('Please set the MONGO_URI environment variable');
    process.exit(1);
}
