import mongoose from 'mongoose';
import { deleteImage } from '../controllers/cdn.js';
const Schema = mongoose.Schema;

const publicationSchema = new Schema({
    frontCamera: {
        url: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
    },
    backCamera: {
        url: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

publicationSchema.set('toJSON', {
    transform: transformJsonPublication,
});

function transformJsonPublication(doc, json, options) {
    // Remove the __v field
    delete json.__v;
    return json;
}

// Middleware to update the updatedAt field
publicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to remove the images when a publication is deleted
publicationSchema.pre('deleteOne', { document: true }, async function (next) {
    const frontCamera = this.frontCamera;
    const backCamera = this.backCamera;
    try {
        await deleteImage(frontCamera.id);
        await deleteImage(backCamera.id);
        this.frontCamera = null;
        this.backCamera = null;
        next();
    } catch (error) {
        next(error);
    }
});

const Publication = mongoose.model(
    'Publication',
    publicationSchema,
    'publications'
);
export default Publication;
