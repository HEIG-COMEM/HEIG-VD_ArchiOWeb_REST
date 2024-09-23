import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema for users
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: async function (email) {
                const user = await this.constructor.findOne({ email });
                return !user || this.id === user.id;
            },
            message: props => 'The specified email address is already in use.'
        },
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: async function (phone) {
                const user = await this.constructor.findOne({ phone });
                return !user || this.id === user.id;

            },
            message: props => 'The specified phone number is already in use.'
        },
    },
    role: {
        type: String,
        enum: ['employer', 'job_seeker'],
        required: true
    },
    profilePictureUrl: {
        type: String,
        default: 'default.jpg'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.set("toJSON", {
    transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
    // Remove the hashed password from the generated JSON.
    delete json.password;
    return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema, 'users');