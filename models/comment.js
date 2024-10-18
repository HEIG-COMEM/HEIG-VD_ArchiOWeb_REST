import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for comments
const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    publication: {
        type: Schema.Types.ObjectId,
        ref: 'Publication',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
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

// Middleware to update the updatedAt field
commentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to remove all descendant comments when a comment is deleted
commentSchema.pre('deleteOne', { document: true }, async function(next) {
    await this.removeDescendants();
    next();
});

// Method to remove all descendant comments
commentSchema.methods.removeDescendants = async function() {
    await this.model('Comment').deleteMany({ parentComment: this._id });
}

export default mongoose.model('Comment', commentSchema, 'comments');