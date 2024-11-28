// https://dev.to/amnish04/integrating-cloud-storage-for-image-uploads-4164
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const bufferUpload = async ({ option = {}, buffer } = {}) => {
    return await new Promise((resolve) => {
        cloudinary.uploader
            .upload_stream(option, async (error, result) => {
                if (error) {
                    return res
                        .status(500)
                        .json({ error, message: 'Buffer upload failed' });
                }
                return resolve(result);
            })
            .end(buffer);
    });
};

export const deleteImage = async (public_id) => {
    return await cloudinary.uploader.destroy(public_id);
};
