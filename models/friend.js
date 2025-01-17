import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for friendships
const friendSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    ],
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending',
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Custom validation for users array length
friendSchema.path('users').validate(function (users) {
    return users.length === 2;
}, 'A friendship must have exactly two users');

// Ensure that the combination of users is unique
friendSchema.index({ 'users.0': 1, 'users.1': 1 }, { unique: true });

// Ensure bidirectional friendship
friendSchema.statics.addFriend = async function (userId, friendId) {
    try {
        // Sort the user IDs to ensure uniqueness
        const users = [userId, friendId].sort();
        await this.create({ users, requester: userId, status: 'pending' });
        return this.findOne({ users }).populate('users');
    } catch (error) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            throw new Error('The friendship already exists');
        }
        throw error;
    }
};

// Set toJSON transformation
friendSchema.set('toJSON', {
    transform: transformJsonFriend,
});

function transformJsonFriend(doc, json, options) {
    // Remove the __v field
    delete json.__v;
    return json;
}

const Friend = mongoose.model('Friend', friendSchema, 'friends');
Friend.syncIndexes(); // Ensure indexes are created

export default Friend;
