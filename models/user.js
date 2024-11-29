import mongoose from 'mongoose';
import { validate } from 'uuid';
const Schema = mongoose.Schema;
import bcrypt from 'bcrypt';
const COST_FACTOR = 10;

// Define the schema for users
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function (name) {
                // Check if the name is valid
                const nameRegex =
                    /^[a-zA-Z0-9](?:[a-zA-Z0-9._]*[a-zA-Z0-9]){1,29}$/;
                return nameRegex.test(name);
            },
            message: (props) =>
                //display name
                `The name "${props.value}" is not valid. It must be between 2 and 30 characters long and can only contain letters, numbers, dots, and underscores. It cannot start or end with dots or underscores.`,
        },
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: async function (email) {
                // Check if the email is valid
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return false;
                }
                // Check if the email is already in use by another user
                const user = await this.constructor.findOne({ email });
                return !user || this.id === user.id;
            },
            message: (props) =>
                'The email address is invalid or already in use by another user.',
        },
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    profilePictureUrl: {
        type: String,
        default: 'default.jpg',
        // validate: {
        //     validator: function (url) {
        //         // Check if the URL is valid
        //         const urlRegex = /^(http|https):\/\/[^ "]+$/;
        //         return urlRegex.test(url);
        //     },
        //     message: (props) => 'The URL provided is invalid.',
        // },
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
userSchema.pre('save', function (next) {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (user.isModified('password')) {
        // Hash the password
        user.password = User.hashPassword(user.password);
    }
    this.updatedAt = Date.now();
    next();
});

userSchema.set('toJSON', {
    transform: transformJsonUser,
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, COST_FACTOR);
};

function transformJsonUser(doc, json, options) {
    // Remove the hashed password from the generated JSON.
    delete json.password;
    // Remove the __v field
    delete json.__v;
    return json;
}

// Create the model from the schema and export it
const User = mongoose.model('User', userSchema, 'users');
export default User;
