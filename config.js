import * as dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const mongoUri = process.env.MONGO_URI;
export const secretKey = process.env.SECRET_KEY;
export const baseUrl = process.env.BASE_URL;

if (!secretKey) {
    console.error('Please set the SECRET_KEY environment variable');
    process.exit(1);
}

if (!mongoUri) {
    console.error('Please set the MONGO_URI environment variable');
    process.exit(1);
}
