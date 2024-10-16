import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const publicationSchema = new Schema({
    frontCamera: {
        path: {
            type: String,
            required: true
        },
    },
    backCamera: {
        path: {
            type: String,
            required: true
        },
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Publication', publicationSchema, 'publications');