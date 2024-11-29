import * as config from '../config.js';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
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
