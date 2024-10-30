import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const Schema = mongoose.Schema;

const publicationSchema = new Schema({
    frontCamera: {
        path: {
            type: String,
            required: true,
        },
    },
    backCamera: {
        path: {
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

// Middleware to update the updatedAt field
publicationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to remove the images when a publication is deleted
publicationSchema.pre('deleteOne', { document: true }, async function (next) {
    await this.removeImages();
    next();
});

publicationSchema.methods.removeImages = async function () {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    await fs.unlink(path.join(__dirname, '..', this.frontCamera.path));
    await fs.unlink(path.join(__dirname, '..', this.backCamera.path));
};

export default mongoose.model('Publication', publicationSchema, 'publications');
