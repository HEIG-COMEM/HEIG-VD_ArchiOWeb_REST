import { bufferUpload } from '../controllers/cdn.js';
import * as config from '../config.js';

// function to handle image upload
const uploadImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image is required.' });
    }
    try {
        const option = req.cdn.uploadOptions || { resource_type: 'image' };
        const result = await bufferUpload({
            option,
            buffer: req.file.buffer,
        });
        req.image = result;
        //next();
    } catch (error) {
        res.status(500).json({ error, message: 'Image upload failed' });
    }
};

// function to get mutliple images
const uploadImages = async (req, res, next) => {
    if (!req.files) {
        return res.status(400).json({ message: 'Images are required.' });
    }
    const uplaodPromises = [];
    const option = req.cdn.uploadOptions || { resource_type: 'image' };
    for (const key in req.files) {
        uplaodPromises.push(
            bufferUpload({
                option,
                buffer: req.files[key][0].buffer,
            }).then((result) => {
                return {
                    name: key,
                    url: result.secure_url,
                    upload_repsonse: result,
                };
            })
        );
    }
    try {
        const results = await Promise.all(uplaodPromises);
        req.images = new Object();
        results.forEach((result) => {
            Object.defineProperty(req.images, result.name, {
                value: {
                    url: result.url,
                    upload_repsonse: result.upload_repsonse,
                },
                writable: true,
                enumerable: true,
            });
        });
        //next();
    } catch (error) {
        res.status(500).json({ error, message: 'Images upload failed' });
    }
};

// function to upload publications images
const uploadPublicationImages = async (req, res, next) => {
    if (!req.files) {
        return res.status(400).json({ message: 'Images are required.' });
    }

    if (!req.files['frontCamera'] || !req.files['backCamera']) {
        return res.status(400).json({ message: 'Images are required.' });
    }

    Object.defineProperty(req, 'cdn', {
        value: {},
        writable: true,
        enumerable: true,
    });
    Object.defineProperty(req.cdn, 'uploadOptions', {
        value: {},
        writable: true,
        enumerable: true,
    });
    req.cdn.uploadOptions = {
        resource_type: 'image',
        asset_folder: `${config.cloudinaryPrefix}publications`,
        tags: config.cloudinaryTags,
        aspect_ratio: '2:3',
        crop: 'auto',
        gravity: 'auto',
        format: 'webp',
        height: 1080,
        quality: 'auto:good',
    };
    await uploadImages(req, res, next);
    next();
};

const uploadUserImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    Object.defineProperty(req, 'cdn', {
        value: {},
        writable: true,
        enumerable: true,
    });
    Object.defineProperty(req.cdn, 'uploadOptions', {
        value: {},
        writable: true,
        enumerable: true,
    });
    req.cdn.uploadOptions = {
        resource_type: 'image',
        asset_folder: `${config.cloudinaryPrefix}users`,
        tags: config.cloudinaryTags,
        aspect_ratio: '1:1',
        radius: 'max',
        crop: 'auto',
        gravity: 'auto:faces',
        format: 'webp',
        height: 200,
        quality: 'auto:good',
    };
    await uploadImage(req, res, next);
    req.body.profilePicture = {
        url: req.image.secure_url,
        id: req.image.public_id,
    };
    next();
};

export { uploadPublicationImages, uploadUserImage };
